const InventoryMovement = require('../models/InventoryMovement')
const Product = require('../models/Product')

exports.list = async (req, res, next) => {
    try {
        const { type, page = 1, limit = 20 } = req.query
        const filter = type ? { type } : {}
        const items = await InventoryMovement.find(filter)
            .populate('product', 'name sku')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
        const total = await InventoryMovement.countDocuments(filter)
        res.json({ items, total })
    } catch (e) { next(e) }
}

exports.create = async (req, res, next) => {
    try {
        const { type, product, qty, note } = req.body

        // Update product stock
        const productDoc = await Product.findById(product)
        if (!productDoc) return res.status(404).json({ message: 'Product not found' })

        const stockChange = type === 'in' ? qty : type === 'out' ? -qty : 0
        productDoc.stock += stockChange
        await productDoc.save()

        const movement = await InventoryMovement.create({ type, product, qty, note })
        res.status(201).json(movement)
    } catch (e) { next(e) }
}

exports.lowStock = async (req, res, next) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ['$stock', '$reorderPoint'] }
        }).sort({ stock: 1 })
        res.json(products)
    } catch (e) { next(e) }
}
