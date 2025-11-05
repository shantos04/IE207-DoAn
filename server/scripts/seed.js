require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const { connectDB } = require('../config/db')
const User = require('../models/User')
const Product = require('../models/Product')
const Supplier = require('../models/Supplier')
const Customer = require('../models/Customer')

async function run() {
    await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_parts')
    console.log('Seeding data...')

    const adminEmail = 'admin@example.com'
    let admin = await User.findOne({ email: adminEmail })
    if (!admin) {
        admin = await User.create({ name: 'Admin', email: adminEmail, password: 'admin123', role: 'admin' })
        console.log('Created admin user:', adminEmail)
    }

    // Seed customer users
    const customerUsers = [
        { name: 'Nguyễn Văn A', email: 'customer1@example.com', password: 'customer123', role: 'customer', phone: '0901234567', address: 'Quận 1, TP.HCM' },
        { name: 'Trần Thị B', email: 'customer2@example.com', password: 'customer123', role: 'customer', phone: '0907654321', address: 'Quận 3, TP.HCM' },
    ]
    for (const u of customerUsers) {
        const existing = await User.findOne({ email: u.email })
        if (!existing) {
            await User.create(u)
            await Customer.create({ name: u.name, email: u.email, phone: u.phone, address: u.address, note: 'Tài khoản mẫu' })
            console.log('Created customer user:', u.email)
        }
    }

    // Seed suppliers
    const suppliers = [
        { name: 'Công ty Yageo Việt Nam', email: 'sales@yageo.vn', phone: '0281234567', address: 'KCN Tân Bình, TP.HCM' },
        { name: 'Murata Electronics', email: 'info@murata.com.vn', phone: '0287654321', address: 'KCN Linh Trung, TP.HCM' },
        { name: 'Texas Instruments VN', email: 'contact@ti.com.vn', phone: '0283456789', address: 'Quận 1, TP.HCM' },
    ]
    for (const s of suppliers) {
        await Supplier.updateOne({ email: s.email }, { $setOnInsert: s }, { upsert: true })
    }
    console.log('Seeded suppliers')

    // Seed customers
    const customers = [
        { name: 'Công ty TNHH Điện tử ABC', email: 'abc@electronics.vn', phone: '0909123456', address: 'Quận Tân Bình, TP.HCM' },
        { name: 'Xưởng sản xuất XYZ', email: 'xyz@manufacturing.vn', phone: '0912345678', address: 'Quận Bình Thạnh, TP.HCM' },
    ]
    for (const c of customers) {
        await Customer.updateOne({ email: c.email }, { $setOnInsert: c }, { upsert: true })
    }
    console.log('Seeded customers')

    const sampleProducts = [
        { name: 'Điện trở 10kΩ', sku: 'RES-10K-0207', partNumber: 'CF-10K-1%', brand: 'Yageo', category: 'Điện trở', price: 100, cost: 50, stock: 1000, reorderPoint: 200 },
        { name: 'Tụ gốm 100nF', sku: 'CAP-100NF-50V', partNumber: 'C0G-100nF', brand: 'Murata', category: 'Tụ điện', price: 200, cost: 100, stock: 500, reorderPoint: 100 },
        { name: 'IC 555 Timer', sku: 'IC-NE555', partNumber: 'NE555P', brand: 'TI', category: 'IC', price: 5000, cost: 3000, stock: 100, reorderPoint: 20 },
        { name: 'LED 5mm Đỏ', sku: 'LED-5MM-RED', partNumber: 'LED-RED-5', brand: 'Generic', category: 'LED', price: 500, cost: 200, stock: 2000, reorderPoint: 500 },
        { name: 'Transistor 2N2222', sku: 'TRS-2N2222', partNumber: '2N2222A', brand: 'Fairchild', category: 'Transistor', price: 1000, cost: 600, stock: 300, reorderPoint: 50 },
    ]

    for (const p of sampleProducts) {
        await Product.updateOne({ sku: p.sku }, { $setOnInsert: p }, { upsert: true })
    }
    console.log('Seeded products')

    process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })