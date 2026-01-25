import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String supabaseUrl = 'https://mukdmszhgwpqhdlswhfd.supabase.co';
  static const String supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11a2Rtc3poZ3dwcWhkbHN3aGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDE2MTQsImV4cCI6MjA4MTY3NzYxNH0.t8fZnVJQfTKvMhS1Px3wS4m-lOd5_ug32cfe7_D_lxQ';

  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
  }

  static User? get currentUser => client.auth.currentUser;
  static bool get isAuthenticated => currentUser != null;

  static Stream<AuthState> get authStateChanges =>
      client.auth.onAuthStateChange;
}
