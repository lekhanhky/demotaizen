# Hướng dẫn cài đặt tính năng gửi hình ảnh trong Chat

## Bước 1: Cài đặt package

```bash
npx expo install expo-image-picker
```

## Bước 2: Cấu hình Storage Bucket trong Supabase

1. Mở [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Storage** từ menu bên trái
4. Click **New bucket**
5. Tạo bucket với tên: `images`
6. Chọn **Public bucket** (để có thể truy cập ảnh công khai)
7. Click **Create bucket**

## Bước 3: Cấu hình Storage Policies

Vào **Storage** > **Policies** > bucket `images`, thêm các policies:

### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

### Policy 2: Allow public to view images
```sql
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

### Policy 3: Allow users to delete their own images
```sql
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Bước 4: Cấu hình app.json (cho Expo)

Thêm permissions vào `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Ứng dụng cần quyền truy cập thư viện ảnh để gửi hình ảnh.",
          "cameraPermission": "Ứng dụng cần quyền truy cập camera để chụp ảnh."
        }
      ]
    ]
  }
}
```

## Bước 5: Test tính năng

1. Restart app: `npm start`
2. Mở màn hình chat
3. Click icon hình ảnh bên trái input
4. Chọn ảnh từ thư viện
5. Gửi tin nhắn

## Tính năng đã thêm

✅ Chọn ảnh từ thư viện
✅ Preview ảnh trước khi gửi
✅ Upload ảnh lên Supabase Storage
✅ Hiển thị ảnh trong tin nhắn
✅ Gửi ảnh kèm text hoặc chỉ ảnh
✅ Xóa ảnh đã chọn trước khi gửi

## Lưu ý

- Ảnh được nén với quality 0.8 để tiết kiệm băng thông
- Ảnh được lưu trong folder `chat-images/` trong bucket `images`
- Tên file: `{user_id}_{timestamp}.{ext}`
- Hỗ trợ crop ảnh với tỷ lệ 4:3

## Troubleshooting

### Lỗi: "Permission denied"
- Kiểm tra Storage policies đã được tạo chưa
- Đảm bảo bucket `images` là public

### Lỗi: "Bucket not found"
- Tạo bucket `images` trong Supabase Storage
- Kiểm tra tên bucket đúng chính xác

### Ảnh không hiển thị
- Kiểm tra URL ảnh có đúng không
- Đảm bảo bucket là public
- Kiểm tra policy "Public can view images"
