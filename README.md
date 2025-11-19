# ERP cho Doanh nghiệp Bán Linh kiện Điện tử

Công nghệ:
- Frontend: React + Vite + Tailwind CSS + React Router + Axios
- Backend: Node.js + Express + MongoDB (Mongoose)

Tính năng:
- Quản lý sản phẩm (SKU, mã linh kiện, tồn kho, giá, nhà sản xuất)
- Quản lý kho (nhập/xuất kho, điều chuyển, kiểm kê)
- Quản lý đơn hàng bán (Báo giá, Đơn hàng, Hóa đơn, Trạng thái giao hàng)
- Quản lý nhà cung cấp và mua hàng
- Quản lý khách hàng (CRM cơ bản)
- Phân quyền người dùng (Admin, Bán hàng, Kho)
- Báo cáo nhanh: tồn kho, doanh số, top sản phẩm

## Cấu trúc
- `client/` React + Tailwind UI
- `server/` API Express + MongoDB

## Yêu cầu hệ thống
- Node.js LTS (>=18)
- MongoDB (local hoặc Atlas)

## Chạy nhanh
1) Thiết lập env
- Sao chép `server/.env.sample` thành `server/.env`
- Sao chép `client/.env.sample` thành `client/.env`

2) Khởi chạy MongoDB (chọn một)
- Local MongoDB: đảm bảo MongoDB chạy ở `mongodb://127.0.0.1:27017`
- Docker (tùy chọn):
	- `docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo:7`

3) Seed dữ liệu demo (tài khoản admin + vài sản phẩm)
- `npm run seed`

4) Chạy song song client + server
- `npm run dev`

Đường dẫn:
- Frontend: http://localhost:5173
- API: http://localhost:4000/api (health: `/health`)

Đăng nhập mặc định sau khi seed:
- Email: `admin@example.com`
- Mật khẩu: `admin123`
