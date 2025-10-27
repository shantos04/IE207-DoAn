const Supplier = require('../models/Supplier')

exports.list = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 20 } = req.query
        const filter = q ? {
            $or: [
                { name: new RegExp(q, 'i') },
                { email: new RegExp(q, 'i') },
                { phone: new RegExp(q, 'i') },
            ]
        } : {}
        const items = await Supplier.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
        const total = await Supplier.countDocuments(filter)
        res.json({ items, total })
    } catch (e) { next(e) }
}

exports.get = async (req, res, next) => {
    try {
        const item = await Supplier.findById(req.params.id)
        if (!item) return res.status(404).json({ message: 'Not found' })
        res.json(item)
    } catch (e) { next(e) }
}

exports.create = async (req, res, next) => {
    try {
        const item = await Supplier.create(req.body)
        res.status(201).json(item)
    } catch (e) { next(e) }
}

exports.update = async (req, res, next) => {
    try {
        const item = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!item) return res.status(404).json({ message: 'Not found' })
        res.json(item)
    } catch (e) { next(e) }
}

exports.remove = async (req, res, next) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id)
        res.json({ ok: true })
    } catch (e) { next(e) }
}
