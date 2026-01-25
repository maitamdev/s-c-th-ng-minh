class AppConstants {
  // App info
  static const appName = 'SCS GO';
  static const appVersion = '1.0.0';
  
  // API endpoints
  static const supabaseUrl = 'https://your-supabase-url.supabase.co';
  static const supabaseAnonKey = 'your-anon-key';
  
  // Map defaults
  static const defaultLat = 21.0285; // Hanoi
  static const defaultLng = 105.8542;
  static const defaultZoom = 13.0;
  
  // Animation durations
  static const animationDuration = Duration(milliseconds: 300);
  static const animationDurationSlow = Duration(milliseconds: 500);
  
  // Layout
  static const borderRadius = 16.0;
  static const borderRadiusSmall = 12.0;
  static const padding = 16.0;
  static const paddingSmall = 8.0;
  static const paddingLarge = 24.0;
  
  // SharedPreferences keys
  static const keyThemeMode = 'theme_mode';
  static const keyLanguage = 'language';
  static const keyOnboardingCompleted = 'onboarding_completed';
}
