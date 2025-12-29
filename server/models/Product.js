const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        sku: { type: String, required: true, unique: true, index: true },
        partNumber: { type: String, index: true },
        brand: String, // Hãng sản xuất
        manufacturer: String, // Nhà sản xuất
        category: String, // Danh mục sản phẩm
        price: { type: Number, default: 0 }, // Giá bán
        cost: { type: Number, default: 0 }, // Giá vốn
        stock: { type: Number, default: 0 }, // Tồn kho
        reorderPoint: { type: Number, default: 0 }, // Mức tồn kho tối thiểu
        minStockLevel: { type: Number, default: 10 }, // Ngưỡng cảnh báo tồn kho thấp
        status: { type: String, enum: ['available', 'out_of_stock', 'discontinued'], default: 'available' }, // Trạng thái sản phẩm
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
        image: String, // URL hoặc base64 của hình ảnh
        description: String, // Mô tả sản phẩm
        // Thông số kỹ thuật cho linh kiện điện tử
        specifications: {
            voltage: String, // Điện áp (VD: "5V", "12V", "220V")
            current: String, // Dòng điện (VD: "2A", "500mA")
            power: String, // Công suất (VD: "10W", "50W")
            resistance: String, // Điện trở (VD: "10kΩ", "1MΩ")
            capacitance: String, // Điện dung (VD: "100uF", "1nF")
            frequency: String, // Tần số (VD: "50Hz", "1MHz")
            temperature: String, // Nhiệt độ hoạt động (VD: "-40°C to 85°C")
            package: String, // Loại vỏ (VD: "DIP", "SMD", "TO-220")
            datasheet: String, // Link datasheet
            other: mongoose.Schema.Types.Mixed // Các thông số khác
        },
    },
    { timestamps: true }
)

// Index cho tìm kiếm và hiệu suất
productSchema.index({ category: 1, brand: 1 })
productSchema.index({ status: 1 })
productSchema.index({ stock: 1 })

// Virtual field để kiểm tra tồn kho thấp
productSchema.virtual('isLowStock').get(function () {
    return this.stock <= this.minStockLevel
})

// Middleware để tự động cập nhật trạng thái
productSchema.pre('save', function (next) {
    if (this.stock <= 0) {
        this.status = 'out_of_stock'
    } else if (this.status === 'out_of_stock' && this.stock > 0) {
        this.status = 'available'
    }
    next()
})

module.exports = mongoose.model('Product', productSchema)
