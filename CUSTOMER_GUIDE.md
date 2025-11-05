# Hướng dẫn Khách hàng - Hệ thống ERP Linh kiện Điện tử

## 🎯 Tài khoản mẫu

### Khách hàng (Customer)
- **Email:** `customer1@example.com`
- **Password:** `customer123`

Hoặc:
- **Email:** `customer2@example.com`
- **Password:** `customer123`

### Nhân viên/Admin (để so sánh)
- **Email:** `admin@example.com`
- **Password:** `admin123`

## 📝 Đăng ký tài khoản mới

1. Truy cập trang đăng ký: http://localhost:5174/register
2. Điền thông tin:
   - Họ tên
   - Email
   - Mật khẩu (tối thiểu 6 ký tự)
   - Xác nhận mật khẩu
3. Chọn **"Loại tài khoản"**: **Khách hàng (mua hàng)**
4. Điền thông tin bổ sung:
   - Số điện thoại (tùy chọn)
   - Địa chỉ (tùy chọn)
5. Nhấn **"Đăng ký"**

Hệ thống sẽ:
- Tạo tài khoản User với role `customer`
- Tự động tạo hồ sơ Customer để lưu thông tin liên hệ
- Đăng nhập tự động sau khi đăng ký thành công

## 🛒 Mua hàng

### Bước 1: Xem sản phẩm
- Sau khi đăng nhập, bạn sẽ được chuyển tự động đến **Cửa hàng**
- Hoặc click vào menu **"🛒 Cửa hàng"**
- Tìm kiếm sản phẩm bằng ô tìm kiếm
- Xem thông tin sản phẩm:
  - Tên và mã SKU
  - Hãng sản xuất
  - Giá bán
  - Tồn kho

### Bước 2: Thêm vào giỏ hàng
- Click nút **"Thêm vào giỏ"** trên sản phẩm muốn mua
- Badge giỏ hàng (góc trên phải) sẽ hiển thị số lượng sản phẩm

### Bước 3: Xem giỏ hàng
- Click nút **"🛒 Giỏ hàng"** ở góc trên phải
- Trong giỏ hàng bạn có thể:
  - Tăng/giảm số lượng (nút + / -)
  - Xóa sản phẩm (nút 🗑️)
  - Thêm ghi chú đơn hàng
  - Xem tổng tiền

### Bước 4: Đặt hàng
- Click nút **"Đặt hàng"**
- Đơn hàng sẽ được tạo với trạng thái **"Nháp"**
- Bạn sẽ nhận được thông báo thành công

## 📦 Theo dõi đơn hàng

1. Click menu **"📦 Đơn hàng của tôi"**
2. Xem danh sách tất cả đơn hàng đã đặt
3. Thông tin hiển thị:
   - Mã đơn hàng (VD: ORD000001)
   - Ngày đặt
   - Trạng thái:
     - **Nháp**: Đơn hàng mới tạo
     - **Đã xác nhận**: Đã được xác nhận bởi nhân viên
     - **Đang giao**: Đang trong quá trình vận chuyển
     - **Hoàn thành**: Đã giao thành công
     - **Đã hủy**: Đơn hàng bị hủy
   - Chi tiết sản phẩm và số lượng
   - Ghi chú (nếu có)
   - Tổng tiền

## 🔐 Phân quyền

### Tài khoản Khách hàng (Customer) được phép:
- ✅ Xem danh sách sản phẩm trong cửa hàng
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Đặt hàng
- ✅ Xem đơn hàng của mình
- ❌ Không thể truy cập các chức năng quản lý nội bộ (Dashboard, Kho, Nhà cung cấp, v.v.)

### Tài khoản Nhân viên/Admin được phép:
- ✅ Truy cập Dashboard quản lý
- ✅ Quản lý sản phẩm, đơn hàng, kho, nhà cung cấp, khách hàng
- ✅ Xác nhận và xử lý đơn hàng của khách
- ❌ Không thấy menu "Cửa hàng"

## 💡 Lưu ý

1. **Tồn kho**: Chỉ có thể đặt hàng khi sản phẩm còn hàng
2. **Đơn hàng**: Đơn hàng sẽ ở trạng thái "Nháp" cho đến khi nhân viên xác nhận
3. **Số điện thoại & Địa chỉ**: Nên cập nhật đầy đủ khi đăng ký để nhân viên liên hệ giao hàng

## 🚀 Khởi động hệ thống

```bash
# Từ thư mục gốc
npm run dev
```

- Frontend: http://localhost:5174
- Backend API: http://localhost:4000

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra MongoDB đã chạy chưa
2. Kiểm tra token còn hiệu lực không (đăng xuất/nhập lại)
3. Xem console browser để check lỗi
