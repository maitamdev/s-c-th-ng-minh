class Vehicle {
  final String id;
  final String userId;
  final String name;
  final double batteryKwh;
  final int socCurrent; // 0-100%
  final double consumptionKwhPer100km;
  final String preferredConnector;
  final DateTime updatedAt;
  
  Vehicle({
    required this.id,
    required this.userId,
    required this.name,
    required this.batteryKwh,
    required this.socCurrent,
    required this.consumptionKwhPer100km,
    required this.preferredConnector,
    required this.updatedAt,
  });
  
  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      batteryKwh: (json['battery_kwh'] as num).toDouble(),
      socCurrent: json['soc_current'] as int,
      consumptionKwhPer100km: (json['consumption_kwh_per_100km'] as num).toDouble(),
      preferredConnector: json['preferred_connector'] as String,
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'battery_kwh': batteryKwh,
      'soc_current': socCurrent,
      'consumption_kwh_per_100km': consumptionKwhPer100km,
      'preferred_connector': preferredConnector,
      'updated_at': updatedAt.toIso8601String(),
    };
  }
  
  Vehicle copyWith({
    String? id,
    String? userId,
    String? name,
    double? batteryKwh,
    int? socCurrent,
    double? consumptionKwhPer100km,
    String? preferredConnector,
    DateTime? updatedAt,
  }) {
    return Vehicle(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      batteryKwh: batteryKwh ?? this.batteryKwh,
      socCurrent: socCurrent ?? this.socCurrent,
      consumptionKwhPer100km: consumptionKwhPer100km ?? this.consumptionKwhPer100km,
      preferredConnector: preferredConnector ?? this.preferredConnector,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
