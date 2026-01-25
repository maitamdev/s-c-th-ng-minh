import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as sb;
import '../config/supabase_config.dart';
import '../models/profile.dart';
import '../models/vehicle.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _loading = true;
  String? _error;
  StreamSubscription<sb.AuthState>? _authSubscription;

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get loading => _loading;
  String? get error => _error;

  AuthProvider() {
    _init();
  }

  void _init() {
    // Listen to auth state changes
    _authSubscription = SupabaseConfig.authStateChanges.listen((event) async {
      if (event.session != null) {
        await _loadUserProfile(event.session!.user);
      } else {
        _user = null;
        notifyListeners();
      }
    });

    // Check current session
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    try {
      final session = SupabaseConfig.client.auth.currentSession;
      if (session != null) {
        await _loadUserProfile(session.user);
      }
    } catch (e) {
      debugPrint('Check auth error: $e');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> _loadUserProfile(sb.User supabaseUser) async {
    try {
      // Fetch profile from Supabase
      final response = await SupabaseConfig.client
          .from('profiles')
          .select()
          .eq('id', supabaseUser.id)
          .maybeSingle();

      Profile? profile;
      if (response != null) {
        profile = Profile(
          id: response['id'] as String,
          role: response['role'] as String? ?? 'user',
          fullName: response['full_name'] as String?,
          avatarUrl: response['avatar_url'] as String?,
          createdAt:
              DateTime.tryParse(response['created_at'] as String? ?? '') ??
                  DateTime.now(),
        );
      } else {
        profile = Profile(
          id: supabaseUser.id,
          role: 'user',
          fullName: supabaseUser.email?.split('@').first,
          avatarUrl: null,
          createdAt: DateTime.now(),
        );
      }

      _user = User(
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        profile: profile,
        vehicle: null,
      );

      _loading = false;
      notifyListeners();
    } catch (e) {
      debugPrint('Load profile error: $e');
      _user = User(
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        profile: Profile(
          id: supabaseUser.id,
          role: 'user',
          fullName: supabaseUser.email?.split('@').first,
          avatarUrl: null,
          createdAt: DateTime.now(),
        ),
        vehicle: null,
      );
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> signIn(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await SupabaseConfig.client.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user != null) {
        await _loadUserProfile(response.user!);
      }
    } on sb.AuthException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
      throw Exception(e.message);
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> signUp(String email, String password, String name) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await SupabaseConfig.client.auth.signUp(
        email: email,
        password: password,
        data: {'full_name': name},
      );

      if (response.user != null) {
        // Update profile with name
        await SupabaseConfig.client.from('profiles').upsert({
          'id': response.user!.id,
          'full_name': name,
          'role': 'user',
        });

        await _loadUserProfile(response.user!);
      }
    } on sb.AuthException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
      throw Exception(e.message);
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> signInWithGoogle() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      // For mobile, use native Google sign in
      // For now, show message that Google sign in needs additional setup
      _error =
          'Google sign-in cần cấu hình thêm. Vui lòng dùng email/password.';
      _loading = false;
      notifyListeners();
      throw Exception(_error);
    } catch (e) {
      _loading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> signOut() async {
    await SupabaseConfig.client.auth.signOut();
    _user = null;
    notifyListeners();
  }

  Future<void> updateProfile(Profile profile) async {
    if (_user != null) {
      try {
        await SupabaseConfig.client.from('profiles').upsert({
          'id': _user!.id,
          'full_name': profile.fullName,
          'avatar_url': profile.avatarUrl,
        });

        _user = _user!.copyWith(profile: profile);
        notifyListeners();
      } catch (e) {
        debugPrint('Update profile error: $e');
      }
    }
  }

  Future<void> updateVehicle(Vehicle vehicle) async {
    if (_user != null) {
      _user = _user!.copyWith(vehicle: vehicle);
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }
}

class User {
  final String id;
  final String email;
  final Profile? profile;
  final Vehicle? vehicle;

  User({
    required this.id,
    required this.email,
    this.profile,
    this.vehicle,
  });

  User copyWith({
    String? id,
    String? email,
    Profile? profile,
    Vehicle? vehicle,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      profile: profile ?? this.profile,
      vehicle: vehicle ?? this.vehicle,
    );
  }
}
