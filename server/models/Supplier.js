const mongoose = require('mongoose')

const supplierSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: String,
        phone: String,
        address: String,
        taxId: String,
        note: String,
    },
    { timestamps: true }
)

module.exports = mongoose.model('Supplier', supplierSchema)
