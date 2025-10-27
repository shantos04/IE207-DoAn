const Order = require('../models/Order')
const Product = require('../models/Product')
const InventoryMovement = require('../models/InventoryMovement')

exports.dashboard = async (req, res, next) => {
    try {
        const totalProducts = await Product.countDocuments()
        const lowStockCount = await Product.countDocuments({
            $expr: { $lte: ['$stock', '$reorderPoint'] }
        })

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } })

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const orders = await Order.find({
            createdAt: { $gte: thisMonth },
            status: { $in: ['confirmed', 'shipped', 'completed'] }
        })
        const revenueThisMonth = orders.reduce((sum, o) => sum + o.total, 0)

        const topProducts = await Order.aggregate([
            { $match: { status: { $in: ['confirmed', 'shipped', 'completed'] } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalQty: { $sum: '$items.qty' }, totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } } } },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
        ])

        res.json({
            totalProducts,
            lowStockCount,
            ordersToday,
            revenueThisMonth,
            topProducts,
        })
    } catch (e) { next(e) }
}

exports.salesReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query
        const filter = { status: { $in: ['confirmed', 'shipped', 'completed'] } }
        if (startDate) filter.createdAt = { $gte: new Date(startDate) }
        if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) }

        const orders = await Order.find(filter).populate('customer', 'name').populate('items.product', 'name sku')
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
        const totalOrders = orders.length

        res.json({ orders, totalRevenue, totalOrders })
    } catch (e) { next(e) }
}

exports.inventoryReport = async (req, res, next) => {
    try {
        const products = await Product.find().sort({ stock: 1 })
        const totalValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0)
        const lowStock = products.filter(p => p.stock <= p.reorderPoint)

        res.json({ products, totalValue, lowStock })
    } catch (e) { next(e) }
}
