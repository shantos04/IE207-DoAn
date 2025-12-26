# Hướng dẫn Cấu hình Đăng nhập Social (Google & Facebook)

## Google OAuth Setup

### 1. Tạo Google Cloud Project
- Truy cập [Google Cloud Console](https://console.cloud.google.com/)
- Tạo project mới
- Bật API: "Google+ API"

### 2. Tạo OAuth 2.0 Credentials
- Đi đến "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
- Chọn "Web application"
- Thêm "Authorized JavaScript origins":
  - `http://localhost:5173` (development)
  - `http://localhost:3000` (production)
- Thêm "Authorized redirect URIs":
  - `http://localhost:5173/login` (development)
  - `http://localhost:3000/login` (production)
- Sao chép Client ID

### 3. Thêm vào .env
```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
```

## Facebook OAuth Setup

### 1. Tạo Facebook App
- Truy cập [Facebook Developers](https://developers.facebook.com/)
- Click "My Apps" → "Create App"
- Chọn "Consumer" type
- Điền thông tin app

### 2. Cấu hình Facebook Login
- Trong App Dashboard, chọn "Add Product" → "Facebook Login"
- Trong Settings, thêm "Valid OAuth Redirect URIs":
  - `http://localhost:5173/login` (development)
  - `http://localhost:3000/login` (production)

### 3. Cấu hình App Domains
- Đi đến Settings → Basic
- Thêm "App Domains":
  - `localhost` (development)
  - `yourdomain.com` (production)

### 4. Thêm vào .env
```env
VITE_FACEBOOK_APP_ID=YOUR_APP_ID
```

## Installation & Setup

### 1. Cài đặt Dependencies
```bash
cd client
npm install
```

### 2. Tạo file .env
```bash
cp .env.example .env
```

### 3. Điền thông tin
Chỉnh sửa file `.env` với Google Client ID và Facebook App ID thực tế

### 4. Chạy Development Server
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5173` (hoặc port khác nếu bị conflict)

## Notes

- Facebook Login sử dụng Facebook SDK trực tiếp (không cần thư viện riêng)
- Google Login sử dụng `@react-oauth/google`
- Cả hai yêu cầu cấu hình CORS và redirects chính xác
- Đảm bảo update các environment variables trước khi production deployment

## Troubleshooting

### Google Login không hoạt động
- Kiểm tra lại Client ID trong console Google Cloud
- Đảm bảo domain được thêm vào "Authorized JavaScript origins"

### Facebook Login không hoạt động  
- Kiểm tra lại App ID trong Facebook Developer Console
- Đảm bảo domain được thêm vào "App Domains"
- Kiểm tra quyền `email` được bật trong App Roles

