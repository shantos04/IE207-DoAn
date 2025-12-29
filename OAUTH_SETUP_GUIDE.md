# Hướng dẫn cấu hình Google OAuth

## Vấn đề hiện tại
Lỗi "The OAuth client was not found" xảy ra vì `VITE_GOOGLE_CLIENT_ID` chưa được cấu hình trong file `.env`

## Giải pháp tạm thời (Disable OAuth)

Nếu bạn không cần Google/Facebook login ngay lúc này, hãy disable chúng:

### 1. Sửa file `client/src/App.tsx`

```tsx
// Disable GoogleOAuthProvider - chỉ để routing thường
return (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    // ... rest of routes
  </Routes>
)
```

Hoặc giữ GoogleOAuthProvider nhưng cấu hình clientId đúng.

### 2. Sửa file `client/src/pages/Login.tsx`

Bỏ đi nút Google Login hoặc disable nó:

```tsx
// Hide Google Login button for now
{/* <GoogleLogin onSuccess={handleGoogleLogin} /> */}
```

---

## Cấu hình Google OAuth đúng cách

### Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google
3. Click "Create Project"
4. Đặt tên: "ERP Linh kiện điện tử"
5. Click "Create"

### Bước 2: Bật Google+ API

1. Tìm "Google+ API" trong search
2. Click vào "Google+ API"
3. Click "Enable"

### Bước 3: Tạo OAuth Consent Screen

1. Vào "OAuth consent screen" (sidebar trái)
2. Chọn "External" > "Create"
3. Điền thông tin:
   - **App name**: ERP Linh kiện điện tử
   - **User support email**: your-email@gmail.com
   - **Developer contact**: your-email@gmail.com
4. Click "Save and Continue"
5. Skip scopes, click "Save and Continue"
6. Skip test users, click "Save and Continue"
7. Click "Back to Dashboard"

### Bước 4: Tạo OAuth 2.0 Credentials

1. Vào "Credentials" (sidebar trái)
2. Click "+ Create Credentials" > "OAuth client ID"
3. Chọn "Web application"
4. Điền thông tin:
   - **Name**: ERP Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost:3000
     https://yourdomain.com (nếu có)
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5173/login
     http://localhost:3000/login
     https://yourdomain.com/login (nếu có)
     ```
5. Click "Create"
6. Copy **Client ID** (không copy Client Secret - không cần cho frontend)

### Bước 5: Cập nhật file `.env`

```dotenv
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=YOUR_COPIED_CLIENT_ID_HERE
VITE_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
```

### Bước 6: Khởi động lại app

```bash
npm run dev
```

---

## Cấu hình Facebook OAuth (tùy chọn)

### Bước 1: Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Đăng nhập hoặc tạo tài khoản
3. Click "My Apps" > "Create App"
4. Chọn "Consumer" > "Next"
5. Điền thông tin app
6. Click "Create App"

### Bước 2: Thêm Facebook Login product

1. Tìm "Facebook Login" trong Products
2. Click "Set Up"
3. Chọn "Web"
4. Nhập URL: `http://localhost:5173`
5. Copy **App ID**

### Bước 3: Cập nhật file `.env`

```dotenv
VITE_FACEBOOK_APP_ID=YOUR_APP_ID_HERE
```

---

## Test OAuth

Sau khi cấu hình:

1. Truy cập http://localhost:5173/login
2. Nút "Đăng nhập bằng Google" sẽ hoạt động
3. Khi click, sẽ redirect đến Google login
4. Sau khi xác thực, sẽ tự động tạo account khách hàng

---

## Lưu ý bảo mật

⚠️ **Không bao giờ commit `.env` file có Client Secret**
- `.env` đã có trong `.gitignore`
- Chỉ commit `.env.sample`
- Mỗi developer phải tạo file `.env` của riêng mình

---

## Troubleshooting

### Lỗi: "The OAuth client was not found"
- ✅ Kiểm tra Client ID đúng
- ✅ Kiểm tra Authorized origins
- ✅ Khởi động lại app (Vite)

### Lỗi: "Redirect URL mismatch"
- Cập nhật "Authorized redirect URIs" trong Google Console
- Phải khớp chính xác URL (không thêm /login nếu chưa có)

### Google Login button không hiển thị
- Kiểm tra `VITE_GOOGLE_CLIENT_ID` có được load
- Mở DevTools (F12) > Console, tìm lỗi
- Kiểm tra GoogleOAuthProvider wrapping component

---

## Giải pháp nhanh (Tạm thời disable OAuth)

Nếu không muốn cấu hình OAuth ngay, sửa file `client/src/pages/Login.tsx`:

```tsx
// Xóa hoặc comment dòng này:
// <GoogleLogin onSuccess={handleGoogleLogin} />
// <button onClick={handleFacebookClick}>Đăng nhập Facebook</button>

// Chỉ giữ lại form đăng nhập email/password thường
```

---

## Environment Variables Checklist

- [ ] `VITE_API_URL` = http://localhost:4000/api
- [ ] `VITE_GOOGLE_CLIENT_ID` = (từ Google Console)
- [ ] `VITE_FACEBOOK_APP_ID` = (từ Facebook Developers)
- [ ] Restart Vite dev server sau khi thay đổi .env

---

Sau khi setup xong, OAuth sẽ hoạt động bình thường! 🎉
