class Station {
  final String id;
  final String operatorId;
  final String name;
  final String address;
  final double lat;
  final double lng;
  final String provider;
  final StationHours hoursJson;
  final List<String> amenitiesJson;
  final String status;
  final List<Charger>? chargers;
  final double? avgRating;
  final int? reviewCount;
  final double? distanceKm;

  Station({
    required this.id,
    required this.operatorId,
    required this.name,
    required this.address,
    required this.lat,
    required this.lng,
    required this.provider,
    required this.hoursJson,
    required this.amenitiesJson,
    required this.status,
    this.chargers,
    this.avgRating,
    this.reviewCount,
    this.distanceKm,
  });

  // Computed properties
  int get availableChargers =>
      chargers?.where((c) => c.status == 'available').length ?? 0;
  int get totalChargers => chargers?.length ?? 0;
  double get minPrice {
    if (chargers == null || chargers!.isEmpty) return 0;
    return chargers!.map((c) => c.pricePerKwh).reduce((a, b) => a < b ? a : b);
  }

  double get maxPower {
    if (chargers == null || chargers!.isEmpty) return 0;
    return chargers!.map((c) => c.powerKw).reduce((a, b) => a > b ? a : b);
  }

  factory Station.fromJson(Map<String, dynamic> json) {
    return Station(
      id: json['id'] as String,
      operatorId: json['operator_id'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      provider: json['provider'] as String,
      hoursJson:
          StationHours.fromJson(json['hours_json'] as Map<String, dynamic>),
      amenitiesJson: (json['amenities_json'] as List).cast<String>(),
      status: json['status'] as String,
      chargers:
          (json['chargers'] as List?)?.map((c) => Charger.fromJson(c)).toList(),
      avgRating: (json['avg_rating'] as num?)?.toDouble(),
      reviewCount: json['review_count'] as int?,
      distanceKm: (json['distance_km'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'operator_id': operatorId,
      'name': name,
      'address': address,
      'lat': lat,
      'lng': lng,
      'provider': provider,
      'hours_json': hoursJson.toJson(),
      'amenities_json': amenitiesJson,
      'status': status,
      'chargers': chargers?.map((c) => c.toJson()).toList(),
      'avg_rating': avgRating,
      'review_count': reviewCount,
      'distance_km': distanceKm,
    };
  }
}

class StationHours {
  final String open;
  final String close;
  final bool is24h;

  StationHours({
    required this.open,
    required this.close,
    required this.is24h,
  });

  factory StationHours.fromJson(Map<String, dynamic> json) {
    return StationHours(
      open: json['open'] as String,
      close: json['close'] as String,
      is24h: json['is_24h'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'open': open,
      'close': close,
      'is_24h': is24h,
    };
  }
}

class Charger {
  final String id;
  final String stationId;
  final String connectorType;
  final double powerKw;
  final String status;
  final double pricePerKwh;

  Charger({
    required this.id,
    required this.stationId,
    required this.connectorType,
    required this.powerKw,
    required this.status,
    required this.pricePerKwh,
  });

  factory Charger.fromJson(Map<String, dynamic> json) {
    return Charger(
      id: json['id'] as String,
      stationId: json['station_id'] as String,
      connectorType: json['connector_type'] as String,
      powerKw: (json['power_kw'] as num).toDouble(),
      status: json['status'] as String,
      pricePerKwh: (json['price_per_kwh'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'station_id': stationId,
      'connector_type': connectorType,
      'power_kw': powerKw,
      'status': status,
      'price_per_kwh': pricePerKwh,
    };
  }
}

class Booking {
  final String id;
  final String userId;
  final String stationId;
  final String chargerId;
  final DateTime startTime;
  final DateTime endTime;
  final String status;
  final DateTime? holdExpiresAt;
  final DateTime createdAt;
  final Station? station;
  final Charger? charger;

  Booking({
    required this.id,
    required this.userId,
    required this.stationId,
    required this.chargerId,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.holdExpiresAt,
    required this.createdAt,
    this.station,
    this.charger,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      stationId: json['station_id'] as String,
      chargerId: json['charger_id'] as String,
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: DateTime.parse(json['end_time'] as String),
      status: json['status'] as String,
      holdExpiresAt: json['hold_expires_at'] != null
          ? DateTime.parse(json['hold_expires_at'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      station:
          json['station'] != null ? Station.fromJson(json['station']) : null,
      charger:
          json['charger'] != null ? Charger.fromJson(json['charger']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'station_id': stationId,
      'charger_id': chargerId,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'status': status,
      'hold_expires_at': holdExpiresAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}
