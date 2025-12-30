require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const { connectDB } = require('../config/db')
const Product = require('../models/Product')

async function run() {
    await connectDB(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_parts')
    console.log('Updating product prices to market rates...')

    // Price mapping by category and SKU pattern (premium high-end prices)
    const priceMap = {
        'Điện trở': {
            '025W': 5000,     // 1/4W resistors: 4000-5500₫
            '05W': 7500,      // 1/2W resistors: 6000-8000₫
            '1W': 12000,      // 1W resistors: 10000-12000₫
            'default': 5000
        },
        'Tụ điện': {
            'nF': 15000,      // Ceramic capacitors: 15000-20000₫
            'µF': 50000,      // Aluminum electrolytic: 40000-60000₫
            'tantalum': 100000, // Tantalum: 80000-120000₫
            'default': 30000
        },
        'IC': {
            'NE555': 150000,
            'LM358': 200000,
            'LM324': 200000,
            '7805': 150000,
            '7812': 170000,
            'LM393': 170000,
            'LM317': 200000,
            'LM386': 200000,
            'NE5532': 250000,
            'TL431': 120000,
            'CH340G': 250000,
            'ULN2003': 180000,
            'L293D': 400000,
            '74HC': 140000,
            'CD4017': 160000,
            'AMS1117': 140000,
            'ATmega328': 1000000,
            'ESP8266': 1000000,
            'default': 170000
        },
        'LED': {
            '5mm': 30000,     // 5mm LEDs: 25000-35000₫
            '3mm': 20000,     // 3mm LEDs: 15000-25000₫
            'SMD 0805': 10000, // SMD LEDs: 8000-12000₫
            'RGB': 120000,    // RGB LEDs: 100000-140000₫
            '10mm': 80000,    // 10mm LEDs: 70000-90000₫
            '7SEG': 160000,   // 7-segment: 140000-180000₫
            'UV': 70000,      // UV LEDs: 60000-80000₫
            'IR': 50000,      // IR LEDs: 40000-60000₫
            'default': 30000
        },
        'Transistor': {
            '2N2222': 60000,
            'BC547': 40000,
            'BC557': 40000,
            '2N3904': 50000,
            '2N3906': 50000,
            'IRF': 500000,    // MOSFET: 400000-600000₫
            'default': 60000
        }
    }

    const products = await Product.find({})
    console.log(`Found ${products.length} products to update`)

    let updated = 0
    for (const product of products) {
        const category = product.category
        const categoryPrices = priceMap[category]
        let newPrice = null

        if (categoryPrices) {
            // Try to match by specific SKU patterns
            if (category === 'Điện trở') {
                if (product.sku.includes('025W')) newPrice = categoryPrices['025W']
                else if (product.sku.includes('05W')) newPrice = categoryPrices['05W']
                else if (product.sku.includes('1W')) newPrice = categoryPrices['1W']
                else newPrice = categoryPrices.default
            } else if (category === 'Tụ điện') {
                if (product.sku.includes('tantalum') || product.sku.includes('-T')) newPrice = categoryPrices.tantalum
                else if (product.sku.includes('UF') || product.sku.includes('µF')) newPrice = categoryPrices['µF']
                else if (product.sku.includes('NF') || product.sku.includes('nF')) newPrice = categoryPrices.nF
                else newPrice = categoryPrices.default
            } else if (category === 'IC') {
                for (const [key, price] of Object.entries(categoryPrices)) {
                    if (key !== 'default' && product.sku.toUpperCase().includes(key.toUpperCase())) {
                        newPrice = price
                        break
                    }
                }
                if (!newPrice) newPrice = categoryPrices.default
            } else if (category === 'LED') {
                for (const [key, price] of Object.entries(categoryPrices)) {
                    if (key !== 'default' && product.sku.toUpperCase().includes(key.toUpperCase())) {
                        newPrice = price
                        break
                    }
                }
                if (!newPrice) newPrice = categoryPrices.default
            } else if (category === 'Transistor') {
                for (const [key, price] of Object.entries(categoryPrices)) {
                    if (key !== 'default' && product.sku.toUpperCase().includes(key.toUpperCase())) {
                        newPrice = price
                        break
                    }
                }
                if (!newPrice) newPrice = categoryPrices.default
            }
        }

        if (newPrice && newPrice !== product.price) {
            const oldPrice = product.price
            product.price = newPrice
            // Update cost proportionally (typically 50-60% of retail)
            product.cost = Math.round(newPrice * 0.55)
            await product.save()
            console.log(`✓ ${product.name}: ${oldPrice}₫ → ${newPrice}₫ (cost: ${product.cost}₫)`)
            updated++
        }
    }

    console.log(`\nUpdated ${updated}/${products.length} products`)
    process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
