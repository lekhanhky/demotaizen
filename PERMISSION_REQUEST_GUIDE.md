# Hướng dẫn Popup Yêu cầu Quyền

## Tổng quan
Tính năng này tạo một popup xuất hiện ngay khi user đăng nhập thành công, yêu cầu tất cả các quyền cần thiết trước khi cho phép sử dụng app.

## Các quyền được yêu cầu

### 1. Thông báo (Notifications)
- **Mục đích**: Nhận thông báo quan trọng từ ứng dụng
- **Quyền Android**: `POST_NOTIFICATIONS` (Android 13+)
- **Bắt buộc**: Có

### 2. Microphone (Audio Recording)
- **Mục đích**: Ghi âm cho tính năng chat và cuộc gọi
- **Quyền Android**: `RECORD_AUDIO`
- **Bắt buộc**: Có

### 3. Thư viện ảnh (Media Library)
- **Mục đích**: Truy cập ảnh và video để chia sẻ
- **Quyền Android**: 
  - `READ_EXTERNAL_STORAGE` (Android < 13)
  - `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO` (Android 13+)
- **Bắt buộc**: Có

## Cách hoạt động

### 1. Khi nào popup xuất hiện?
- Ngay sau khi user đăng nhập thành công
- Chỉ xuất hiện nếu chưa cấp đủ quyền cần thiết
- Không xuất hiện lại nếu đã cấp quyền trong phiên làm việc hiện tại

### 2. Giao diện popup
- **Header**: Icon shield và tiêu đề "Cấp quyền truy cập"
- **Danh sách quyền**: Mỗi quyền có icon, tên, mô tả và nút cấp quyền
- **Nút "Cấp tất cả quyền"**: Yêu cầu tất cả quyền cùng lúc
- **Nút "Bỏ qua"**: Cho phép sử dụng app mà không cần tất cả quyền
- **Nút "Tiếp tục"**: Chỉ hoạt động khi đã cấp đủ quyền

### 3. Trạng thái quyền
- **Đang kiểm tra**: Hiển thị "Đang kiểm tra..."
- **Chưa cấp**: Nút "Cấp quyền" màu xanh
- **Đã cấp**: Icon checkmark màu xanh lá

### 4. Xử lý từ chối quyền
- Hiển thị alert hướng dẫn mở Settings để cấp quyền thủ công
- Cung cấp nút "Mở Cài đặt" để chuyển trực tiếp đến Settings

## Files liên quan

### 1. `components/PermissionRequestModal.js`
- Component chính xử lý popup yêu cầu quyền
- Kiểm tra trạng thái quyền hiện tại
- Yêu cầu quyền từ user
- Xử lý UI và UX

### 2. `App.js` (đã cập nhật)
- Tích hợp PermissionRequestModal
- Quản lý state `permissionsGranted`
- Hiển thị modal khi cần thiết

### 3. `android/app/src/main/AndroidManifest.xml` (đã cập nhật)
- Thêm quyền `READ_MEDIA_IMAGES` và `READ_MEDIA_VIDEO`
- Tương thích với Android 13+

## Cách test

### 1. Test trên thiết bị thật
```bash
# Build và cài đặt APK
expo build:android
# hoặc
eas build --platform android
```

### 2. Test flow
1. Cài đặt app lần đầu
2. Đăng nhập
3. Popup sẽ xuất hiện yêu cầu quyền
4. Test các trường hợp:
   - Cấp từng quyền riêng lẻ
   - Cấp tất cả quyền cùng lúc
   - Từ chối quyền và test alert
   - Bỏ qua và vẫn sử dụng app được

### 3. Test trên Android versions khác nhau
- Android 6.0 - 12: Sử dụng READ_EXTERNAL_STORAGE
- Android 13+: Sử dụng READ_MEDIA_IMAGES, READ_MEDIA_VIDEO

## Lưu ý quan trọng

### 1. Permissions trong Expo Go
- Một số quyền có thể không hoạt động đúng trong Expo Go
- Cần test trên APK thật để đảm bảo chính xác

### 2. Android targetSdkVersion
- Đảm bảo targetSdkVersion phù hợp với quyền được sử dụng
- Android 13+ cần targetSdkVersion 33+

### 3. User Experience
- Popup chỉ xuất hiện khi cần thiết
- Không làm phiền user nếu đã cấp quyền
- Cho phép bỏ qua nếu user không muốn cấp quyền

## Tùy chỉnh

### 1. Thêm quyền mới
Trong `PermissionRequestModal.js`, thêm vào `permissionList`:
```javascript
{
  key: 'newPermission',
  title: 'Tên quyền',
  description: 'Mô tả quyền',
  icon: 'icon-name',
  required: true
}
```

### 2. Thay đổi UI
Chỉnh sửa styles trong `PermissionRequestModal.js`

### 3. Thay đổi logic
Chỉnh sửa các function `checkPermissions`, `requestPermission` trong component