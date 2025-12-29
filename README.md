# ERP cho Doanh nghiệp Bán Linh kiện Điện tử

Hệ thống ERP (Enterprise Resource Planning) quản lý toàn diện cho doanh nghiệp bán linh kiện điện tử

## Công nghệ
- Frontend: React + Vite + Tailwind CSS + React Router + Axios
- Backend: Node.js + Express + MongoDB (Mongoose)

## Tính năng chính

### 1. Quản lý sản phẩm
- Thêm, sửa, xóa thông tin linh kiện điện tử
- Quản lý thông số kỹ thuật (điện áp, dòng điện, công suất, điện trở, điện dung, tần số, nhiệt độ, loại vỏ...)
- Phân loại sản phẩm theo danh mục và hãng sản xuất
- Quản lý trạng thái: còn hàng / hết hàng / ngừng kinh doanh
- Hỗ trợ SKU, mã linh kiện (Part Number), giá bán, giá vốn
- Quản lý nhà cung cấp cho từng sản phẩm

### 2. Quản lý kho
- Theo dõi số lượng tồn kho theo thời gian thực
- Ghi nhận nhập kho và xuất kho tự động
- **Cảnh báo tồn kho thấp** (minStockLevel)
- Lưu lịch sử biến động kho (InventoryMovement)
- Tự động cập nhật trạng thái sản phẩm khi hết hàng
- Điều chỉnh tồn kho thủ công

### 3. Quản lý bán hàng
- Tạo và quản lý đơn hàng
- Theo dõi trạng thái đơn hàng: draft → confirmed → processing → shipped → completed
- Tính tổng giá trị đơn hàng tự động (bao gồm giảm giá, thuế, phí vận chuyển)
- **Ghi nhận phương thức thanh toán**: tiền mặt, chuyển khoản, thẻ tín dụng, ví điện tử, COD
- Theo dõi trạng thái thanh toán: chưa thanh toán / thanh toán một phần / đã thanh toán
- Kiểm tra tồn kho trước khi xác nhận đơn
- Tự động xuất kho khi đơn được xác nhận

### 4. Quản lý khách hàng
- Lưu trữ thông tin khách hàng đầy đủ
- **Phân loại khách hàng**: cá nhân (individual) và doanh nghiệp (business)
- Theo dõi lịch sử mua hàng
- Quản lý hạn mức tín dụng
- Theo dõi tổng chi tiêu và đơn hàng gần nhất

### 5. Quản lý nhà cung cấp
- Quản lý thông tin nhà cung cấp
- Liên kết nhà cung cấp với sản phẩm
- Theo dõi thông tin liên hệ và mã số thuế

### 6. Báo cáo và thống kê
- **Dashboard tổng quan**: Tổng sản phẩm, sản phẩm hết hàng, tồn kho thấp, đơn hàng hôm nay, doanh thu tháng
- **Báo cáo doanh thu** theo thời gian
- **Báo cáo tồn kho**: Giá trị tồn kho, danh sách tồn kho thấp, hết hàng
- **Báo cáo sản phẩm bán chạy**: Top 5 sản phẩm theo doanh thu
- **Biểu đồ doanh thu hàng ngày**: Theo dõi xu hướng kinh doanh
- **Cảnh báo tồn kho thấp**: API riêng để lấy danh sách sản phẩm cần nhập thêm

### 7. Phân quyền người dùng
- **Admin**: Quản trị toàn bộ hệ thống
- **Nhân viên bán hàng**: Quản lý đơn hàng, khách hàng
- **Nhân viên kho**: Quản lý tồn kho, nhập xuất
- **Khách hàng** (Customer): Xem và đặt hàng trực tuyến

## Cấu trúc dự án
```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/    # Components tái sử dụng
│   │   ├── pages/         # Các trang chính
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── lib/           # Utilities
│   └── ...
├── server/                # Node.js Backend
│   ├── config/           # Database config
│   ├── controllers/      # Business logic
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   └── scripts/          # Seed scripts
└── ...
```

## Models (Database Schema)

### Product (Sản phẩm)
- Thông tin cơ bản: name, sku, partNumber, brand, manufacturer, category
- Giá: price (bán), cost (vốn)
- Tồn kho: stock, reorderPoint, minStockLevel
- Trạng thái: available, out_of_stock, discontinued
- Thông số kỹ thuật: voltage, current, power, resistance, capacitance, frequency, temperature, package, datasheet

### Customer (Khách hàng)
- Thông tin: name, email, phone, address, taxId
- **customerType**: individual / business
- companyName, contactPerson (cho doanh nghiệp)
- creditLimit, totalSpent, lastOrderDate

### Order (Đơn hàng)
- code, customer, status
- items: [{product, qty, price, subtotal}]
- total, discount, tax, shippingFee
- **paymentMethod**: cash, bank_transfer, credit_card, e_wallet, cod
- **paymentStatus**: unpaid, partial, paid
- paidAmount, shippingAddress, processedBy, completedAt

### Supplier (Nhà cung cấp)
- name, email, phone, address, taxId

### InventoryMovement (Biến động kho)
- type: in, out, adjust
- product, qty, refType, refId, note

### User (Người dùng)
- email, password, role

## API Endpoints

### Products
- `GET /api/products` - Danh sách sản phẩm (hỗ trợ filter: q, category, brand, status, lowStock)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Orders
- `GET /api/orders` - Danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/:id` - Cập nhật đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn
- `POST /api/orders/:id/cancel` - Hủy đơn (Customer)
- `DELETE /api/orders/:id` - Xóa đơn draft

### Customers
- `GET /api/customers` - Danh sách khách hàng
- `GET /api/customers/:id` - Chi tiết khách hàng
- `POST /api/customers` - Tạo khách hàng
- `PUT /api/customers/:id` - Cập nhật khách hàng
- `DELETE /api/customers/:id` - Xóa khách hàng

### Suppliers
- `GET /api/suppliers` - Danh sách nhà cung cấp
- `GET /api/suppliers/:id` - Chi tiết nhà cung cấp
- `POST /api/suppliers` - Tạo nhà cung cấp
- `PUT /api/suppliers/:id` - Cập nhật nhà cung cấp
- `DELETE /api/suppliers/:id` - Xóa nhà cung cấp

### Inventory
- `GET /api/inventory` - Lịch sử biến động kho
- `POST /api/inventory/adjust` - Điều chỉnh tồn kho

### Reports
- `GET /api/reports/dashboard` - Dashboard tổng quan
- `GET /api/reports/sales` - Báo cáo doanh thu
- `GET /api/reports/inventory` - Báo cáo tồn kho
- `GET /api/reports/daily-revenue` - Biểu đồ doanh thu hàng ngày
- `GET /api/reports/low-stock-alert` - **Cảnh báo tồn kho thấp** ⭐ NEW

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại

## Yêu cầu hệ thống
- Node.js LTS (>=18)
- MongoDB (local hoặc Atlas)

## Cài đặt và chạy

### 1) Thiết lập môi trường
```bash
# Sao chép file env mẫu
cp server/.env.sample server/.env
cp client/.env.sample client/.env

# Cấu hình MongoDB URI trong server/.env
MONGODB_URI=mongodb://127.0.0.1:27017/erp_parts
JWT_SECRET=your-secret-key
```

### 2) Cài đặt dependencies
```bash
# Từ thư mục gốc
npm install

# Hoặc cài riêng từng phần
cd server && npm install
cd client && npm install
```

### 3) Khởi chạy MongoDB
Chọn một trong hai cách:

**Local MongoDB:**
```bash
# Đảm bảo MongoDB đang chạy ở mongodb://127.0.0.1:27017
mongod
```

**Docker:**
```bash
docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo:7
```

### 4) Seed dữ liệu demo
```bash
# Từ thư mục gốc
npm run seed

# Tạo tài khoản admin + 100 sản phẩm mẫu
```

### 5) Chạy ứng dụng
```bash
# Chạy song song client + server
npm run dev

# Hoặc chạy riêng
cd server && npm run dev
cd client && npm run dev
```

## Truy cập

- **Frontend**: http://localhost:5173
- **API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/health

## Đăng nhập mặc định

Sau khi seed dữ liệu:
- **Email**: `admin@example.com`
- **Mật khẩu**: `admin123`

## Tính năng nổi bật theo yêu cầu ERP

✅ **Quản lý sản phẩm**: Đầy đủ thông số kỹ thuật linh kiện điện tử  
✅ **Quản lý kho**: Cảnh báo tồn kho thấp, tự động xuất kho  
✅ **Quản lý bán hàng**: Phương thức thanh toán, trạng thái đơn hàng chi tiết  
✅ **Quản lý khách hàng**: Phân loại cá nhân/doanh nghiệp  
✅ **Quản lý nhà cung cấp**: Liên kết với sản phẩm  
✅ **Báo cáo**: Dashboard, doanh thu, tồn kho, sản phẩm bán chạy  
✅ **Phân quyền**: Admin, Nhân viên bán hàng, Nhân viên kho  
✅ **Hiệu năng**: Hỗ trợ nhiều người dùng đồng thời  
✅ **Bảo mật**: JWT authentication, phân quyền theo vai trò  
✅ **Tính mở rộng**: Kiến trúc module, dễ thêm tính năng  

## Quy trình bán hàng

1. Khách hàng tạo đơn hàng (status: `draft`)
2. Hệ thống kiểm tra tồn kho
3. Nhân viên xác nhận đơn hàng (status: `confirmed`)
   - Tự động trừ tồn kho
   - Tạo InventoryMovement type=`out`
4. Xử lý đơn hàng (status: `processing`)
5. Giao hàng (status: `shipped`)
6. Hoàn tất (status: `completed`)

Nếu hủy đơn đã confirmed: Tự động hoàn trả tồn kho

## Tác giả & Thông tin dự án

**Môn học**: IE207 - Công nghệ Web và ứng dụng  
**Đề tài**: Hệ thống ERP cho doanh nghiệp bán linh kiện điện tử  
**Năm**: 2025

---

© 2025 ERP System for Electronic Components