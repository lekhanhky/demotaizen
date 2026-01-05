# 🚀 Hướng Dẫn Build APK với EAS (Windows)

## ⚠️ Lưu Ý Quan Trọng

**EAS Local Build chỉ hỗ trợ macOS và Linux.** Trên Windows, bạn có 2 lựa chọn:

1. **EAS Cloud Build** (Khuyến nghị)
2. **Direct Gradle Build** (Nhanh nhất)

## 📋 Yêu Cầu Trước Khi Bắt Đầu

### 1. Cài Đặt EAS CLI
```bash
npm install -g eas-cli
```

### 2. Kiểm Tra Version
```bash
eas --version
# Kết quả: eas-cli/16.28.0 win32-x64 node-v24.11.0
```

### 3. Đăng Nhập EAS
```bash
eas login
```

## 🌐 Phương Pháp 1: EAS Cloud Build (Khuyến Nghị)

### Build Preview APK
```bash
eas build --platform android --profile preview
```

### Build Production APK
```bash
eas build --platform android --profile production
```

### Build Development Client
```bash
eas build --platform android --profile development
```

### Ưu Điểm:
- ✅ Hoạt động trên Windows
- ✅ Build environment được optimize
- ✅ Tự động handle signing
- ✅ APK size nhỏ hơn

### Nhược Điểm:
- ❌ Cần internet connection
- ❌ Chậm hơn local build
- ❌ Có giới hạn build miễn phí

## ⚡ Phương Pháp 2: Direct Gradle Build (Nhanh Nhất)

### 1. Tạo Android Project
```bash
npx expo run:android
```

### 2. Build APK với Gradle
```bash
cd android
./gradlew assembleRelease
```

### 3. Tìm APK
```bash
# APK sẽ ở:
android/app/build/outputs/apk/release/app-release.apk
```

### Ưu Điểm:
- ✅ Nhanh nhất
- ✅ Không cần internet
- ✅ Full control
- ✅ Hoạt động trên Windows

### Nhược Điểm:
- ❌ Cần setup Android SDK
- ❌ APK size lớn hơn
- ❌ Cần handle signing manual

## 🔧 Cấu Hình EAS Build Profiles

File `eas.json` hiện tại:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 🚀 Quy Trình Build Khuyến Nghị (Windows)

### Cho Development/Testing Nhanh:
```bash
# 1. Tạo development build
npx expo run:android

# 2. Build APK
cd android
./gradlew assembleRelease
```

### Cho Production/Distribution:
```bash
# 1. Build với EAS Cloud
eas build --platform android --profile production

# 2. Download APK từ Expo dashboard
```

## 📱 Các Loại Build

### 1. **Development Build**
```bash
# EAS Cloud
eas build --platform android --profile development

# Local Gradle
npx expo run:android --variant release
```

### 2. **Preview Build**
```bash
# EAS Cloud
eas build --platform android --profile preview

# Local Gradle
cd android && ./gradlew assembleRelease
```

### 3. **Production Build**
```bash
# EAS Cloud (Khuyến nghị)
eas build --platform android --profile production
```

## ⚙️ Tùy Chọn Build

### Build với Clear Cache
```bash
eas build --platform android --profile preview --clear-cache
```

### Build với Custom Message
```bash
eas build --platform android --profile preview --message "Build v1.0.1 for testing"
```

### Build Non-Interactive
```bash
eas build --platform android --profile preview --non-interactive
```

## 📂 Output Locations

### EAS Cloud Build:
- Download từ Expo dashboard
- Link sẽ được gửi qua email

### Local Gradle Build:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 🔐 Signing Configuration

### Development Signing (Gradle):
- Tự động sử dụng debug keystore
- APK chỉ dùng cho testing

### Production Signing (EAS):
- EAS tự động handle signing
- Hoặc upload keystore của bạn

## 🐛 Troubleshooting

### Lỗi "Unsupported platform" (Local Build):
```
Giải pháp: Sử dụng EAS Cloud Build thay vì --local
```

### Lỗi Android SDK không tìm thấy:
```bash
# Cài đặt Android Studio
# Hoặc set ANDROID_HOME environment variable
```

### Lỗi Gradle Build Failed:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## 📊 So Sánh Build Methods (Windows)

| Method | Speed | Setup | Use Case |
|--------|-------|-------|----------|
| EAS Cloud | Medium | Easy | Production |
| Gradle Direct | Fast | Complex | Development |
| Expo Dev Build | Fast | Medium | Testing |

## 🎯 Khuyến Nghị cho Windows

### Cho Development:
```bash
# Nhanh nhất
npx expo run:android
cd android && ./gradlew assembleRelease
```

### Cho Testing:
```bash
# Cân bằng tốt
eas build --platform android --profile preview
```

### Cho Production:
```bash
# Chất lượng cao nhất
eas build --platform android --profile production
```

## ✅ Checklist

- [ ] EAS CLI đã cài đặt
- [ ] Đã đăng nhập EAS
- [ ] File eas.json đã cấu hình
- [ ] Dependencies đã cài đặt
- [ ] Environment variables đã set
- [ ] Chọn build method phù hợp
- [ ] APK đã được tạo thành công
- [ ] APK đã được test

## 🔄 Quick Commands

```bash
# Check EAS status
eas whoami

# Build preview APK (Cloud)
eas build --platform android --profile preview

# Build APK local (Gradle)
npx expo run:android && cd android && ./gradlew assembleRelease

# Check build status
eas build:list

# Download latest build
eas build:download
```

Trên Windows, EAS Cloud Build là lựa chọn tốt nhất cho production, còn Gradle build phù hợp cho development nhanh!