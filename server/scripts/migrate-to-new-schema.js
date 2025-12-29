/**
 * Migration Script for ERP Database Updates
 * 
 * Chạy script này để cập nhật database hiện có theo cấu trúc mới
 * Run: node server/scripts/migrate-to-new-schema.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const { connectDB } = require('../config/db')
const Product = require('../models/Product')
const Customer = require('../models/Customer')
const Order = require('../models/Order')

async function migrate() {
    try {
        await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_parts')
        console.log('🔄 Starting migration...\n')

        // 1. Migrate Products
        console.log('📦 Migrating Products...')
        const products = await Product.find({})
        let productCount = 0

        for (const product of products) {
            let updated = false

            // Add minStockLevel if not exists
            if (product.minStockLevel === undefined) {
                product.minStockLevel = product.reorderPoint || 10
                updated = true
            }

            // Add status if not exists
            if (!product.status) {
                product.status = product.stock <= 0 ? 'out_of_stock' : 'available'
                updated = true
            }

            // Add manufacturer if not exists
            if (!product.manufacturer && product.brand) {
                product.manufacturer = product.brand
                updated = true
            }

            // Add specifications if not exists
            if (!product.specifications) {
                product.specifications = {}
                updated = true
            }

            if (updated) {
                await product.save()
                productCount++
            }
        }
        console.log(`✅ Updated ${productCount} products\n`)

        // 2. Migrate Customers
        console.log('👥 Migrating Customers...')
        const customers = await Customer.find({})
        let customerCount = 0

        for (const customer of customers) {
            let updated = false

            // Add customerType if not exists
            if (!customer.customerType) {
                customer.customerType = 'individual'
                updated = true
            }

            // Add creditLimit if not exists
            if (customer.creditLimit === undefined) {
                customer.creditLimit = 0
                updated = true
            }

            // Add totalSpent if not exists
            if (customer.totalSpent === undefined) {
                customer.totalSpent = 0
                updated = true
            }

            if (updated) {
                await customer.save()
                customerCount++
            }
        }
        console.log(`✅ Updated ${customerCount} customers\n`)

        // 3. Migrate Orders
        console.log('📋 Migrating Orders...')
        const orders = await Order.find({})
        let orderCount = 0

        for (const order of orders) {
            let updated = false

            // Add paymentMethod if not exists
            if (!order.paymentMethod) {
                order.paymentMethod = 'cash'
                updated = true
            }

            // Add paymentStatus if not exists
            if (!order.paymentStatus) {
                order.paymentStatus = 'unpaid'
                updated = true
            }

            // Add paidAmount if not exists
            if (order.paidAmount === undefined) {
                order.paidAmount = 0
                updated = true
            }

            // Add discount, tax, shippingFee if not exists
            if (order.discount === undefined) {
                order.discount = 0
                updated = true
            }
            if (order.tax === undefined) {
                order.tax = 0
                updated = true
            }
            if (order.shippingFee === undefined) {
                order.shippingFee = 0
                updated = true
            }

            // Add subtotal to items if not exists
            if (order.items && order.items.length > 0) {
                let itemsUpdated = false
                order.items.forEach(item => {
                    if (item.subtotal === undefined) {
                        item.subtotal = item.qty * item.price
                        itemsUpdated = true
                    }
                })
                if (itemsUpdated) {
                    updated = true
                }
            }

            // Update status 'shipped' to 'processing' if needed (optional)
            // if (order.status === 'shipped') {
            //     order.status = 'processing'
            //     updated = true
            // }

            if (updated) {
                await order.save()
                orderCount++
            }
        }
        console.log(`✅ Updated ${orderCount} orders\n`)

        console.log('✨ Migration completed successfully!')
        console.log('\nSummary:')
        console.log(`- Products updated: ${productCount}`)
        console.log(`- Customers updated: ${customerCount}`)
        console.log(`- Orders updated: ${orderCount}`)

        process.exit(0)
    } catch (error) {
        console.error('❌ Migration failed:', error)
        process.exit(1)
    }
}

migrate()
