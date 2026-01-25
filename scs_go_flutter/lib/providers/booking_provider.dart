import 'dart:async';
import 'package:flutter/foundation.dart';
import '../config/supabase_config.dart';
import '../models/booking.dart';

class BookingProvider extends ChangeNotifier {
  List<Booking> _bookings = [];
  bool _isLoading = false;
  String? _error;
  StreamSubscription? _subscription;

  List<Booking> get bookings => _bookings;
  List<Booking> get upcomingBookings =>
      _bookings.where((b) => b.isUpcoming || b.isActive).toList();
  List<Booking> get completedBookings =>
      _bookings.where((b) => b.isCompleted).toList();
  List<Booking> get cancelledBookings =>
      _bookings.where((b) => b.isCancelled).toList();
  bool get isLoading => _isLoading;
  String? get error => _error;

  BookingProvider() {
    _listenToAuthChanges();
  }

  void _listenToAuthChanges() {
    SupabaseConfig.authStateChanges.listen((event) {
      if (event.session != null) {
        fetchBookings();
        _subscribeToBookings();
      } else {
        _bookings = [];
        _subscription?.cancel();
        notifyListeners();
      }
    });
  }

  void _subscribeToBookings() {
    final userId = SupabaseConfig.currentUser?.id;
    if (userId == null) return;

    _subscription?.cancel();
    _subscription = SupabaseConfig.client
        .from('bookings')
        .stream(primaryKey: ['id'])
        .eq('user_id', userId)
        .listen((data) {
          _fetchBookingsWithJoins();
        });
  }

  Future<void> _fetchBookingsWithJoins() async {
    final userId = SupabaseConfig.currentUser?.id;
    if (userId == null) return;

    try {
      final response = await SupabaseConfig.client.from('bookings').select('''
            *,
            stations:station_id (name, address),
            chargers:charger_id (connector_type, power_kw)
          ''').eq('user_id', userId).order('start_time', ascending: false);

      _bookings =
          (response as List).map((json) => Booking.fromJson(json)).toList();
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching bookings: $e');
    }
  }

  Future<void> fetchBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _fetchBookingsWithJoins();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Booking?> createBooking({
    required String stationId,
    required String chargerId,
    required DateTime startTime,
    required int durationMinutes,
    double? totalPrice,
  }) async {
    final userId = SupabaseConfig.currentUser?.id;
    if (userId == null) {
      _error = 'Not authenticated';
      notifyListeners();
      return null;
    }

    try {
      final endTime = startTime.add(Duration(minutes: durationMinutes));

      final response = await SupabaseConfig.client.from('bookings').insert({
        'user_id': userId,
        'station_id': stationId,
        'charger_id': chargerId,
        'start_time': startTime.toIso8601String(),
        'end_time': endTime.toIso8601String(),
        'status': 'confirmed',
        'total_price': totalPrice,
      }).select('''
            *,
            stations:station_id (name, address),
            chargers:charger_id (connector_type, power_kw)
          ''').single();

      final booking = Booking.fromJson(response);
      _bookings.insert(0, booking);
      notifyListeners();
      return booking;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<bool> cancelBooking(String bookingId) async {
    try {
      await SupabaseConfig.client
          .from('bookings')
          .update({'status': 'cancelled'}).eq('id', bookingId);

      final index = _bookings.indexWhere((b) => b.id == bookingId);
      if (index != -1) {
        _bookings[index] = _bookings[index].copyWith(status: 'cancelled');
        notifyListeners();
      }
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> checkIn(String bookingId) async {
    try {
      await SupabaseConfig.client
          .from('bookings')
          .update({'status': 'completed'}).eq('id', bookingId);

      final index = _bookings.indexWhere((b) => b.id == bookingId);
      if (index != -1) {
        _bookings[index] = _bookings[index].copyWith(status: 'completed');
        notifyListeners();
      }
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Booking? getBookingById(String id) {
    try {
      return _bookings.firstWhere((b) => b.id == id);
    } catch (e) {
      return null;
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
