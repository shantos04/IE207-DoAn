const Order = require('../models/Order')
const Product = require('../models/Product')
const InventoryMovement = require('../models/InventoryMovement')

exports.list = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query
        const filter = status ? { status } : {}

        // Nếu user là customer, chỉ xem đơn hàng của mình
        if (req.user.role === 'customer') {
            const Customer = require('../models/Customer')
            const User = require('../models/User')
            const user = await User.findById(req.user.sub)
            const customer = await Customer.findOne({ email: user.email })
            if (customer) {
                filter.customer = customer._id
            } else {
                return res.json({ items: [], total: 0 })
            }
        }

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
        let { customer, items, note } = req.body

        // Nếu user là customer, tự động gán customer từ email
        if (req.user.role === 'customer') {
            const Customer = require('../models/Customer')
            const User = require('../models/User')
            const user = await User.findById(req.user.sub)
            const customerDoc = await Customer.findOne({ email: user.email })
            if (!customerDoc) {
                return res.status(400).json({ message: 'Customer profile not found' })
            }
            customer = customerDoc._id
        }

        if (!customer) {
            return res.status(400).json({ message: 'Customer is required' })
        }

        // Validate stock và calculate total
        let total = 0
        for (const item of items) {
            const product = await Product.findById(item.product)
            if (!product) return res.status(400).json({ message: `Product ${item.product} not found` })

            // Kiểm tra tồn kho
            if (product.stock <= 0) {
                return res.status(400).json({ message: `Product ${product.name} is out of stock` })
            }
            if (product.stock < item.qty) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}` })
            }

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

// Customer self-cancel draft order
exports.cancelForCustomer = async (req, res, next) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Chỉ khách hàng mới có thể hủy đơn của mình' })
        }
        const order = await Order.findById(req.params.id)
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })

        // Resolve current customer profile from token
        const Customer = require('../models/Customer')
        const User = require('../models/User')
        const user = await User.findById(req.user.sub)
        const customer = await Customer.findOne({ email: user.email })
        if (!customer) return res.status(400).json({ message: 'Không tìm thấy hồ sơ khách hàng' })

        if (order.customer.toString() !== customer._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền hủy đơn này' })
        }
        // Cho phép hủy nếu trạng thái là draft hoặc confirmed (chưa giao hàng)
        if (!['draft', 'confirmed'].includes(order.status)) {
            return res.status(400).json({ message: 'Không thể hủy đơn đã giao hoặc hoàn thành' })
        }

        // Nếu đã xác nhận (đã trừ tồn kho), cần hoàn trả tồn kho
        if (order.status === 'confirmed') {
            const populated = await Order.findById(order._id).populate('items.product')
            for (const item of populated.items) {
                await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: item.qty } })
                await InventoryMovement.create({
                    type: 'in',
                    product: item.product._id,
                    qty: item.qty,
                    refType: 'Order',
                    refId: order._id.toString(),
                    note: `Hoàn trả tồn kho do khách hủy đơn hàng ${order.code}`,
                })
            }
        }

        order.status = 'canceled'
        await order.save()
        res.json(order)
    } catch (e) { next(e) }
}
