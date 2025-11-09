# Hướng dẫn chạy Migration cho tính năng Chat

## Cách 1: Sử dụng Supabase Dashboard (Khuyến nghị)

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **SQL Editor** từ menu bên trái
4. Tạo một query mới
5. Copy toàn bộ nội dung file `create_messages_tables.sql`
6. Paste vào SQL Editor và click **Run**

## Cách 2: Sử dụng Supabase CLI

```bash
# Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# Login vào Supabase
supabase login

# Link project
supabase link --project-ref your-project-ref

# Chạy migration
supabase db push
```

## Cấu trúc Database

Migration này sẽ tạo:

### Tables:
- **conversations**: Lưu thông tin cuộc hội thoại
- **conversation_participants**: Lưu người tham gia trong mỗi cuộc hội thoại
- **messages**: Lưu tin nhắn

### Views:
- **conversations_with_details**: View hiển thị cuộc hội thoại với thông tin chi tiết
- **messages_with_details**: View hiển thị tin nhắn với thông tin người gửi

### Security:
- Row Level Security (RLS) đã được bật
- Policies đảm bảo users chỉ xem được tin nhắn của họ

## Kiểm tra Migration

Sau khi chạy migration, kiểm tra bằng cách:

```sql
-- Kiểm tra tables đã được tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'conversation_participants', 'messages');

-- Kiểm tra views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('conversations_with_details', 'messages_with_details');
```
