import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/stations_provider.dart';

class TripPlannerScreen extends StatefulWidget {
  const TripPlannerScreen({super.key});

  @override
  State<TripPlannerScreen> createState() => _TripPlannerScreenState();
}

class _TripPlannerScreenState extends State<TripPlannerScreen> {
  final _originController = TextEditingController();
  final _destinationController = TextEditingController();

  // Vehicle settings
  double _batteryCapacity = 60; // kWh
  double _currentBattery = 80; // %
  double _consumptionRate = 18; // kWh/100km

  bool _isCalculating = false;
  TripPlan? _tripPlan;

  // Preset destinations
  final List<Map<String, dynamic>> _presetDestinations = [
    {'name': 'Vũng Tàu', 'lat': 10.3460, 'lng': 107.0843, 'distance': 125},
    {'name': 'Đà Lạt', 'lat': 11.9404, 'lng': 108.4583, 'distance': 308},
    {'name': 'Nha Trang', 'lat': 12.2388, 'lng': 109.1967, 'distance': 435},
    {'name': 'Phan Thiết', 'lat': 10.9289, 'lng': 108.1022, 'distance': 198},
    {'name': 'Cần Thơ', 'lat': 10.0452, 'lng': 105.7469, 'distance': 169},
  ];

  @override
  void initState() {
    super.initState();
    _originController.text = 'Vị trí hiện tại (TP.HCM)';
  }

  @override
  void dispose() {
    _originController.dispose();
    _destinationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.isVietnamese ? 'Lập lộ trình AI' : 'AI Trip Planner'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            _buildHeader(context, lang, isDark),
            const SizedBox(height: 24),

            // Route Input
            _buildRouteInput(context, lang, isDark),
            const SizedBox(height: 16),

            // Quick destinations
            _buildQuickDestinations(context, lang, isDark),
            const SizedBox(height: 24),

            // Vehicle settings
            _buildVehicleSettings(context, lang, isDark),
            const SizedBox(height: 24),

            // Calculate button
            _buildCalculateButton(context, lang),
            const SizedBox(height: 24),

            // Trip plan result
            if (_tripPlan != null) _buildTripPlanResult(context, lang, isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(
      BuildContext context, LanguageProvider lang, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.15),
            AppColors.cyanLight.withOpacity(0.08),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.route, color: AppColors.primary, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  lang.isVietnamese
                      ? 'Lập kế hoạch chuyến đi'
                      : 'Plan Your Trip',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  lang.isVietnamese
                      ? 'AI sẽ tìm trạm sạc phù hợp trên đường đi'
                      : 'AI will find charging stations along your route',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRouteInput(
      BuildContext context, LanguageProvider lang, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        children: [
          // Origin
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.my_location,
                    color: AppColors.success, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _originController,
                  decoration: InputDecoration(
                    hintText:
                        lang.isVietnamese ? 'Điểm xuất phát' : 'Starting point',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                  readOnly: true,
                ),
              ),
            ],
          ),

          // Dotted line
          Padding(
            padding: const EdgeInsets.only(left: 18),
            child: Row(
              children: [
                Column(
                  children: List.generate(
                      3,
                      (i) => Container(
                            width: 2,
                            height: 6,
                            margin: const EdgeInsets.symmetric(vertical: 2),
                            color: AppColors.primary.withOpacity(0.3),
                          )),
                ),
              ],
            ),
          ),

          // Destination
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.location_on,
                    color: AppColors.error, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _destinationController,
                  decoration: InputDecoration(
                    hintText: lang.isVietnamese
                        ? 'Nhập điểm đến...'
                        : 'Enter destination...',
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickDestinations(
      BuildContext context, LanguageProvider lang, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          lang.isVietnamese ? 'Điểm đến phổ biến' : 'Popular Destinations',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _presetDestinations.map((dest) {
            final isSelected = _destinationController.text == dest['name'];
            return ActionChip(
              label: Text('${dest['name']} (${dest['distance']}km)'),
              avatar: Icon(
                Icons.place,
                size: 18,
                color: isSelected ? Colors.white : AppColors.primary,
              ),
              backgroundColor: isSelected ? AppColors.primary : null,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : null,
              ),
              side: BorderSide(
                color: isSelected
                    ? AppColors.primary
                    : AppColors.primary.withOpacity(0.3),
              ),
              onPressed: () {
                HapticFeedback.selectionClick();
                setState(() {
                  _destinationController.text = dest['name'];
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildVehicleSettings(
      BuildContext context, LanguageProvider lang, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.directions_car, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                lang.isVietnamese ? 'Thông số xe' : 'Vehicle Settings',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Battery capacity
          _buildSliderSetting(
            context,
            lang.isVietnamese ? 'Dung lượng pin' : 'Battery Capacity',
            '${_batteryCapacity.toInt()} kWh',
            _batteryCapacity,
            30,
            100,
            (value) => setState(() => _batteryCapacity = value),
          ),

          // Current battery
          _buildSliderSetting(
            context,
            lang.isVietnamese ? 'Pin hiện tại' : 'Current Battery',
            '${_currentBattery.toInt()}%',
            _currentBattery,
            10,
            100,
            (value) => setState(() => _currentBattery = value),
          ),

          // Consumption rate
          _buildSliderSetting(
            context,
            lang.isVietnamese ? 'Tiêu thụ trung bình' : 'Avg. Consumption',
            '${_consumptionRate.toInt()} kWh/100km',
            _consumptionRate,
            12,
            25,
            (value) => setState(() => _consumptionRate = value),
          ),
        ],
      ),
    );
  }

  Widget _buildSliderSetting(
    BuildContext context,
    String label,
    String value,
    double current,
    double min,
    double max,
    ValueChanged<double> onChanged,
  ) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: Theme.of(context).textTheme.bodyMedium),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                value,
                style: const TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        Slider(
          value: current,
          min: min,
          max: max,
          activeColor: AppColors.primary,
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildCalculateButton(BuildContext context, LanguageProvider lang) {
    return SizedBox(
      width: double.infinity,
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.cyanLight],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ElevatedButton.icon(
          onPressed: _isCalculating ? null : _calculateTrip,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          icon: _isCalculating
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : const Icon(Icons.auto_awesome, color: Colors.white),
          label: Text(
            _isCalculating
                ? (lang.isVietnamese ? 'Đang tính toán...' : 'Calculating...')
                : (lang.isVietnamese ? 'AI Lập lộ trình' : 'AI Plan Route'),
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _calculateTrip() async {
    if (_destinationController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.read<LanguageProvider>().isVietnamese
              ? 'Vui lòng chọn điểm đến'
              : 'Please select a destination'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isCalculating = true);
    HapticFeedback.mediumImpact();

    // Simulate AI calculation
    await Future.delayed(const Duration(seconds: 2));

    // Find the selected destination
    final destination = _presetDestinations.firstWhere(
      (d) => d['name'] == _destinationController.text,
      orElse: () => {'name': _destinationController.text, 'distance': 150},
    );

    final totalDistance = destination['distance'] as int;

    // Calculate energy needed
    final energyNeeded = (totalDistance * _consumptionRate) / 100;
    final currentEnergy = (_batteryCapacity * _currentBattery) / 100;

    // Calculate range
    final currentRange = (currentEnergy / _consumptionRate) * 100;

    // Determine if charging stops are needed
    final List<ChargingStop> stops = [];

    if (energyNeeded > currentEnergy) {
      // Need charging stops
      double remainingDistance = totalDistance.toDouble();
      double availableRange = currentRange;
      double distanceTraveled = 0;

      final stationsProvider = context.read<StationsProvider>();
      final allStations = stationsProvider.stations;

      while (remainingDistance > availableRange * 0.9) {
        // Stop when battery reaches 20%
        final stopDistance = availableRange * 0.8;
        distanceTraveled += stopDistance;

        // Find a station near this point (mockup)
        final nearbyStation = allStations.isNotEmpty
            ? allStations[stops.length % allStations.length]
            : null;

        // Calculate charge needed
        final chargeNeeded = _batteryCapacity * 0.8; // Charge to 80%
        final chargingTime = (chargeNeeded / 100) * 60; // Assume 100kW charger

        stops.add(ChargingStop(
          stationName: nearbyStation?.name ?? 'Trạm sạc ${stops.length + 1}',
          stationAddress: nearbyStation?.address ??
              'Km ${distanceTraveled.toInt()} trên đường đi',
          distanceFromStart: distanceTraveled,
          batteryOnArrival: 20,
          chargeToPercent: 80,
          estimatedChargeTime: chargingTime.toInt(),
          stationId: nearbyStation?.id,
        ));

        remainingDistance = totalDistance - distanceTraveled;
        availableRange = (_batteryCapacity * 0.8 / _consumptionRate) * 100;
      }
    }

    // Calculate total time
    final drivingTime = (totalDistance / 80) * 60; // Assume 80km/h average
    final chargingTime =
        stops.fold<int>(0, (sum, stop) => sum + stop.estimatedChargeTime);

    setState(() {
      _tripPlan = TripPlan(
        origin: _originController.text,
        destination: destination['name'] as String,
        totalDistance: totalDistance.toDouble(),
        totalDrivingTime: drivingTime.toInt(),
        totalChargingTime: chargingTime,
        energyNeeded: energyNeeded,
        batteryOnArrival: ((currentEnergy -
                    energyNeeded +
                    (stops.length * _batteryCapacity * 0.6)) /
                _batteryCapacity *
                100)
            .clamp(0, 100),
        chargingStops: stops,
        canReachWithoutCharging: stops.isEmpty,
      );
      _isCalculating = false;
    });
  }

  Widget _buildTripPlanResult(
      BuildContext context, LanguageProvider lang, bool isDark) {
    final plan = _tripPlan!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Divider
        Row(
          children: [
            const Icon(Icons.check_circle, color: AppColors.success),
            const SizedBox(width: 8),
            Text(
              lang.isVietnamese ? 'Kế hoạch chuyến đi' : 'Trip Plan',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Summary card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                plan.canReachWithoutCharging
                    ? AppColors.success.withOpacity(0.1)
                    : AppColors.warning.withOpacity(0.1),
                Colors.transparent,
              ],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: plan.canReachWithoutCharging
                  ? AppColors.success.withOpacity(0.3)
                  : AppColors.warning.withOpacity(0.3),
            ),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildSummaryItem(
                    context,
                    Icons.straighten,
                    '${plan.totalDistance.toInt()} km',
                    lang.isVietnamese ? 'Khoảng cách' : 'Distance',
                  ),
                  _buildSummaryItem(
                    context,
                    Icons.access_time,
                    _formatDuration(
                        plan.totalDrivingTime + plan.totalChargingTime),
                    lang.isVietnamese ? 'Tổng thời gian' : 'Total Time',
                  ),
                  _buildSummaryItem(
                    context,
                    Icons.ev_station,
                    '${plan.chargingStops.length}',
                    lang.isVietnamese ? 'Điểm sạc' : 'Stops',
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: plan.canReachWithoutCharging
                      ? AppColors.success.withOpacity(0.1)
                      : AppColors.warning.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(
                      plan.canReachWithoutCharging
                          ? Icons.battery_charging_full
                          : Icons.battery_alert,
                      color: plan.canReachWithoutCharging
                          ? AppColors.success
                          : AppColors.warning,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        plan.canReachWithoutCharging
                            ? (lang.isVietnamese
                                ? '🎉 Bạn có thể đến nơi mà không cần sạc!'
                                : '🎉 You can reach without charging!')
                            : (lang.isVietnamese
                                ? '⚡ Cần ${plan.chargingStops.length} điểm dừng sạc'
                                : '⚡ ${plan.chargingStops.length} charging stop(s) needed'),
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: plan.canReachWithoutCharging
                              ? AppColors.success
                              : AppColors.warning,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Charging stops
        if (plan.chargingStops.isNotEmpty) ...[
          const SizedBox(height: 24),
          Text(
            lang.isVietnamese
                ? 'Điểm dừng sạc đề xuất'
                : 'Recommended Charging Stops',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 12),
          ...plan.chargingStops.asMap().entries.map((entry) =>
              _buildChargingStopCard(
                  context, lang, isDark, entry.key, entry.value)),
        ],

        const SizedBox(height: 100),
      ],
    );
  }

  Widget _buildSummaryItem(
      BuildContext context, IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _buildChargingStopCard(
    BuildContext context,
    LanguageProvider lang,
    bool isDark,
    int index,
    ChargingStop stop,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${index + 1}',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      stop.stationName,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    Text(
                      stop.stationAddress,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              if (stop.stationId != null)
                IconButton(
                  icon:
                      const Icon(Icons.arrow_forward, color: AppColors.primary),
                  onPressed: () => context.push('/station/${stop.stationId}'),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildStopInfo(
                Icons.location_on,
                '${stop.distanceFromStart.toInt()} km',
                lang.isVietnamese ? 'từ xuất phát' : 'from start',
              ),
              const SizedBox(width: 16),
              _buildStopInfo(
                Icons.battery_3_bar,
                '${stop.batteryOnArrival}% → ${stop.chargeToPercent}%',
                lang.isVietnamese ? 'Pin' : 'Battery',
              ),
              const SizedBox(width: 16),
              _buildStopInfo(
                Icons.schedule,
                '~${stop.estimatedChargeTime} phút',
                lang.isVietnamese ? 'Sạc' : 'Charge',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStopInfo(IconData icon, String value, String label) {
    return Expanded(
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 4),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(int minutes) {
    final hours = minutes ~/ 60;
    final mins = minutes % 60;
    if (hours > 0) {
      return '${hours}h ${mins}m';
    }
    return '${mins}m';
  }
}

// Data models
class TripPlan {
  final String origin;
  final String destination;
  final double totalDistance;
  final int totalDrivingTime;
  final int totalChargingTime;
  final double energyNeeded;
  final double batteryOnArrival;
  final List<ChargingStop> chargingStops;
  final bool canReachWithoutCharging;

  TripPlan({
    required this.origin,
    required this.destination,
    required this.totalDistance,
    required this.totalDrivingTime,
    required this.totalChargingTime,
    required this.energyNeeded,
    required this.batteryOnArrival,
    required this.chargingStops,
    required this.canReachWithoutCharging,
  });
}

class ChargingStop {
  final String stationName;
  final String stationAddress;
  final double distanceFromStart;
  final int batteryOnArrival;
  final int chargeToPercent;
  final int estimatedChargeTime;
  final String? stationId;

  ChargingStop({
    required this.stationName,
    required this.stationAddress,
    required this.distanceFromStart,
    required this.batteryOnArrival,
    required this.chargeToPercent,
    required this.estimatedChargeTime,
    this.stationId,
  });
}
