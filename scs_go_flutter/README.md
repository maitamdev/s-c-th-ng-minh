# SCS GO Flutter

Ứng dụng Flutter cho SCS GO - Sạc xe điện thông minh.

## Cài đặt

### Yêu cầu
- Flutter SDK 3.2.0 trở lên
- Dart 3.0.0 trở lên
- Android Studio hoặc VS Code với Flutter extension

### Bước 1: Cài Flutter SDK
Nếu chưa có Flutter, tải và cài đặt từ: https://flutter.dev/docs/get-started/install

### Bước 2: Cài dependencies
```bash
cd scs_go_flutter
flutter pub get
```

### Bước 3: Chạy ứng dụng
```bash
# Chạy trên emulator/thiết bị
flutter run

# Chạy chế độ debug với hot reload
flutter run --debug

# Build APK cho Android
flutter build apk

# Build cho iOS (macOS only)
flutter build ios
```

## Cấu trúc project

```
lib/
├── main.dart              # Entry point
├── app.dart               # App configuration
├── config/
│   ├── theme.dart         # Light/Dark themes
│   ├── routes.dart        # GoRouter navigation
│   └── constants.dart     # App constants
├── models/                # Data models
├── providers/             # State management
├── screens/               # Main screens
│   ├── landing/
│   ├── auth/
│   ├── explore/
│   ├── station_detail/
│   ├── booking/
│   ├── dashboard/
│   ├── settings/
│   └── ...
└── widgets/               # Reusable widgets
```

## Tính năng

- 🔍 Tìm trạm sạc gần nhất
- 🤖 AI gợi ý thông minh
- 📅 Đặt chỗ sạc xe trước
- 💰 So sánh giá các trạm
- 🌙 Hỗ trợ Dark/Light mode
- 🌐 Đa ngôn ngữ (Tiếng Việt/English)
- ⚡ Firebase Authentication

## Firebase Setup (Optional)

1. Tạo project Firebase tại https://console.firebase.google.com
2. Thêm Android app và tải `google-services.json` vào `android/app/`
3. Thêm iOS app và tải `GoogleService-Info.plist` vào `ios/Runner/`
4. Uncomment Firebase initialization trong `main.dart`
