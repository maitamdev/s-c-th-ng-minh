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
      _bookings.where((b) => b.status == 'confirmed').toList();
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

  /// Kiểm tra xem có booking nào bị trùng thời gian không
  Future<bool> checkBookingConflict({
    required String chargerId,
    required DateTime startTime,
    required DateTime endTime,
  }) async {
    try {
      // Query tất cả bookings của charger này có status confirmed/active
      // trong khoảng thời gian bị overlap
      final response = await SupabaseConfig.client
          .from('bookings')
          .select('id, start_time, end_time')
          .eq('charger_id', chargerId)
          .inFilter('status', [
        'confirmed',
        'active'
      ]).or('start_time.lte.${endTime.toIso8601String()},end_time.gte.${startTime.toIso8601String()}');

      final bookings = response as List;

      // Kiểm tra từng booking xem có overlap không
      for (var booking in bookings) {
        final existingStart = DateTime.parse(booking['start_time']);
        final existingEnd = DateTime.parse(booking['end_time']);

        // Overlap nếu: new_start < existing_end AND new_end > existing_start
        if (startTime.isBefore(existingEnd) && endTime.isAfter(existingStart)) {
          debugPrint('⚠️ Booking conflict found with booking ${booking['id']}');
          return true; // Có xung đột
        }
      }

      return false; // Không có xung đột
    } catch (e) {
      debugPrint('Error checking booking conflict: $e');
      return false; // Nếu lỗi, cho phép đặt (sẽ fail ở backend nếu có conflict)
    }
  }

  Future<Booking?> createBooking({
    required String stationId,
    required String chargerId,
    required DateTime startTime,
    required int durationMinutes,
    double? totalPrice,
    String? stationName,
    String? connectorType,
  }) async {
    final userId = SupabaseConfig.currentUser?.id;
    if (userId == null) {
      _error = 'Not authenticated';
      notifyListeners();
      return null;
    }

    try {
      final endTime = startTime.add(Duration(minutes: durationMinutes));

      // Kiểm tra xung đột trước khi đặt
      final hasConflict = await checkBookingConflict(
        chargerId: chargerId,
        startTime: startTime,
        endTime: endTime,
      );

      if (hasConflict) {
        _error = 'Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.';
        notifyListeners();
        return null;
      }

      // station_id và charger_id giờ là TEXT, không cần chuyển UUID
      final response = await SupabaseConfig.client
          .from('bookings')
          .insert({
            'user_id': userId,
            'station_id': stationId,
            'charger_id': chargerId,
            'start_time': startTime.toIso8601String(),
            'end_time': endTime.toIso8601String(),
            'status': 'confirmed',
            'total_price': totalPrice,
            'notes': 'Station: $stationName, Connector: $connectorType',
          })
          .select()
          .single();

      // Tạo booking object với thông tin trạm
      final booking = Booking(
        id: response['id'] as String,
        userId: userId,
        stationId: stationId,
        chargerId: chargerId,
        startTime: startTime,
        endTime: endTime,
        status: 'confirmed',
        totalPrice: totalPrice,
        createdAt: DateTime.now(),
        stationName: stationName,
        chargerType: connectorType,
      );

      _bookings.insert(0, booking);
      notifyListeners();
      return booking;
    } catch (e) {
      _error = e.toString();
      debugPrint('Booking error: $e');
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
