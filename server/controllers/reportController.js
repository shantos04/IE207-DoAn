const Order = require('../models/Order')
const Product = require('../models/Product')
const InventoryMovement = require('../models/InventoryMovement')

exports.dashboard = async (req, res, next) => {
    try {
        const totalProducts = await Product.countDocuments()
        const outOfStock = await Product.countDocuments({ status: 'out_of_stock' })
        const lowStockCount = await Product.countDocuments({
            $expr: { $lte: ['$stock', '$minStockLevel'] },
            status: { $ne: 'out_of_stock' }
        })

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } })

        // Count orders pending processing (pending, processing, confirmed statuses)
        const ordersPending = await Order.countDocuments({
            status: { $in: ['pending', 'confirmed', 'processing'] }
        })

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const orders = await Order.find({
            createdAt: { $gte: thisMonth },
            status: { $in: ['confirmed', 'processing', 'shipped', 'completed'] }
        })
        const revenueThisMonth = orders.reduce((sum, o) => sum + o.total, 0)

        const topProducts = await Order.aggregate([
            { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'completed'] } } },
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalQty: { $sum: '$items.qty' }, totalRevenue: { $sum: '$items.subtotal' } } },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
        ])

        res.json({
            totalProducts,
            outOfStock,
            lowStockCount,
            ordersToday,
            ordersPending,
            revenueThisMonth,
            topProducts,
        })
    } catch (e) { next(e) }
}

exports.salesReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query
        const filter = { status: { $in: ['confirmed', 'processing', 'shipped', 'completed'] } }
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
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStockLevel)
        const outOfStock = products.filter(p => p.stock <= 0)

        res.json({ products, totalValue, lowStock, outOfStock })
    } catch (e) { next(e) }
}

// Daily revenue aggregation for chart (confirmed, shipped, completed treated as revenue)
exports.dailyRevenue = async (req, res, next) => {
    try {
        const { from, to } = req.query
        const end = to ? new Date(to) : new Date()
        const start = from ? new Date(from) : new Date(end.getTime() - 13 * 24 * 60 * 60 * 1000) // default 14 days window

        // Normalize to start of day
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)

        // Use timezone (Vietnam +07:00) for grouping to avoid date shifting
        const rows = await Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ['confirmed', 'processing', 'shipped', 'completed'] } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+07:00' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ])

        // Build continuous date series
        const map = Object.fromEntries(rows.map(r => [r._id, r]))
        const days = []
        const cursor = new Date(start)
        while (cursor <= end) {
            // Build key in local timezone +07:00
            const isoLocal = new Date(cursor.getTime() - cursor.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
            const key = isoLocal
            const row = map[key] || { _id: key, revenue: 0, orders: 0 }
            days.push({ date: key, revenue: row.revenue, orders: row.orders })
            cursor.setDate(cursor.getDate() + 1)
        }
        res.json({ from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10), days })
    } catch (e) { next(e) }
}

// Low stock alerts
exports.lowStockAlert = async (req, res, next) => {
    try {
        const lowStock = await Product.find({
            $expr: { $lte: ['$stock', '$minStockLevel'] },
            status: { $ne: 'discontinued' }
        })
            .sort({ stock: 1 })
            .populate('supplier', 'name email phone')

        res.json({ items: lowStock, count: lowStock.length })
    } catch (e) { next(e) }
}
