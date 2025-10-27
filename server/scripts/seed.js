require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const { connectDB } = require('../config/db')
const User = require('../models/User')
const Product = require('../models/Product')

async function run() {
    await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_parts')
    console.log('Seeding data...')

    const adminEmail = 'admin@example.com'
    let admin = await User.findOne({ email: adminEmail })
    if (!admin) {
        admin = await User.create({ name: 'Admin', email: adminEmail, password: 'admin123', role: 'admin' })
        console.log('Created admin user:', adminEmail)
    }

    const sampleProducts = [
        { name: 'Điện trở 10kΩ', sku: 'RES-10K-0207', partNumber: 'CF-10K-1%', brand: 'Yageo', price: 100, cost: 50, stock: 1000 },
        { name: 'Tụ gốm 100nF', sku: 'CAP-100NF-50V', partNumber: 'C0G-100nF', brand: 'Murata', price: 200, cost: 100, stock: 500 },
        { name: 'IC 555 Timer', sku: 'IC-NE555', partNumber: 'NE555P', brand: 'TI', price: 5000, cost: 3000, stock: 100 },
    ]

    for (const p of sampleProducts) {
        await Product.updateOne({ sku: p.sku }, { $setOnInsert: p }, { upsert: true })
    }
    console.log('Seeded products')

    process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
