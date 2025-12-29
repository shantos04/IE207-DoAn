const Product = require('../models/Product')

exports.list = async (req, res, next) => {
    try {
        const { q, category, brand, status, lowStock, page = 1, limit = 20 } = req.query
        const filter = {}

        if (q) {
            filter.$or = [
                { name: new RegExp(q, 'i') },
                { sku: new RegExp(q, 'i') },
                { partNumber: new RegExp(q, 'i') },
                { manufacturer: new RegExp(q, 'i') },
            ]
        }

        if (category && category !== '') {
            filter.category = category
        }

        if (brand && brand !== '') {
            filter.brand = brand
        }

        if (status && status !== '') {
            filter.status = status
        }

        if (lowStock === 'true') {
            filter.$expr = { $lte: ['$stock', '$minStockLevel'] }
        }

        const items = await Product.find(filter)
            .populate('supplier', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
        const total = await Product.countDocuments(filter)
        res.json({ items, total })
    } catch (e) { next(e) }
}

exports.get = async (req, res, next) => {
    try {
        const item = await Product.findById(req.params.id)
        if (!item) return res.status(404).json({ message: 'Not found' })
        res.json(item)
    } catch (e) { next(e) }
}

exports.create = async (req, res, next) => {
    try {
        // Handle empty supplier
        const data = { ...req.body }
        if (!data.supplier || data.supplier === '') {
            data.supplier = null
        }
        const item = await Product.create(data)
        res.status(201).json(item)
    } catch (e) { next(e) }
}

exports.update = async (req, res, next) => {
    try {
        const { id } = req.params
        const { sku, supplier } = req.body

        // Check if SKU already exists in another product
        if (sku) {
            const existingProduct = await Product.findOne({ sku, _id: { $ne: id } })
            if (existingProduct) {
                return res.status(400).json({ message: 'SKU này đã tồn tại' })
            }
        }

        // Handle empty supplier (convert empty string to null)
        const updateData = { ...req.body }
        if (!supplier || supplier === '') {
            updateData.supplier = null
        }

        const item = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: false })
        if (!item) return res.status(404).json({ message: 'Not found' })
        res.json(item)
    } catch (e) {
        console.error('Update product error:', e)
        next(e)
    }
}

exports.remove = async (req, res, next) => {
    try {
        await Product.findByIdAndDelete(req.params.id)
        res.json({ ok: true })
    } catch (e) { next(e) }
}
