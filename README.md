# Expo React Native + Supabase

Dự án Expo React Native tích hợp Supabase.

## Cài đặt

```bash
npm install
```

## Cấu hình Supabase

1. Tạo file `.env` từ `.env.example`
2. Thêm thông tin Supabase của bạn:
   - `EXPO_PUBLIC_SUPABASE_URL`: URL của Supabase project
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Anon key từ Supabase

## Chạy dự án

```bash
npm start
```

Sau đó chọn:
- `a` - Chạy trên Android
- `i` - Chạy trên iOS (cần macOS)
- `w` - Chạy trên web

## Cấu trúc

- `App.js` - Component chính
- `lib/supabase.ts` - Cấu hình Supabase client
- `.env` - Biến môi trường (không commit)
