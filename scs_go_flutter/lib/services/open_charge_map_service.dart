import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/station.dart';

/// Service để gọi OpenChargeMap API
class OpenChargeMapService {
  final http.Client _client;

  OpenChargeMapService({http.Client? client})
      : _client = client ?? http.Client();

  /// Lấy danh sách trạm sạc theo vị trí
  Future<List<Station>> fetchStations({
    double? latitude,
    double? longitude,
    int? distanceKm,
    String? countryCode,
    int? maxResults,
  }) async {
    final lat = latitude ?? ApiConfig.defaultLatitude;
    final lng = longitude ?? ApiConfig.defaultLongitude;
    final distance = distanceKm ?? ApiConfig.defaultDistanceKm;
    final max = maxResults ?? ApiConfig.defaultMaxResults;

    // Lưu vị trí user để tính distance chính xác
    final userLat = lat;
    final userLng = lng;

    // Ưu tiên country code nếu có, nếu không thì lấy theo vị trí
    final uri = Uri.parse('${ApiConfig.openChargeMapBaseUrl}/poi').replace(
      queryParameters: {
        'output': 'json',
        'latitude': lat.toString(),
        'longitude': lng.toString(),
        'distance': distance.toString(),
        'distanceunit': 'km',
        'maxresults': max.toString(),
        'compact': 'true',
        'verbose': 'false',
        // Ưu tiên VN nếu vị trí ở Việt Nam (lat: 8-24, lng: 102-110)
        if (lat >= 8.0 && lat <= 24.0 && lng >= 102.0 && lng <= 110.0)
          'countrycode': 'VN',
        if (countryCode != null) 'countrycode': countryCode,
        if (ApiConfig.openChargeMapApiKey.isNotEmpty)
          'key': ApiConfig.openChargeMapApiKey,
      },
    );

    debugPrint('🌐 OpenChargeMap URL: $uri');

    try {
      final response = await _client.get(
        uri,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SCS-GO-Flutter/1.0.0 (EV Charging App)',
        },
      ).timeout(const Duration(seconds: 15));

      debugPrint('📥 Response status: ${response.statusCode}');
      debugPrint('📥 Response length: ${response.body.length} bytes');

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        debugPrint('✅ Parsed ${data.length} stations from API');

        if (data.isEmpty) {
          debugPrint('⚠️ API returned empty array');
          return [];
        }

        // Debug first item structure
        if (data.isNotEmpty) {
          debugPrint('📋 First item keys: ${(data[0] as Map).keys.toList()}');
        }

        final stations = <Station>[];
        for (var item in data) {
          try {
            final station = _mapToStation(item);
            // Tính lại khoảng cách từ vị trí user (chính xác hơn API)
            final calculatedDistance =
                _calculateDistance(userLat, userLng, station.lat, station.lng);
            stations.add(Station(
              id: station.id,
              operatorId: station.operatorId,
              name: station.name,
              address: station.address,
              lat: station.lat,
              lng: station.lng,
              provider: station.provider,
              hoursJson: station.hoursJson,
              amenitiesJson: station.amenitiesJson,
              status: station.status,
              chargers: station.chargers,
              avgRating: station.avgRating,
              reviewCount: station.reviewCount,
              distanceKm: calculatedDistance,
            ));
          } catch (e) {
            debugPrint('⚠️ Error mapping station: $e');
          }
        }

        // Sắp xếp theo khoảng cách (gần nhất trước)
        stations.sort((a, b) {
          final distA = a.distanceKm ?? double.infinity;
          final distB = b.distanceKm ?? double.infinity;
          return distA.compareTo(distB);
        });

        debugPrint('✅ Mapped ${stations.length} stations, sorted by distance');
        if (stations.isNotEmpty) {
          debugPrint(
              '📍 Nearest: ${stations.first.name} - ${stations.first.distanceKm?.toStringAsFixed(1)} km');
        }
        return stations;
      } else {
        debugPrint('❌ API Error: ${response.statusCode} - ${response.body}');
        throw OpenChargeMapException(
          'API Error: ${response.statusCode}',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      debugPrint('❌ Network/Parsing error: $e');
      if (e is OpenChargeMapException) rethrow;
      throw OpenChargeMapException('Network error: $e');
    }
  }

  /// Chuyển đổi dữ liệu từ OpenChargeMap sang Station model
  Station _mapToStation(Map<String, dynamic> ocmData) {
    final addressInfo = ocmData['AddressInfo'] as Map<String, dynamic>? ?? {};
    final connections = ocmData['Connections'] as List<dynamic>? ?? [];
    final operatorInfo = ocmData['OperatorInfo'] as Map<String, dynamic>? ?? {};
    final statusType = ocmData['StatusType'] as Map<String, dynamic>?;

    // Parse chargers from connections
    final chargers = connections.map((conn) {
      final connMap = conn as Map<String, dynamic>;
      final connType = connMap['ConnectionType'] as Map<String, dynamic>? ?? {};
      final level = connMap['Level'] as Map<String, dynamic>? ?? {};
      final statusConn = connMap['StatusType'] as Map<String, dynamic>?;

      final powerKw = (connMap['PowerKW'] as num?)?.toDouble() ??
          (level['Comments'] != null
              ? _parsePowerFromComments(level['Comments'])
              : 22.0);

      // Tính giá ước lượng theo công suất (VND/kWh)
      // DC Fast Charging (>50kW): 4500đ/kWh
      // AC Normal (<50kW): 3500đ/kWh
      final estimatedPrice = powerKw >= 50 ? 4500.0 : 3500.0;

      return Charger(
        id: (connMap['ID'] ?? 0).toString(),
        stationId: ocmData['ID'].toString(),
        connectorType: _mapConnectorType(connType['Title'] ?? 'Unknown'),
        powerKw: powerKw,
        status: _mapChargerStatus(statusConn),
        pricePerKwh: estimatedPrice,
      );
    }).toList();

    // Parse amenities từ UsageType
    final usageType = ocmData['UsageType'] as Map<String, dynamic>? ?? {};
    List<String> amenities = [];
    if (usageType['IsPayAtLocation'] == true) amenities.add('Payment');
    if (usageType['IsMembershipRequired'] == true) amenities.add('Membership');
    if (addressInfo['AccessComments'] != null) amenities.add('Parking');

    return Station(
      id: ocmData['ID'].toString(),
      operatorId: (operatorInfo['ID'] ?? 0).toString(),
      name: addressInfo['Title'] ?? 'Unknown Station',
      address: _buildAddress(addressInfo),
      lat: (addressInfo['Latitude'] as num?)?.toDouble() ?? 0,
      lng: (addressInfo['Longitude'] as num?)?.toDouble() ?? 0,
      provider: operatorInfo['Title'] ?? 'Unknown Provider',
      hoursJson: StationHours(
        open: '00:00',
        close: '23:59',
        is24h: usageType['IsAccessKeyRequired'] != true,
      ),
      amenitiesJson: amenities,
      status: _mapStationStatus(statusType),
      chargers: chargers,
      avgRating:
          (ocmData['UserComments'] as List?)?.isNotEmpty == true ? 4.0 : null,
      reviewCount: (ocmData['UserComments'] as List?)?.length ?? 0,
      distanceKm: (addressInfo['Distance'] as num?)?.toDouble(),
    );
  }

  String _buildAddress(Map<String, dynamic> addressInfo) {
    final parts = <String>[];
    if (addressInfo['AddressLine1'] != null) {
      parts.add(addressInfo['AddressLine1']);
    }
    if (addressInfo['Town'] != null) {
      parts.add(addressInfo['Town']);
    }
    if (addressInfo['StateOrProvince'] != null) {
      parts.add(addressInfo['StateOrProvince']);
    }
    return parts.isNotEmpty ? parts.join(', ') : 'Unknown Address';
  }

  String _mapConnectorType(String ocmType) {
    // Map OpenChargeMap connector types to app connector types
    final typeMap = {
      'CCS (Type 2)': 'CCS2',
      'CCS (Type 1)': 'CCS1',
      'CHAdeMO': 'CHAdeMO',
      'Type 2 (Socket Only)': 'Type2',
      'Type 2 (Tethered Connector)': 'Type2',
      'Type 1 (J1772)': 'Type1',
      'Tesla Supercharger': 'Tesla',
      'GB/T 20234.2 (AC)': 'GB/T AC',
      'GB/T 20234.3 (DC)': 'GB/T DC',
    };
    return typeMap[ocmType] ?? ocmType;
  }

  String _mapChargerStatus(Map<String, dynamic>? statusType) {
    if (statusType == null)
      return 'available'; // Default available nếu không có thông tin
    final isOperational =
        statusType['IsOperational'] as bool? ?? true; // Default true
    if (isOperational) return 'available';
    return 'out_of_service';
  }

  String _mapStationStatus(Map<String, dynamic>? statusType) {
    if (statusType == null) return 'approved';
    final isOperational = statusType['IsOperational'] as bool? ?? true;
    return isOperational ? 'approved' : 'inactive';
  }

  double _parsePowerFromComments(String comments) {
    // Try to extract power from comments like "22 kW" or "150kW"
    final regex = RegExp(r'(\d+)\s*kW', caseSensitive: false);
    final match = regex.firstMatch(comments);
    if (match != null) {
      return double.parse(match.group(1)!);
    }
    return 22.0; // Default power
  }

  /// Tính khoảng cách giữa 2 điểm GPS (Haversine formula)
  double _calculateDistance(
      double lat1, double lng1, double lat2, double lng2) {
    const double earthRadius = 6371; // km

    final dLat = (lat2 - lat1) * pi / 180;
    final dLng = (lng2 - lng1) * pi / 180;

    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * pi / 180) *
            cos(lat2 * pi / 180) *
            sin(dLng / 2) *
            sin(dLng / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return earthRadius * c;
  }

  void dispose() {
    _client.close();
  }
}

/// Exception cho OpenChargeMap API errors
class OpenChargeMapException implements Exception {
  final String message;
  final int? statusCode;

  OpenChargeMapException(this.message, {this.statusCode});

  @override
  String toString() => 'OpenChargeMapException: $message';
}
