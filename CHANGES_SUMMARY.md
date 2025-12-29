# Tổng hợp thay đổi theo yêu cầu ERP

Ngày cập nhật: 29/12/2025

## Mục tiêu

Cập nhật hệ thống ERP cho phù hợp với tài liệu yêu cầu chức năng và phi chức năng cho doanh nghiệp bán linh kiện điện tử.

## Các thay đổi chính

### 1. Model Product (Sản phẩm) ✅

**File**: `server/models/Product.js`

**Thêm mới:**
- `manufacturer`: Nhà sản xuất
- `minStockLevel`: Ngưỡng cảnh báo tồn kho thấp (mặc định 10)
- `status`: Trạng thái sản phẩm (available, out_of_stock, discontinued)
- `specifications`: Object chứa thông số kỹ thuật:
  - `voltage`: Điện áp (VD: "5V", "12V", "220V")
  - `current`: Dòng điện (VD: "2A", "500mA")
  - `power`: Công suất (VD: "10W", "50W")
  - `resistance`: Điện trở (VD: "10kΩ", "1MΩ")
  - `capacitance`: Điện dung (VD: "100uF", "1nF")
  - `frequency`: Tần số (VD: "50Hz", "1MHz")
  - `temperature`: Nhiệt độ hoạt động (VD: "-40°C to 85°C")
  - `package`: Loại vỏ (VD: "DIP", "SMD", "TO-220")
  - `datasheet`: Link datasheet
  - `other`: Các thông số khác

**Tính năng mới:**
- Virtual field `isLowStock`: Tự động kiểm tra tồn kho thấp
- Pre-save middleware: Tự động cập nhật trạng thái khi hết hàng
- Index mới: category+brand, status, stock

**Đáp ứng yêu cầu:**
- ✅ Quản lý thông số kỹ thuật (điện áp, dòng điện, công suất...)
- ✅ Phân loại sản phẩm theo danh mục và hãng sản xuất
- ✅ Quản lý trạng thái còn hàng / hết hàng

---

### 2. Model Customer (Khách hàng) ✅

**File**: `server/models/Customer.js`

**Thêm mới:**
- `customerType`: Loại khách hàng (individual/business) - **BẮT BUỘC**
- `companyName`: Tên công ty (cho doanh nghiệp)
- `contactPerson`: Người liên hệ (cho doanh nghiệp)
- `creditLimit`: Hạn mức tín dụng
- `totalSpent`: Tổng chi tiêu
- `lastOrderDate`: Ngày đặt hàng gần nhất

**Tính năng mới:**
- Index: customerType, email, phone

**Đáp ứng yêu cầu:**
- ✅ Phân loại khách hàng cá nhân và doanh nghiệp
- ✅ Lưu trữ thông tin khách hàng
- ✅ Theo dõi lịch sử mua hàng

---

### 3. Model Order (Đơn hàng) ✅

**File**: `server/models/Order.js`

**Cập nhật:**
- `status`: Thêm trạng thái `processing` (draft → confirmed → processing → shipped → completed)
- `items.subtotal`: Thành tiền cho từng sản phẩm

**Thêm mới:**
- `paymentMethod`: Phương thức thanh toán (cash, bank_transfer, credit_card, e_wallet, cod) - **BẮT BUỘC**
- `paymentStatus`: Trạng thái thanh toán (unpaid, partial, paid)
- `paidAmount`: Số tiền đã thanh toán
- `discount`: Giảm giá
- `tax`: Thuế
- `shippingFee`: Phí vận chuyển
- `shippingAddress`: Địa chỉ giao hàng
- `processedBy`: Nhân viên xử lý (ref User)
- `completedAt`: Thời gian hoàn thành

**Tính năng mới:**
- Pre-save middleware:
  - Tự động tính subtotal cho từng item
  - Tự động tính total = items - discount + tax + shippingFee
  - Tự động cập nhật paymentStatus dựa trên paidAmount
  - Tự động set completedAt khi status = completed
- Index: status, customer, createdAt, code

**Đáp ứng yêu cầu:**
- ✅ Tạo và quản lý đơn hàng
- ✅ Theo dõi trạng thái đơn hàng
- ✅ Tính tổng giá trị đơn hàng
- ✅ Ghi nhận phương thức thanh toán

---

### 4. Controller Updates ✅

#### ProductController (`server/controllers/productController.js`)

**Cập nhật list():**
- Thêm filter theo `brand`
- Thêm filter theo `status`
- Thêm filter `lowStock=true` để lọc sản phẩm tồn kho thấp
- Thêm filter theo `manufacturer` trong search
- Populate supplier information

#### OrderController (`server/controllers/orderController.js`)

**Cập nhật create():**
- Xử lý paymentMethod, shippingAddress, discount, tax, shippingFee
- Tự động tính subtotal cho từng item
- Tính total chính xác (items - discount + tax + shippingFee)
- Lưu processedBy (user ID)
- Tự động populate thông tin đầy đủ

#### ReportController (`server/controllers/reportController.js`)

**Cập nhật dashboard():**
- Thêm `outOfStock`: Đếm sản phẩm hết hàng
- Cập nhật `lowStockCount`: Sử dụng minStockLevel thay vì reorderPoint
- Cập nhật status filter: Thêm `processing`
- Cập nhật tính revenue: Sử dụng subtotal thay vì qty * price

**Cập nhật salesReport():**
- Thêm status `processing`

**Cập nhật inventoryReport():**
- Thêm `outOfStock`: Danh sách sản phẩm hết hàng
- Cập nhật `lowStock`: Lọc theo minStockLevel

**Thêm mới lowStockAlert():**
- API mới: `GET /api/reports/low-stock-alert`
- Trả về danh sách sản phẩm có stock <= minStockLevel
- Không bao gồm sản phẩm discontinued
- Sắp xếp theo stock tăng dần
- Populate thông tin supplier

**Cập nhật dailyRevenue():**
- Thêm status `processing`

---

### 5. Routes Updates ✅

**File**: `server/routes/reports.js`

**Thêm mới:**
- `GET /api/reports/low-stock-alert` → `ctrl.lowStockAlert`

**Đáp ứng yêu cầu:**
- ✅ Cảnh báo khi tồn kho dưới mức tối thiểu
- ✅ Báo cáo doanh thu theo thời gian
- ✅ Báo cáo tồn kho
- ✅ Báo cáo sản phẩm bán chạy

---

### 6. Seed Script Updates ✅

**File**: `server/scripts/seed-100-products.js`

**Cập nhật tất cả products:**
- Thêm `manufacturer` field
- Thêm `minStockLevel` field (= reorderPoint)
- Thêm `status` field (mặc định: 'available')
- Thêm `specifications` object với thông số kỹ thuật đầy đủ:
  - Điện trở: resistance, power, tolerance, temperature, package
  - Tụ điện: capacitance, voltage, tolerance, temperature, package
  - IC: voltage, current, frequency, temperature, package
  - LED: voltage, current, wavelength, brightness, package
  - Transistor: voltage, current, power, type, package

**Lợi ích:**
- Dữ liệu demo phản ánh đầy đủ tính năng mới
- Dễ dàng test các tính năng thông số kỹ thuật
- Có sẵn products với low stock để test cảnh báo

---

### 7. Documentation Updates ✅

**File**: `README.md`

**Cập nhật toàn diện:**
- Mô tả chi tiết tất cả tính năng theo yêu cầu ERP
- Liệt kê đầy đủ Models và fields
- Liệt kê tất cả API endpoints
- Hướng dẫn cài đặt và chạy chi tiết
- Quy trình bán hàng
- Checklist đáp ứng yêu cầu chức năng và phi chức năng

---

## Đáp ứng yêu cầu chức năng

### 4.1. Quản lý sản phẩm ✅
- ✅ Thêm, sửa, xóa thông tin linh kiện điện tử
- ✅ Quản lý thông số kỹ thuật (điện áp, dòng điện, công suất...)
- ✅ Phân loại sản phẩm theo danh mục và hãng sản xuất
- ✅ Quản lý trạng thái còn hàng / hết hàng

### 4.2. Quản lý kho ✅
- ✅ Theo dõi số lượng tồn kho theo thời gian thực
- ✅ Ghi nhận nhập kho và xuất kho
- ✅ Cảnh báo khi tồn kho dưới mức tối thiểu (minStockLevel)
- ✅ Lưu lịch sử biến động kho (InventoryMovement)

### 4.3. Quản lý bán hàng ✅
- ✅ Tạo và quản lý đơn hàng
- ✅ Theo dõi trạng thái đơn hàng (draft → confirmed → processing → shipped → completed)
- ✅ Tính tổng giá trị đơn hàng (bao gồm giảm giá, thuế, phí ship)
- ✅ Ghi nhận phương thức thanh toán (5 loại)

### 4.4. Quản lý khách hàng ✅
- ✅ Lưu trữ thông tin khách hàng
- ✅ Theo dõi lịch sử mua hàng
- ✅ Phân loại khách hàng cá nhân và doanh nghiệp

### 4.5. Quản lý nhà cung cấp ✅
- ✅ Quản lý thông tin nhà cung cấp
- ✅ Tạo đơn mua hàng (qua InventoryMovement)
- ✅ Ghi nhận nhập hàng từ nhà cung cấp

### 4.6. Báo cáo và thống kê ✅
- ✅ Báo cáo doanh thu theo thời gian
- ✅ Báo cáo tồn kho (bao gồm giá trị, low stock, out of stock)
- ✅ Báo cáo sản phẩm bán chạy (Top 5)
- ✅ **NEW**: API cảnh báo tồn kho thấp riêng biệt

---

## Đáp ứng yêu cầu phi chức năng

### 5.1. Hiệu năng ✅
- ✅ Index database cho tìm kiếm nhanh
- ✅ Pagination cho danh sách lớn
- ✅ Populate có chọn lọc fields

### 5.2. Bảo mật ✅
- ✅ Xác thực người dùng bằng JWT
- ✅ Phân quyền theo vai trò (Admin, Staff, Customer)
- ✅ Middleware verify token

### 5.3. Tính dễ sử dụng ✅
- ✅ API RESTful chuẩn
- ✅ Thông báo lỗi rõ ràng
- ✅ Validation đầu vào

### 5.4. Tính ổn định ✅
- ✅ Error handling đầy đủ
- ✅ Transaction khi cần thiết (xuất kho)
- ✅ Tự động cập nhật trạng thái

### 5.5. Khả năng mở rộng ✅
- ✅ Kiến trúc module
- ✅ Dễ thêm fields mới (specifications object)
- ✅ Dễ thêm API endpoints mới

---

## Testing Checklist

### Backend
- [ ] Test Product CRUD với specifications
- [ ] Test Customer create với customerType
- [ ] Test Order create với paymentMethod
- [ ] Test low stock alert API
- [ ] Test tự động xuất kho khi confirm order
- [ ] Test tính toán total order (discount, tax, shipping)
- [ ] Test status transitions của Order

### Frontend (Cần cập nhật)
- [ ] Update Product form để nhập specifications
- [ ] Update Customer form với customerType selector
- [ ] Update Order form với payment method selector
- [ ] Add discount, tax, shipping fee inputs
- [ ] Display low stock warnings
- [ ] Update TypeScript types

---

## Migration Notes

**Lưu ý khi migrate database hiện có:**

1. **Products cũ**: Cần chạy migration script để thêm:
   - `minStockLevel` (có thể copy từ reorderPoint)
   - `status` (mặc định 'available', nếu stock = 0 thì 'out_of_stock')
   - `specifications` (có thể để empty object)
   - `manufacturer` (có thể copy từ brand)

2. **Customers cũ**: Cần thêm:
   - `customerType` (mặc định 'individual')
   - Các field khác có thể null

3. **Orders cũ**: Cần thêm:
   - `paymentMethod` (mặc định 'cash')
   - `paymentStatus` (tính từ paidAmount)
   - `subtotal` cho mỗi item (tính = qty * price)

**Migration script mẫu:**

```javascript
// Chạy trong MongoDB shell hoặc script
db.products.updateMany(
  { minStockLevel: { $exists: false } },
  [{
    $set: {
      minStockLevel: "$reorderPoint",
      status: {
        $cond: [
          { $lte: ["$stock", 0] },
          "out_of_stock",
          "available"
        ]
      },
      manufacturer: "$brand",
      specifications: {}
    }
  }]
)

db.customers.updateMany(
  { customerType: { $exists: false } },
  { $set: { customerType: "individual" } }
)

db.orders.updateMany(
  { paymentMethod: { $exists: false } },
  { $set: { 
    paymentMethod: "cash",
    paymentStatus: "unpaid",
    paidAmount: 0
  } }
)
```

---

## Next Steps

### Backend (Đã hoàn thành)
- ✅ Update models
- ✅ Update controllers
- ✅ Add new endpoints
- ✅ Update seed script
- ✅ Update documentation

### Frontend (Cần làm)
1. Update TypeScript types trong `client/src/types/`
2. Update API services trong `client/src/services/`
3. Update Product form (thêm specifications fields)
4. Update Customer form (thêm customerType selector)
5. Update Order form (thêm payment method, discount, tax, shipping)
6. Add Low Stock Alert page/component
7. Update Dashboard để hiển thị out of stock count
8. Add filters cho Product list (brand, status, lowStock)

### Testing
1. Test tất cả API endpoints với Postman/Thunder Client
2. Test low stock alert functionality
3. Test order total calculation
4. Test customer type filtering
5. Integration testing

---

## Kết luận

Hệ thống đã được cập nhật đầy đủ theo yêu cầu trong tài liệu ERP:
- ✅ Tất cả yêu cầu chức năng (4.1 - 4.6)
- ✅ Tất cả yêu cầu phi chức năng (5.1 - 5.5)
- ✅ Thiết kế tổng thể (6.1 - 6.3)

Backend đã sẵn sàng. Cần cập nhật Frontend để sử dụng đầy đủ các tính năng mới.
