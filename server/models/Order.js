const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
        status: { type: String, enum: ['draft', 'confirmed', 'shipped', 'completed', 'canceled'], default: 'draft' },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                qty: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        total: { type: Number, default: 0 },
        note: String,
    },
    { timestamps: true }
)

module.exports = mongoose.model('Order', orderSchema)
