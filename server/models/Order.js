const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
        status: {
            type: String,
            enum: ['draft', 'confirmed', 'processing', 'shipped', 'completed', 'canceled'],
            default: 'draft'
        },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                qty: { type: Number, required: true },
                price: { type: Number, required: true },
                subtotal: { type: Number, required: true }, // Thành tiền
            },
        ],
        total: { type: Number, default: 0 }, // Tổng giá trị đơn hàng
        paymentMethod: {
            type: String,
            enum: ['cash', 'bank_transfer', 'credit_card', 'e_wallet', 'cod'],
            default: 'cash',
            required: true
        }, // Phương thức thanh toán
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'partial', 'paid'],
            default: 'unpaid'
        }, // Trạng thái thanh toán
        paidAmount: { type: Number, default: 0 }, // Số tiền đã thanh toán
        discount: { type: Number, default: 0 }, // Giảm giá
        tax: { type: Number, default: 0 }, // Thuế
        shippingFee: { type: Number, default: 0 }, // Phí vận chuyển
        shippingAddress: String, // Địa chỉ giao hàng
        note: String,
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Nhân viên xử lý
        completedAt: Date, // Thời gian hoàn thành
    },
    { timestamps: true }
)

// Index để tìm kiếm và thống kê
orderSchema.index({ status: 1 })
orderSchema.index({ customer: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ code: 1 })

// Middleware để tính tổng tiền tự động
orderSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        // Tính subtotal cho từng item
        this.items.forEach(item => {
            item.subtotal = item.qty * item.price
        })
        // Tính tổng đơn hàng
        const itemsTotal = this.items.reduce((sum, item) => sum + item.subtotal, 0)
        this.total = itemsTotal - this.discount + this.tax + this.shippingFee
    }

    // Cập nhật trạng thái thanh toán
    if (this.paidAmount >= this.total) {
        this.paymentStatus = 'paid'
    } else if (this.paidAmount > 0) {
        this.paymentStatus = 'partial'
    } else {
        this.paymentStatus = 'unpaid'
    }

    // Cập nhật thời gian hoàn thành
    if (this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date()
    }

    next()
})

module.exports = mongoose.model('Order', orderSchema)
