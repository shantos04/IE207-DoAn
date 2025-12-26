const Product = require('../models/Product')

exports.list = async (req, res, next) => {
    try {
        const { q, category, page = 1, limit = 20 } = req.query
        const filter = {}

        if (q) {
            filter.$or = [
                { name: new RegExp(q, 'i') },
                { sku: new RegExp(q, 'i') },
                { partNumber: new RegExp(q, 'i') },
            ]
        }

        if (category && category !== '') {
            filter.category = category
        }

        const items = await Product.find(filter)
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
        const item = await Product.create(req.body)
        res.status(201).json(item)
    } catch (e) { next(e) }
}

exports.update = async (req, res, next) => {
    try {
        const item = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!item) return res.status(404).json({ message: 'Not found' })
        res.json(item)
    } catch (e) { next(e) }
}

exports.remove = async (req, res, next) => {
    try {
        await Product.findByIdAndDelete(req.params.id)
        res.json({ ok: true })
    } catch (e) { next(e) }
}
