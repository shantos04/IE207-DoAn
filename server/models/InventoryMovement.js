const mongoose = require('mongoose')

const inventoryMovementSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ['in', 'out', 'adjust'], required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        qty: { type: Number, required: true },
        refType: { type: String },
        refId: { type: String },
        note: String,
    },
    { timestamps: true }
)

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema)
