class Booking {
  final String id;
  final String userId;
  final String stationId;
  final String chargerId;
  final DateTime startTime;
  final DateTime endTime;
  final String status; // held, confirmed, cancelled, completed, expired
  final double? totalPrice;
  final List<String> services;
  final String? paymentMethod;
  final String? notes;
  final DateTime createdAt;

  // Joined data
  final String? stationName;
  final String? stationAddress;
  final String? chargerType;
  final double? chargerPowerKw;

  Booking({
    required this.id,
    required this.userId,
    required this.stationId,
    required this.chargerId,
    required this.startTime,
    required this.endTime,
    required this.status,
    this.totalPrice,
    this.services = const [],
    this.paymentMethod,
    this.notes,
    required this.createdAt,
    this.stationName,
    this.stationAddress,
    this.chargerType,
    this.chargerPowerKw,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      stationId: json['station_id'] as String,
      chargerId: json['charger_id'] as String,
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: DateTime.parse(json['end_time'] as String),
      status: json['status'] as String? ?? 'confirmed',
      totalPrice: (json['total_price'] as num?)?.toDouble(),
      services: (json['services'] as List<dynamic>?)?.cast<String>() ?? [],
      paymentMethod: json['payment_method'] as String?,
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      // Joined data from stations and chargers
      stationName: json['stations']?['name'] as String?,
      stationAddress: json['stations']?['address'] as String?,
      chargerType: json['chargers']?['connector_type'] as String?,
      chargerPowerKw: (json['chargers']?['power_kw'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'station_id': stationId,
      'charger_id': chargerId,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'status': status,
      'total_price': totalPrice,
      'services': services,
      'payment_method': paymentMethod,
      'notes': notes,
    };
  }

  bool get isUpcoming =>
      status == 'confirmed' && startTime.isAfter(DateTime.now());

  bool get isActive =>
      status == 'confirmed' &&
      startTime.isBefore(DateTime.now()) &&
      endTime.isAfter(DateTime.now());

  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';

  int get durationMinutes => endTime.difference(startTime).inMinutes;

  // QR code data for check-in
  String get qrData => 'scsgo://checkin/$id';

  Booking copyWith({
    String? id,
    String? userId,
    String? stationId,
    String? chargerId,
    DateTime? startTime,
    DateTime? endTime,
    String? status,
    double? totalPrice,
    List<String>? services,
    String? paymentMethod,
    String? notes,
    DateTime? createdAt,
    String? stationName,
    String? stationAddress,
    String? chargerType,
    double? chargerPowerKw,
  }) {
    return Booking(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      stationId: stationId ?? this.stationId,
      chargerId: chargerId ?? this.chargerId,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      status: status ?? this.status,
      totalPrice: totalPrice ?? this.totalPrice,
      services: services ?? this.services,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      stationName: stationName ?? this.stationName,
      stationAddress: stationAddress ?? this.stationAddress,
      chargerType: chargerType ?? this.chargerType,
      chargerPowerKw: chargerPowerKw ?? this.chargerPowerKw,
    );
  }
}
