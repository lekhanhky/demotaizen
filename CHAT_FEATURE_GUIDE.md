# Hướng dẫn tính năng Chat

## Tổng quan

Tính năng chat cho phép người dùng nhắn tin trực tiếp với nhau trong ứng dụng X Clone. Hệ thống hỗ trợ:

- ✅ Tin nhắn 1-1 giữa các users
- ✅ Realtime messaging (tin nhắn hiển thị ngay lập tức)
- ✅ Đếm tin nhắn chưa đọc
- ✅ Tìm kiếm người dùng
- ✅ Lịch sử tin nhắn
- ✅ Dark/Light mode

## Cài đặt

### Bước 1: Chạy Migration

Trước tiên, bạn cần tạo các bảng trong Supabase:

1. Mở [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor**
4. Copy nội dung file `supabase-migrations/create_messages_tables.sql`
5. Paste và chạy SQL

Chi tiết xem file: `supabase-migrations/README.md`

### Bước 2: Kiểm tra code

Các file đã được tạo:

```
screens/
  ├── MessagesScreen.js      # Danh sách cuộc hội thoại
  ├── ChatScreen.js          # Màn hình chat
  └── NewMessageScreen.js    # Tìm user để bắt đầu chat mới
```

### Bước 3: Test ứng dụng

```bash
npm start
```

## Cách sử dụng

### 1. Mở màn hình tin nhắn

- Nhấn vào tab **"Tin nhắn"** ở bottom navigation
- Hoặc click icon mail ở dưới cùng

### 2. Bắt đầu cuộc trò chuyện mới

- Trong màn hình Messages, nhấn icon **"+"** ở góc trên bên phải
- Tìm kiếm người dùng bằng tên hoặc username
- Chọn người dùng để bắt đầu chat

### 3. Gửi tin nhắn

- Nhập tin nhắn vào ô input
- Nhấn nút gửi (icon máy bay giấy)
- Tin nhắn sẽ hiển thị ngay lập tức

### 4. Xem tin nhắn chưa đọc

- Badge màu xanh hiển thị số tin nhắn chưa đọc
- Tin nhắn chưa đọc được in đậm

## Tính năng chi tiết

### MessagesScreen (Danh sách cuộc hội thoại)

- Hiển thị tất cả cuộc hội thoại
- Sắp xếp theo tin nhắn mới nhất
- Hiển thị preview tin nhắn cuối cùng
- Đếm số tin nhắn chưa đọc
- Tìm kiếm cuộc hội thoại
- Realtime updates khi có tin nhắn mới

### ChatScreen (Màn hình chat)

- Hiển thị lịch sử tin nhắn
- Tin nhắn của bạn: bên phải, màu xanh
- Tin nhắn của người khác: bên trái, màu xám
- Hiển thị avatar và thời gian
- Auto scroll xuống tin nhắn mới nhất
- Realtime messaging
- Đánh dấu đã đọc tự động

### NewMessageScreen (Tìm người dùng)

- Danh sách tất cả users
- Tìm kiếm theo tên hoặc username
- Tự động tạo cuộc hội thoại mới
- Hoặc mở cuộc hội thoại đã có

## Database Schema

### conversations
```sql
id          UUID PRIMARY KEY
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### conversation_participants
```sql
id              UUID PRIMARY KEY
conversation_id UUID (FK)
user_id         UUID (FK)
joined_at       TIMESTAMP
last_read_at    TIMESTAMP
```

### messages
```sql
id              UUID PRIMARY KEY
conversation_id UUID (FK)
sender_id       UUID (FK)
content         TEXT
created_at      TIMESTAMP
is_read         BOOLEAN
```

## Security

- Row Level Security (RLS) được bật cho tất cả tables
- Users chỉ có thể:
  - Xem tin nhắn trong cuộc hội thoại của họ
  - Gửi tin nhắn vào cuộc hội thoại của họ
  - Cập nhật trạng thái đọc của họ

## Troubleshooting

### Không thấy tin nhắn

1. Kiểm tra đã chạy migration chưa
2. Kiểm tra RLS policies trong Supabase
3. Kiểm tra console log có lỗi không

### Tin nhắn không realtime

1. Kiểm tra Realtime đã bật trong Supabase project
2. Vào Database > Replication
3. Bật replication cho tables: messages, conversations

### Không tìm thấy users

1. Kiểm tra table `user_profiles` có data không
2. Đảm bảo users đã đăng ký và có profile

## Tùy chỉnh

### Thay đổi màu sắc

Chỉnh sửa trong `contexts/ThemeContext.js`:

```javascript
export const lightTheme = {
  primary: '#1d9bf0',  // Màu chính
  // ...
};
```

### Thêm tính năng

Một số ý tưởng mở rộng:

- [ ] Gửi hình ảnh
- [ ] Gửi emoji/stickers
- [ ] Typing indicator
- [ ] Online status
- [ ] Group chat
- [ ] Voice messages
- [ ] Video call
- [ ] Delete/Edit messages
- [ ] Message reactions

## Support

Nếu gặp vấn đề, kiểm tra:

1. Console logs trong terminal
2. Network tab trong React Native Debugger
3. Supabase logs trong Dashboard
