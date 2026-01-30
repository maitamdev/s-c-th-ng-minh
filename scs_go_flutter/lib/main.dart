import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'config/supabase_config.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/language_provider.dart';
import 'providers/stations_provider.dart';
import 'providers/booking_provider.dart';
import 'providers/community_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase
  await SupabaseConfig.initialize();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => StationsProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
        ChangeNotifierProvider(create: (_) => CommunityProvider()),
      ],
      child: const SCSGoApp(),
    ),
  );
}
