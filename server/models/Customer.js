const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: String,
        phone: String,
        address: String,
        taxId: String, // Mã số thuế
        customerType: {
            type: String,
            enum: ['individual', 'business'],
            default: 'individual',
            required: true
        }, // Loại khách hàng: cá nhân hoặc doanh nghiệp
        companyName: String, // Tên công ty (cho doanh nghiệp)
        contactPerson: String, // Người liên hệ (cho doanh nghiệp)
        note: String,
        creditLimit: { type: Number, default: 0 }, // Hạn mức tín dụng
        totalSpent: { type: Number, default: 0 }, // Tổng chi tiêu
        lastOrderDate: Date, // Ngày đặt hàng gần nhất
    },
    { timestamps: true }
)

// Index để tìm kiếm và phân loại
customerSchema.index({ customerType: 1 })
customerSchema.index({ email: 1 })
customerSchema.index({ phone: 1 })

module.exports = mongoose.model('Customer', customerSchema)
