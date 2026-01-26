import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';

class LanguageProvider extends ChangeNotifier {
  Locale _locale = const Locale('vi', 'VN');

  Locale get locale => _locale;
  bool get isVietnamese => _locale.languageCode == 'vi';

  LanguageProvider() {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    final savedLanguage = prefs.getString(AppConstants.keyLanguage);
    if (savedLanguage != null) {
      _locale = savedLanguage == 'en'
          ? const Locale('en', 'US')
          : const Locale('vi', 'VN');
      notifyListeners();
    }
  }

  Future<void> setLocale(Locale locale) async {
    _locale = locale;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.keyLanguage, locale.languageCode);
  }

  Future<void> toggleLanguage() async {
    await setLocale(
      isVietnamese ? const Locale('en', 'US') : const Locale('vi', 'VN'),
    );
  }

  // Translations
  String t(String key) {
    return _translations[_locale.languageCode]?[key] ?? key;
  }

  static const Map<String, Map<String, String>> _translations = {
    'vi': {
      // Landing
      'landing.badge': 'AI-Powered',
      'landing.hero.title': 'Tìm trạm sạc',
      'landing.hero.highlight': 'thông minh',
      'landing.hero.subtitle':
          'Tìm trạm sạc xe điện gần bạn với AI. Đặt chỗ trước, so sánh giá, theo dõi thời gian thực.',
      'landing.search.placeholder': 'VD: Quận 1, TP.HCM / Hà Nội...',
      'landing.search.button': 'Tìm kiếm',
      'landing.cta.explore': 'Khám phá bản đồ',
      'landing.cta.login': 'Đăng nhập',

      // Stats
      'landing.stats.stations': 'Trạm sạc',
      'landing.stats.ports': 'Cổng sạc',
      'landing.stats.searches': 'Lượt tìm kiếm',

      // Explore
      'explore.title': 'Khám phá trạm sạc',
      'explore.subtitle': 'Tìm trạm sạc gần bạn',
      'explore.sortAI': 'AI đề xuất',
      'explore.sortDistance': 'Khoảng cách',
      'explore.sortPrice': 'Giá rẻ nhất',
      'explore.sortPower': 'Công suất cao',
      'explore.available': 'Còn trống',

      // Auth
      'auth.login': 'Đăng nhập',
      'auth.register': 'Đăng ký',
      'auth.email': 'Email',
      'auth.password': 'Mật khẩu',
      'auth.name': 'Họ tên',
      'auth.fullName': 'Họ và tên',
      'auth.forgotPassword': 'Quên mật khẩu?',
      'auth.noAccount': 'Chưa có tài khoản?',
      'auth.hasAccount': 'Đã có tài khoản?',
      'auth.loginGoogle': 'Đăng nhập với Google',
      'auth.loginWithGoogle': 'Đăng nhập với Google',
      'auth.userAccount': 'Người dùng',
      'auth.operatorAccount': 'Nhà vận hành',
      'auth.welcomeDesc': 'Đăng nhập để tiếp tục sử dụng dịch vụ',
      'auth.createAccountDesc': 'Tạo tài khoản mới để bắt đầu',
      'auth.operatorLogin': 'Đăng nhập nhà vận hành',
      'auth.operatorRegister': 'Đăng ký nhà vận hành',

      // Dashboard
      'dashboard.welcome': 'Xin chào',
      'dashboard.overview': 'Tổng quan hoạt động của bạn',
      'dashboard.findStation': 'Tìm trạm sạc',
      'dashboard.recentBookings': 'Đặt chỗ gần đây',
      'dashboard.noBookings': 'Chưa có đặt chỗ nào',
      'dashboard.myVehicle': 'Xe của tôi',

      // Station
      'station.available': 'Còn trống',
      'station.occupied': 'Đang sạc',
      'station.details': 'Chi tiết',
      'station.book': 'Đặt chỗ',
      'station.navigate': 'Chỉ đường',
      'station.reviews': 'Đánh giá',
      'station.amenities': 'Tiện ích',
      'station.hours': 'Giờ mở cửa',

      // Booking
      'booking.title': 'Đặt chỗ sạc xe',
      'booking.selectTime': 'Chọn thời gian',
      'booking.selectCharger': 'Chọn cổng sạc',
      'booking.confirm': 'Xác nhận đặt chỗ',
      'booking.success': 'Đặt chỗ thành công!',

      // Settings
      'settings.title': 'Cài đặt',
      'settings.account': 'Tài khoản',
      'settings.theme': 'Giao diện',
      'settings.darkMode': 'Chế độ tối',
      'settings.language': 'Ngôn ngữ',
      'settings.notifications': 'Thông báo',
      'settings.logout': 'Đăng xuất',

      // Favorites
      'favorites.title': 'Yêu thích',
      'favorites.empty': 'Chưa có trạm yêu thích',

      // History
      'history.title': 'Lịch sử sạc',
      'history.empty': 'Chưa có lịch sử sạc',

      // Vehicle
      'vehicle.title': 'Xe của tôi',
      'vehicle.subtitle': 'Cập nhật thông tin xe',
      'vehicle.name': 'Tên xe',
      'vehicle.battery': 'Dung lượng pin (kWh)',
      'vehicle.soc': 'Mức pin hiện tại (%)',
      'vehicle.consumption': 'Tiêu thụ (kWh/100km)',
      'vehicle.connector': 'Loại cổng sạc',
      'vehicle.save': 'Lưu thay đổi',

      // Common
      'common.loading': 'Đang tải...',
      'common.error': 'Có lỗi xảy ra',
      'common.retry': 'Thử lại',
      'common.cancel': 'Hủy',
      'common.save': 'Lưu',
      'common.viewAll': 'Xem tất cả',
      'common.km': 'km',
      'common.kw': 'kW',
      'common.vnd': 'đ',
    },
    'en': {
      // Landing
      'landing.badge': 'AI-Powered',
      'landing.hero.title': 'Find charging stations',
      'landing.hero.highlight': 'smartly',
      'landing.hero.subtitle':
          'Find EV charging stations near you with AI. Book ahead, compare prices, real-time tracking.',
      'landing.search.placeholder': 'E.g: District 1, HCMC / Hanoi...',
      'landing.search.button': 'Search',
      'landing.cta.explore': 'Explore Map',
      'landing.cta.login': 'Login',

      // Stats
      'landing.stats.stations': 'Stations',
      'landing.stats.ports': 'Charging Ports',
      'landing.stats.searches': 'Searches',

      // Explore
      'explore.title': 'Explore Stations',
      'explore.subtitle': 'Find stations near you',
      'explore.sortAI': 'AI Recommended',
      'explore.sortDistance': 'Distance',
      'explore.sortPrice': 'Lowest Price',
      'explore.sortPower': 'Highest Power',
      'explore.available': 'Available',

      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.name': 'Full Name',
      'auth.fullName': 'Full Name',
      'auth.forgotPassword': 'Forgot password?',
      'auth.noAccount': "Don't have an account?",
      'auth.hasAccount': 'Already have an account?',
      'auth.loginGoogle': 'Login with Google',
      'auth.loginWithGoogle': 'Login with Google',
      'auth.userAccount': 'User',
      'auth.operatorAccount': 'Operator',
      'auth.welcomeDesc': 'Sign in to continue using the service',
      'auth.createAccountDesc': 'Create a new account to get started',
      'auth.operatorLogin': 'Operator Login',
      'auth.operatorRegister': 'Operator Registration',

      // Dashboard
      'dashboard.welcome': 'Hello',
      'dashboard.overview': 'Your activity overview',
      'dashboard.findStation': 'Find Station',
      'dashboard.recentBookings': 'Recent Bookings',
      'dashboard.noBookings': 'No bookings yet',
      'dashboard.myVehicle': 'My Vehicle',

      // Station
      'station.available': 'Available',
      'station.occupied': 'Occupied',
      'station.details': 'Details',
      'station.book': 'Book',
      'station.navigate': 'Navigate',
      'station.reviews': 'Reviews',
      'station.amenities': 'Amenities',
      'station.hours': 'Hours',

      // Booking
      'booking.title': 'Book Charging Slot',
      'booking.selectTime': 'Select Time',
      'booking.selectCharger': 'Select Charger',
      'booking.confirm': 'Confirm Booking',
      'booking.success': 'Booking Successful!',

      // Settings
      'settings.title': 'Settings',
      'settings.account': 'Account',
      'settings.theme': 'Theme',
      'settings.darkMode': 'Dark Mode',
      'settings.language': 'Language',
      'settings.notifications': 'Notifications',
      'settings.logout': 'Logout',

      // Favorites
      'favorites.title': 'Favorites',
      'favorites.empty': 'No favorite stations',

      // History
      'history.title': 'Charging History',
      'history.empty': 'No charging history',

      // Vehicle
      'vehicle.title': 'My Vehicle',
      'vehicle.subtitle': 'Update vehicle info',
      'vehicle.name': 'Vehicle Name',
      'vehicle.battery': 'Battery Capacity (kWh)',
      'vehicle.soc': 'Current Battery Level (%)',
      'vehicle.consumption': 'Consumption (kWh/100km)',
      'vehicle.connector': 'Connector Type',
      'vehicle.save': 'Save Changes',

      // Common
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.retry': 'Retry',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.viewAll': 'View All',
      'common.km': 'km',
      'common.kw': 'kW',
      'common.vnd': 'VND',
    },
  };
}
