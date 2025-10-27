const Order = require('../models/Order')
const Product = require('../models/Product')
const InventoryMovement = require('../models/InventoryMovement')

exports.list = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query
        const filter = status ? { status } : {}
        const items = await Order.find(filter)
            .populate('customer', 'name email phone')
            .populate('items.product', 'name sku')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
        const total = await Order.countDocuments(filter)
        res.json({ items, total })
    } catch (e) { next(e) }
}

exports.get = async (req, res, next) => {
    try {
        const item = await Order.findById(req.params.id)
            .populate('customer', 'name email phone address')
            .populate('items.product', 'name sku brand price')
        if (!item) return res.status(404).json({ message: 'Not found' })
        res.json(item)
    } catch (e) { next(e) }
}

exports.create = async (req, res, next) => {
    try {
        const { customer, items, note } = req.body

        // Calculate total
        let total = 0
        for (const item of items) {
            const product = await Product.findById(item.product)
            if (!product) return res.status(400).json({ message: `Product ${item.product} not found` })
            total += item.qty * item.price
        }

        // Generate order code
        const count = await Order.countDocuments()
        const code = `ORD${String(count + 1).padStart(6, '0')}`

        const order = await Order.create({ code, customer, items, total, note, status: 'draft' })
        res.status(201).json(order)
    } catch (e) { next(e) }
}

exports.update = async (req, res, next) => {
    try {
        const item = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!item) return res.status(404).json({ message: 'Not found' })
        res.json(item)
    } catch (e) { next(e) }
}

exports.updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body
        const order = await Order.findById(req.params.id).populate('items.product')
        if (!order) return res.status(404).json({ message: 'Not found' })

        // If confirming order, check stock and create inventory movements
        if (status === 'confirmed' && order.status === 'draft') {
            for (const item of order.items) {
                const product = await Product.findById(item.product._id)
                if (product.stock < item.qty) {
                    return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
                }
            }

            // Reduce stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.qty } })
                await InventoryMovement.create({
                    type: 'out',
                    product: item.product._id,
                    qty: item.qty,
                    refType: 'Order',
                    refId: order._id.toString(),
                    note: `Xuất kho cho đơn hàng ${order.code}`,
                })
            }
        }

        order.status = status
        await order.save()
        res.json(order)
    } catch (e) { next(e) }
}

exports.remove = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
        if (order && order.status !== 'draft') {
            return res.status(400).json({ message: 'Cannot delete non-draft order' })
        }
        await Order.findByIdAndDelete(req.params.id)
        res.json({ ok: true })
    } catch (e) { next(e) }
}
