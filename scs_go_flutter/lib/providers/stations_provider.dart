import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../models/station.dart';
import '../services/open_charge_map_service.dart';
import '../config/api_config.dart';

class StationsProvider extends ChangeNotifier {
  List<Station> _stations = [];
  final List<Station> _favorites = [];
  bool _loading = false;
  String? _error;
  bool _usingMockData = false;

  final OpenChargeMapService _ocmService = OpenChargeMapService();

  List<Station> get stations => _stations;
  List<Station> get favorites => _favorites;
  bool get loading => _loading;
  String? get error => _error;
  bool get usingMockData => _usingMockData;

  StationsProvider() {
    loadStations();
  }

  /// Load trạm sạc từ OpenChargeMap API
  /// Fallback về mock data nếu API fail hoặc không có kết quả
  Future<void> loadStations({double? latitude, double? longitude}) async {
    _loading = true;
    _error = null;
    _usingMockData = false;
    notifyListeners();

    try {
      // Lấy vị trí hiện tại nếu không truyền tham số
      double lat = latitude ?? ApiConfig.defaultLatitude;
      double lng = longitude ?? ApiConfig.defaultLongitude;

      // Thử lấy GPS với timeout 5 giây
      if (latitude == null && longitude == null) {
        try {
          final position =
              await _getCurrentPosition().timeout(const Duration(seconds: 5));
          if (position != null) {
            lat = position.latitude;
            lng = position.longitude;
            debugPrint('📍 Using current location: $lat, $lng');
          } else {
            debugPrint('📍 GPS not available, using default HCM location');
          }
        } catch (e) {
          debugPrint('⚠️ Could not get location: $e, using default');
        }
      }
      debugPrint('📍 Location: $lat, $lng');

      // Gọi OpenChargeMap API
      debugPrint('🔌 Fetching stations from OpenChargeMap...');
      final stations = await _ocmService.fetchStations(
        latitude: lat,
        longitude: lng,
      );

      if (stations.isNotEmpty) {
        _stations = stations;
        debugPrint('✅ Loaded ${stations.length} stations from OpenChargeMap');
      } else {
        // Không có trạm nào, dùng mock data
        debugPrint('⚠️ No stations found, using mock data');
        _stations = _getMockStations();
        _usingMockData = true;
      }

      _loading = false;
      notifyListeners();
    } on OpenChargeMapException catch (e) {
      debugPrint('❌ OpenChargeMap API Error: $e');
      _error = 'Không thể tải dữ liệu từ server. Đang sử dụng dữ liệu mẫu.';
      _stations = _getMockStations();
      _usingMockData = true;
      _loading = false;
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error loading stations: $e');
      _error = 'Lỗi: $e. Đang sử dụng dữ liệu mẫu.';
      _stations = _getMockStations();
      _usingMockData = true;
      _loading = false;
      notifyListeners();
    }
  }

  /// Lấy vị trí hiện tại
  Future<Position?> _getCurrentPosition() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return null;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return null;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return null;
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.medium,
    );
  }

  /// Refresh stations with current location
  Future<void> refreshStations() async {
    await loadStations();
  }

  Station? getStationById(String id) {
    try {
      return _stations.firstWhere((s) => s.id == id);
    } catch (e) {
      return null;
    }
  }

  void toggleFavorite(Station station) {
    if (_favorites.any((s) => s.id == station.id)) {
      _favorites.removeWhere((s) => s.id == station.id);
    } else {
      _favorites.add(station);
    }
    notifyListeners();
  }

  bool isFavorite(String stationId) {
    return _favorites.any((s) => s.id == stationId);
  }

  void clearFavorites() {
    _favorites.clear();
    notifyListeners();
  }

  List<Station> _getMockStations() {
    return [
      Station(
        id: '1',
        operatorId: 'op1',
        name: 'VinFast Charging - Vincom Center',
        address: '72 Lê Thánh Tôn, Quận 1, TP.HCM',
        lat: 10.7769,
        lng: 106.7009,
        provider: 'VinFast',
        hoursJson: StationHours(open: '00:00', close: '23:59', is24h: true),
        amenitiesJson: ['Wifi', 'Toilet', 'Cafe', 'Parking'],
        status: 'approved',
        chargers: [
          Charger(
              id: 'c1',
              stationId: '1',
              connectorType: 'CCS2',
              powerKw: 150,
              status: 'available',
              pricePerKwh: 3500),
          Charger(
              id: 'c2',
              stationId: '1',
              connectorType: 'CCS2',
              powerKw: 150,
              status: 'occupied',
              pricePerKwh: 3500),
          Charger(
              id: 'c3',
              stationId: '1',
              connectorType: 'Type2',
              powerKw: 22,
              status: 'available',
              pricePerKwh: 3000),
        ],
        avgRating: 4.8,
        reviewCount: 127,
        distanceKm: 1.2,
      ),
      Station(
        id: '2',
        operatorId: 'op2',
        name: 'EVN Fast Charge - Hàng Xanh',
        address: '235 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM',
        lat: 10.8012,
        lng: 106.7144,
        provider: 'EVN',
        hoursJson: StationHours(open: '06:00', close: '22:00', is24h: false),
        amenitiesJson: ['Wifi', 'Parking'],
        status: 'approved',
        chargers: [
          Charger(
              id: 'c4',
              stationId: '2',
              connectorType: 'CCS2',
              powerKw: 120,
              status: 'available',
              pricePerKwh: 3200),
          Charger(
              id: 'c5',
              stationId: '2',
              connectorType: 'CHAdeMO',
              powerKw: 50,
              status: 'available',
              pricePerKwh: 3000),
        ],
        avgRating: 4.5,
        reviewCount: 89,
        distanceKm: 2.5,
      ),
      Station(
        id: '3',
        operatorId: 'op3',
        name: 'ChargePoint - Crescent Mall',
        address: '101 Tôn Dật Tiên, Quận 7, TP.HCM',
        lat: 10.7295,
        lng: 106.7218,
        provider: 'ChargePoint',
        hoursJson: StationHours(open: '00:00', close: '23:59', is24h: true),
        amenitiesJson: ['Wifi', 'Toilet', 'Shopping', 'Restaurant', 'Parking'],
        status: 'approved',
        chargers: [
          Charger(
              id: 'c6',
              stationId: '3',
              connectorType: 'CCS2',
              powerKw: 350,
              status: 'available',
              pricePerKwh: 4000),
          Charger(
              id: 'c7',
              stationId: '3',
              connectorType: 'CCS2',
              powerKw: 350,
              status: 'available',
              pricePerKwh: 4000),
          Charger(
              id: 'c8',
              stationId: '3',
              connectorType: 'Type2',
              powerKw: 22,
              status: 'out_of_service',
              pricePerKwh: 3500),
        ],
        avgRating: 4.9,
        reviewCount: 256,
        distanceKm: 5.8,
      ),
      Station(
        id: '4',
        operatorId: 'op1',
        name: 'VinFast Charging - Thảo Điền',
        address: '89 Nguyễn Văn Hưởng, Quận 2, TP.HCM',
        lat: 10.8038,
        lng: 106.7390,
        provider: 'VinFast',
        hoursJson: StationHours(open: '00:00', close: '23:59', is24h: true),
        amenitiesJson: ['Wifi', 'Toilet', 'Cafe'],
        status: 'approved',
        chargers: [
          Charger(
              id: 'c9',
              stationId: '4',
              connectorType: 'CCS2',
              powerKw: 150,
              status: 'occupied',
              pricePerKwh: 3500),
          Charger(
              id: 'c10',
              stationId: '4',
              connectorType: 'Type2',
              powerKw: 22,
              status: 'available',
              pricePerKwh: 3000),
        ],
        avgRating: 4.6,
        reviewCount: 78,
        distanceKm: 3.2,
      ),
      Station(
        id: '5',
        operatorId: 'op4',
        name: 'EVGO Station - Bitexco Tower',
        address: '2 Hải Triều, Quận 1, TP.HCM',
        lat: 10.7716,
        lng: 106.7048,
        provider: 'EVGO',
        hoursJson: StationHours(open: '07:00', close: '23:00', is24h: false),
        amenitiesJson: ['Wifi', 'Restaurant', 'Shopping'],
        status: 'approved',
        chargers: [
          Charger(
              id: 'c11',
              stationId: '5',
              connectorType: 'CCS2',
              powerKw: 200,
              status: 'available',
              pricePerKwh: 3800),
          Charger(
              id: 'c12',
              stationId: '5',
              connectorType: 'CCS2',
              powerKw: 200,
              status: 'available',
              pricePerKwh: 3800),
          Charger(
              id: 'c13',
              stationId: '5',
              connectorType: 'CHAdeMO',
              powerKw: 100,
              status: 'available',
              pricePerKwh: 3500),
        ],
        avgRating: 4.7,
        reviewCount: 143,
        distanceKm: 0.8,
      ),
    ];
  }
}
