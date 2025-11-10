# Hướng dẫn tích hợp YouTube Data API

## Bước 1: Lấy YouTube API Key

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào menu **APIs & Services** > **Library**
4. Tìm và enable **YouTube Data API v3**
5. Vào **APIs & Services** > **Credentials**
6. Click **Create Credentials** > **API Key**
7. Copy API Key vừa tạo

### Bảo mật API Key (Khuyến nghị)
- Click vào API Key vừa tạo
- Trong phần **API restrictions**, chọn **Restrict key**
- Chỉ chọn **YouTube Data API v3**
- Trong phần **Application restrictions**, có thể chọn:
  - **HTTP referrers** (cho web)
  - **Android apps** (cho Android)
  - **iOS apps** (cho iOS)

## Bước 2: Lấy Channel ID

### Cách 1: Từ URL kênh
- Nếu URL có dạng: `youtube.com/channel/UCxxxxx` → Channel ID là `UCxxxxx`
- Nếu URL có dạng: `youtube.com/@username` → Cần dùng cách 2

### Cách 2: Từ YouTube Studio
1. Đăng nhập vào [YouTube Studio](https://studio.youtube.com/)
2. Vào **Settings** > **Channel** > **Advanced settings**
3. Copy **Channel ID**

### Cách 3: Sử dụng API
Nếu bạn chỉ có username, dùng URL này trong trình duyệt:
```
https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=USERNAME&key=YOUR_API_KEY
```

## Bước 3: Cấu hình trong ứng dụng

Mở file `config/youtube.js` và cập nhật:

```javascript
export const YOUTUBE_CONFIG = {
  API_KEY: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // API Key của bạn
  CHANNEL_ID: 'UCxxxxxxxxxxxxxxxxxxxxxxxxx', // Channel ID của bạn
  MAX_RESULTS: 50,
};
```

## Bước 4: Test

1. Khởi động lại ứng dụng
2. Click vào icon YouTube ở bottom navigation
3. Bạn sẽ thấy danh sách video từ kênh YouTube

## Giới hạn API

YouTube Data API có giới hạn quota:
- **10,000 units/ngày** (miễn phí)
- Mỗi request search: **100 units**
- Mỗi request videos: **1 unit**

→ Với cấu hình mặc định, bạn có thể load khoảng 50-100 lần/ngày

## Tính năng đã tích hợp

✅ Hiển thị thông tin kênh (avatar, tên, số subscribers)
✅ Danh sách video với thumbnail
✅ Số lượt xem và thời gian đăng
✅ Thời lượng video
✅ Pull to refresh
✅ Load more (pagination)
✅ Click vào video để mở trong YouTube app/browser

## Troubleshooting

### Lỗi: "API key not valid"
- Kiểm tra API Key đã đúng chưa
- Kiểm tra đã enable YouTube Data API v3 chưa
- Kiểm tra API restrictions

### Lỗi: "The request cannot be completed"
- Kiểm tra Channel ID đã đúng chưa
- Thử dùng Channel ID thay vì username

### Không hiển thị video
- Kiểm tra kênh có video public không
- Kiểm tra quota API còn không

## Mở rộng

Bạn có thể thêm các tính năng:
- Tìm kiếm video
- Lọc theo playlist
- Hiển thị comments
- Embed video player trong app
- Cache dữ liệu để giảm API calls
