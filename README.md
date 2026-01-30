# SCS GO - Smart EV Charging Station Finder

**Hệ thống tìm kiếm và đặt chỗ trạm sạc xe điện thông minh**

## 📱 Giới thiệu

SCS GO là nền tảng tìm kiếm và đặt chỗ trạm sạc xe điện thông minh, tích hợp AI để gợi ý trạm sạc phù hợp nhất dựa trên vị trí, loại xe và sở thích của người dùng. Dự án bao gồm:

- 🌐 **Web Application** (React + TypeScript + Vite)
- 📱 **Mobile Application** (Flutter)
- 🤖 **AI Recommendation Engine**
- 📊 **Operator Dashboard**

## 🚀 Tính năng chính

### Người dùng
- ✅ Tìm kiếm trạm sạc theo vị trí, khoảng cách, công suất
- ✅ AI gợi ý trạm sạc thông minh
- ✅ Dự đoán mức độ đông đúc theo giờ
- ✅ Đặt lịch sạc trước
- ✅ Quản lý lịch sử sạc và booking
- ✅ Yêu thích trạm sạc
- ✅ Quản lý thông tin xe
- ✅ PWA - Cài đặt như ứng dụng native
- ✅ Hỗ trợ đa ngôn ngữ (Tiếng Việt/English)
- ✅ Dark/Light mode

### Nhà điều hành trạm sạc
- ✅ Dashboard quản lý trạm sạc
- ✅ Thêm/sửa/xóa trạm sạc
- ✅ Quản lý bookings
- ✅ Thống kê và phân tích
- ✅ Theo dõi doanh thu

## 🛠️ Công nghệ sử dụng

### Web Application
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **State Management**: React Query, Context API
- **Routing**: React Router v6
- **Maps**: Leaflet, React Leaflet
- **Animation**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Auth
- **Deployment**: Vercel

### Mobile Application
- **Framework**: Flutter
- **Language**: Dart
- **Build**: Codemagic CI/CD

## 📦 Cài đặt và chạy dự án

### Yêu cầu
- Node.js >= 18.x
- npm hoặc yarn
- Flutter SDK (cho mobile app)

### Web Application

```bash
# Clone repository
git clone <YOUR_GIT_URL>
cd s-c-th-ng-minh

# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Cập nhật các biến môi trường trong .env
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
# VITE_OPENCHARGE_MAP_API_KEY=your-api-key

# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

### Mobile Application (Flutter)

```bash
# Di chuyển vào thư mục Flutter
cd scs_go_flutter

# Cài đặt dependencies
flutter pub get

# Chạy trên emulator/device
flutter run

# Build APK
flutter build apk

# Build iOS (chỉ trên macOS)
flutter build ios
```

## 📁 Cấu trúc dự án

```
s-c-th-ng-minh/
├── src/
│   ├── components/      # React components
│   │   ├── layout/      # Header, Footer, Navigation
│   │   ├── booking/     # Booking related components
│   │   ├── stations/    # Station cards, filters
│   │   └── ui/          # shadcn/ui components
│   ├── pages/           # Page components
│   │   ├── operator/    # Operator dashboard pages
│   │   └── ...
│   ├── contexts/        # React contexts (Auth, Theme, Language)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities, constants, translations
│   ├── ai/              # AI recommendation engine
│   ├── services/        # API services
│   └── types/           # TypeScript type definitions
├── scs_go_flutter/      # Flutter mobile app
├── supabase/            # Database schema and migrations
├── public/              # Static assets
└── ...

```

## 🗄️ Database Setup

Database schema được quản lý bằng Supabase. Import file `supabase/schema.sql` vào Supabase project của bạn.

```sql
-- Các bảng chính:
- users              # Thông tin người dùng
- stations           # Trạm sạc
- chargers           # Cổng sạc
- bookings           # Đặt chỗ
- vehicles           # Thông tin xe
- favorites          # Trạm yêu thích
- reviews            # Đánh giá
```

## 🔐 Environment Variables

Tạo file `.env` với các biến sau:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenChargeMap API
VITE_OPENCHARGE_MAP_API_KEY=your-api-key
VITE_OPENCHARGE_MAP_BASE_URL=https://api.openchargemap.io/v3
```

## 🚢 Deployment

### Web (Vercel)
```bash
# Deploy lên Vercel
vercel deploy

# Hoặc kết nối GitHub repo với Vercel để auto-deploy
```

### Mobile (Codemagic)
- iOS: Sử dụng Codemagic workflow (xem `codemagic.yaml`)
- Android: Build APK/AAB và upload lên Google Play Console

## 📱 PWA Installation

Web app hỗ trợ Progressive Web App (PWA):
- Truy cập website trên mobile browser
- Chọn "Add to Home Screen"
- Sử dụng như ứng dụng native

## 🤝 Contributing

Dự án được phát triển bởi team SCS GO. Mọi đóng góp đều được hoan nghênh!

## 📄 License

Copyright © 2026 SCS GO Team. All rights reserved.

## 📧 Contact

- Email: maitamit062005@gmail.com
- Website: https://scs-go.vercel.app

## 🙏 Acknowledgments

- shadcn/ui cho component library
- Supabase cho backend infrastructure
- OpenChargeMap cho dữ liệu trạm sạc
- Unsplash cho hình ảnh
