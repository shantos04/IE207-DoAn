const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        sku: { type: String, required: true, unique: true, index: true },
        partNumber: { type: String, index: true },
        brand: String,
        category: String,
        price: { type: Number, default: 0 },
        cost: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        reorderPoint: { type: Number, default: 0 },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Product', productSchema)
