# API Reference - ERP System

Tài liệu API đầy đủ cho hệ thống ERP Linh kiện điện tử

Base URL: `http://localhost:4000/api`

## Authentication

Tất cả API (trừ login/register) yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

---

## Products API

### GET /products
Danh sách sản phẩm với filter và pagination

**Query Parameters:**
- `q` (string): Tìm kiếm theo tên, SKU, Part Number, Manufacturer
- `category` (string): Lọc theo danh mục
- `brand` (string): Lọc theo hãng
- `status` (string): Lọc theo trạng thái (available, out_of_stock, discontinued)
- `lowStock` (boolean): Chỉ hiển thị sản phẩm tồn kho thấp (true/false)
- `page` (number): Trang hiện tại (mặc định: 1)
- `limit` (number): Số items mỗi trang (mặc định: 20)

**Response:**
```json
{
  "items": [
    {
      "_id": "...",
      "name": "Điện trở 1kΩ 1/4W",
      "sku": "RES-1K-025W",
      "partNumber": "CF14-1K",
      "brand": "Yageo",
      "manufacturer": "Yageo",
      "category": "Điện trở",
      "price": 50,
      "cost": 30,
      "stock": 2000,
      "reorderPoint": 500,
      "minStockLevel": 500,
      "status": "available",
      "supplier": {
        "_id": "...",
        "name": "Supplier Name"
      },
      "specifications": {
        "voltage": "5V",
        "current": "2A",
        "power": "0.25W",
        "resistance": "1kΩ",
        "temperature": "-55°C to 155°C",
        "package": "1/4W Axial"
      }
    }
  ],
  "total": 100
}
```

### GET /products/:id
Chi tiết một sản phẩm

### POST /products
Tạo sản phẩm mới

**Body:**
```json
{
  "name": "Điện trở 1kΩ 1/4W",
  "sku": "RES-1K-025W",
  "partNumber": "CF14-1K",
  "brand": "Yageo",
  "manufacturer": "Yageo",
  "category": "Điện trở",
  "price": 50,
  "cost": 30,
  "stock": 2000,
  "reorderPoint": 500,
  "minStockLevel": 500,
  "status": "available",
  "supplier": "supplier_id_here",
  "specifications": {
    "resistance": "1kΩ",
    "power": "0.25W",
    "tolerance": "±5%",
    "temperature": "-55°C to 155°C",
    "package": "1/4W Axial"
  },
  "description": "Điện trở cacbon 1/4W chất lượng cao"
}
```

### PUT /products/:id
Cập nhật sản phẩm

### DELETE /products/:id
Xóa sản phẩm

---

## Customers API

### GET /customers
Danh sách khách hàng

**Query Parameters:**
- `page`, `limit`: Pagination

### GET /customers/:id
Chi tiết khách hàng

### POST /customers
Tạo khách hàng mới

**Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "phone": "0123456789",
  "address": "123 Đường ABC, TP.HCM",
  "taxId": "0123456789",
  "customerType": "individual",  // "individual" hoặc "business"
  "companyName": "",  // Chỉ cần nếu customerType = "business"
  "contactPerson": "",  // Chỉ cần nếu customerType = "business"
  "creditLimit": 10000000,
  "note": "Khách hàng VIP"
}
```

**Example for Business Customer:**
```json
{
  "name": "Công ty TNHH ABC",
  "email": "contact@abc.com",
  "phone": "0123456789",
  "address": "456 Đường XYZ, TP.HCM",
  "taxId": "0123456789-001",
  "customerType": "business",
  "companyName": "Công ty TNHH ABC",
  "contactPerson": "Nguyễn Văn B",
  "creditLimit": 50000000,
  "note": "Khách hàng doanh nghiệp"
}
```

### PUT /customers/:id
Cập nhật khách hàng

### DELETE /customers/:id
Xóa khách hàng

---

## Orders API

### GET /orders
Danh sách đơn hàng

**Query Parameters:**
- `status`: Lọc theo trạng thái (draft, confirmed, processing, shipped, completed, canceled)
- `page`, `limit`: Pagination

### GET /orders/:id
Chi tiết đơn hàng

### POST /orders
Tạo đơn hàng mới

**Body:**
```json
{
  "customer": "customer_id_here",
  "items": [
    {
      "product": "product_id_here",
      "qty": 10,
      "price": 50
    },
    {
      "product": "product_id_here_2",
      "qty": 5,
      "price": 100
    }
  ],
  "paymentMethod": "bank_transfer",  // cash, bank_transfer, credit_card, e_wallet, cod
  "discount": 50000,  // Optional
  "tax": 0,  // Optional
  "shippingFee": 30000,  // Optional
  "shippingAddress": "123 Đường ABC, TP.HCM",
  "note": "Giao hàng trong giờ hành chính"
}
```

**Response:**
- Hệ thống tự động tính `subtotal` cho mỗi item
- Tự động tính `total` = sum(subtotal) - discount + tax + shippingFee
- Kiểm tra tồn kho trước khi tạo
- Status mặc định: `draft`

### PUT /orders/:id
Cập nhật đơn hàng (chỉ draft)

### PUT /orders/:id/status
Cập nhật trạng thái đơn hàng

**Body:**
```json
{
  "status": "confirmed"  // draft, confirmed, processing, shipped, completed, canceled
}
```

**Lưu ý:**
- Khi chuyển từ `draft` → `confirmed`: Tự động trừ tồn kho và tạo InventoryMovement
- Không thể hủy đơn đã `shipped` hoặc `completed`
- Khi hủy đơn `confirmed`: Tự động hoàn trả tồn kho

### POST /orders/:id/cancel
Khách hàng tự hủy đơn

**Chỉ dành cho role='customer'**
- Chỉ hủy được đơn của mình
- Chỉ hủy được đơn `draft` hoặc `confirmed`

### DELETE /orders/:id
Xóa đơn hàng (chỉ draft)

---

## Suppliers API

### GET /suppliers
Danh sách nhà cung cấp

### GET /suppliers/:id
Chi tiết nhà cung cấp

### POST /suppliers
Tạo nhà cung cấp

**Body:**
```json
{
  "name": "Công ty linh kiện XYZ",
  "email": "contact@xyz.com",
  "phone": "0987654321",
  "address": "789 Đường DEF, TP.HCM",
  "taxId": "0987654321",
  "note": "Nhà cung cấp chính"
}
```

### PUT /suppliers/:id
Cập nhật nhà cung cấp

### DELETE /suppliers/:id
Xóa nhà cung cấp

---

## Inventory API

### GET /inventory
Lịch sử biến động kho

**Query Parameters:**
- `product`: Lọc theo sản phẩm
- `type`: Lọc theo loại (in, out, adjust)
- `page`, `limit`: Pagination

### POST /inventory/adjust
Điều chỉnh tồn kho thủ công

**Body:**
```json
{
  "product": "product_id_here",
  "qty": 100,  // Số lượng điều chỉnh (dương = tăng, âm = giảm)
  "note": "Kiểm kê định kỳ"
}
```

---

## Reports API

### GET /reports/dashboard
Dashboard tổng quan

**Response:**
```json
{
  "totalProducts": 100,
  "outOfStock": 5,
  "lowStockCount": 12,
  "ordersToday": 8,
  "revenueThisMonth": 15000000,
  "topProducts": [
    {
      "_id": "...",
      "totalQty": 500,
      "totalRevenue": 2500000,
      "product": {
        "name": "Điện trở 1kΩ",
        "sku": "RES-1K"
      }
    }
  ]
}
```

### GET /reports/sales
Báo cáo doanh thu

**Query Parameters:**
- `startDate` (YYYY-MM-DD): Từ ngày
- `endDate` (YYYY-MM-DD): Đến ngày

**Response:**
```json
{
  "orders": [...],
  "totalRevenue": 15000000,
  "totalOrders": 50
}
```

### GET /reports/inventory
Báo cáo tồn kho

**Response:**
```json
{
  "products": [...],
  "totalValue": 500000000,
  "lowStock": [...],
  "outOfStock": [...]
}
```

### GET /reports/daily-revenue
Biểu đồ doanh thu hàng ngày

**Query Parameters:**
- `from` (YYYY-MM-DD): Từ ngày (mặc định: 14 ngày trước)
- `to` (YYYY-MM-DD): Đến ngày (mặc định: hôm nay)

**Response:**
```json
{
  "from": "2025-12-15",
  "to": "2025-12-29",
  "days": [
    {
      "date": "2025-12-15",
      "revenue": 500000,
      "orders": 5
    },
    ...
  ]
}
```

### GET /reports/low-stock-alert ⭐ NEW
Cảnh báo tồn kho thấp

**Response:**
```json
{
  "items": [
    {
      "_id": "...",
      "name": "IC 555 Timer",
      "sku": "IC-NE555",
      "stock": 8,
      "minStockLevel": 40,
      "status": "available",
      "supplier": {
        "_id": "...",
        "name": "Supplier Name",
        "email": "contact@supplier.com",
        "phone": "0123456789"
      }
    }
  ],
  "count": 12
}
```

---

## Auth API

### POST /auth/register
Đăng ký tài khoản

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "staff"  // admin, staff, customer
}
```

### POST /auth/login
Đăng nhập

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "sub": "...",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### GET /auth/me
Thông tin user hiện tại

**Response:**
```json
{
  "_id": "...",
  "email": "admin@example.com",
  "role": "admin"
}
```

---

## Status Codes

- `200 OK`: Thành công
- `201 Created`: Tạo mới thành công
- `400 Bad Request`: Lỗi dữ liệu đầu vào
- `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy resource
- `500 Internal Server Error`: Lỗi server

---

## Error Response Format

```json
{
  "message": "Error message here"
}
```

---

## Postman Collection

Import file `postman_collection.json` để test tất cả API endpoints.

## Notes

1. **Authentication**: Tất cả API đều cần JWT token (trừ login/register)
2. **Pagination**: Mặc định page=1, limit=20
3. **Date Format**: YYYY-MM-DD (ISO 8601)
4. **Currency**: VND (Vietnamese Dong)
5. **Timezone**: +07:00 (Vietnam)

## Change Log

**v2.0.0 (29/12/2025)**
- ✅ Thêm specifications cho Product
- ✅ Thêm customerType cho Customer
- ✅ Thêm paymentMethod, discount, tax, shippingFee cho Order
- ✅ Thêm low-stock-alert endpoint
- ✅ Cập nhật dashboard với outOfStock count
- ✅ Thêm filter lowStock cho Products API

**v1.0.0**
- Initial release
