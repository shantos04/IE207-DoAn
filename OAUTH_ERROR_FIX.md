# Giải pháp OAuth Error - Summary

## Vấn đề
Lỗi: "Đã chặn quyền truy cập: Lỗi quyền" - The OAuth client was not found (401: invalid_client)

Nguyên nhân: Google Client ID chưa được cấu hình trong `.env`

## Giải pháp triển khai

### 1. **Disable OAuth tạm thời** ✅
Ứng dụng đã được cập nhật để:
- Nếu Google Client ID chưa được cấu hình → Ẩn nút OAuth
- Hiển thị thông báo hướng dẫn setup
- User vẫn có thể đăng nhập bằng email/password

### 2. **Thay đổi Backend (Optional)**
File `server/controllers/authController.js` đã hỗ trợ:
- Google OAuth login via `loginGoogle()`
- Facebook OAuth login via `loginFacebook()`
- Tự động tạo Customer record

### 3. **Frontend Updates** ✅
**File `client/src/App.tsx`:**
- Kiểm tra Google Client ID có hợp lệ không
- Chỉ bảo các GoogleOAuthProvider nếu có Client ID
- Truyền `hasGoogleOAuth` prop sang Login page

**File `client/src/pages/Login.tsx`:**
- Thêm kiểm tra Client ID realtime
- Ẩn OAuth buttons nếu chưa cấu hình
- Hiển thị thông báo hướng dẫn
- User vẫn có thể đăng nhập email/password

### 4. **Configuration File** ✅
**File `OAUTH_SETUP_GUIDE.md`:**
- Hướng dẫn chi tiết setup Google OAuth
- Hướng dẫn setup Facebook OAuth (tùy chọn)
- Troubleshooting common errors

## Hiện tại - Trạng thái
✅ App chạy bình thường mà không cần OAuth  
✅ Email/password login hoạt động  
✅ OAuth buttons ẩn, thay bằng thông báo hướng dẫn  

## Setup OAuth (khi cần)

1. **Google OAuth:**
   - Tạo Google Cloud project
   - Tạo OAuth 2.0 credentials
   - Copy Client ID vào `VITE_GOOGLE_CLIENT_ID`
   - Restart Vite

2. **Facebook OAuth (Optional):**
   - Tạo Facebook App
   - Copy App ID vào `VITE_FACEBOOK_APP_ID`
   - Restart Vite

👉 **Chi tiết**: Xem file `OAUTH_SETUP_GUIDE.md`

## Testing

### Test đăng nhập email/password
```
Email: admin@example.com
Mật khẩu: admin123
```

### Test đăng ký tài khoản mới
- Đăng ký tại `/register`
- Validation mật khẩu hiển thị chi tiết
- Tự động tạo Customer record

### Test OAuth (sau khi setup)
- Cập nhật `.env` với Google Client ID
- Restart Vite dev server
- Nút Google Login sẽ hiển thị
- Click nút để đăng nhập qua Google

## Files thay đổi

1. ✅ `client/src/App.tsx` - Thêm kiểm tra Google OAuth
2. ✅ `client/src/pages/Login.tsx` - Thêm thông báo hướng dẫn
3. ✅ `client/.env` - Cập nhật comments
4. 📄 `OAUTH_SETUP_GUIDE.md` - Hướng dẫn chi tiết (NEW)

## Lưu ý
- Nếu để Client ID mặc định (`YOUR_GOOGLE_CLIENT_ID`), OAuth buttons sẽ ẩn
- App vẫn hoạt động bình thường với email/password
- Không cần thay đổi backend - đã hỗ trợ OAuth
- Khi setup xong OAuth, chỉ cần restart Vite, không cần rebuild backend

---

**Status**: ✅ Ready - App hoạt động, OAuth optional, có hướng dẫn setup
