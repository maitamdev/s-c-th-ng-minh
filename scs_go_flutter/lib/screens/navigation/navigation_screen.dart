import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../models/station.dart';

class NavigationScreen extends StatefulWidget {
  final Station station;

  const NavigationScreen({super.key, required this.station});

  @override
  State<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen>
    with TickerProviderStateMixin {
  final MapController _mapController = MapController();
  Position? _currentPosition;
  bool _isLoading = true;
  bool _isNavigating = false;
  int _currentStepIndex = 0;

  // Route info
  List<LatLng> _routePoints = [];
  List<NavigationStep> _steps = [];
  double _totalDistance = 0;
  int _estimatedTime = 0;
  double _remainingDistance = 0;
  int _remainingTime = 0;

  // Animation
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  // Location stream
  StreamSubscription<Position>? _positionStream;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _initLocation();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _positionStream?.cancel();
    super.dispose();
  }

  Future<void> _initLocation() async {
    try {
      // Check permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        _useDefaultLocation();
        return;
      }

      // Get current position with timeout
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      ).timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          throw TimeoutException('Location timeout');
        },
      );

      // Generate mock route
      _generateMockRoute();

      if (mounted) setState(() => _isLoading = false);
    } catch (e) {
      _useDefaultLocation();
    }
  }

  void _useDefaultLocation() {
    // Use default position (Ho Chi Minh City)
    _currentPosition = Position(
      latitude: 10.7769,
      longitude: 106.7009,
      timestamp: DateTime.now(),
      accuracy: 0,
      altitude: 0,
      heading: 0,
      speed: 0,
      speedAccuracy: 0,
      altitudeAccuracy: 0,
      headingAccuracy: 0,
    );
    _generateMockRoute();
    if (mounted) setState(() => _isLoading = false);
  }

  void _generateMockRoute() {
    if (_currentPosition == null) return;

    final startLat = _currentPosition!.latitude;
    final startLng = _currentPosition!.longitude;
    final endLat = widget.station.lat;
    final endLng = widget.station.lng;

    // Calculate distance
    _totalDistance = Geolocator.distanceBetween(
          startLat,
          startLng,
          endLat,
          endLng,
        ) /
        1000; // Convert to km

    // Estimate time (assuming 30km/h average in city)
    _estimatedTime = (_totalDistance / 30 * 60).round(); // in minutes
    _remainingDistance = _totalDistance;
    _remainingTime = _estimatedTime;

    // Generate route points
    _routePoints = _generateRoutePoints(
      LatLng(startLat, startLng),
      LatLng(endLat, endLng),
    );

    // Steps will be generated on-demand during build
  }

  List<LatLng> _generateRoutePoints(LatLng start, LatLng end) {
    // Generate intermediate points for a realistic-looking route
    List<LatLng> points = [start];

    // Add some waypoints to make it look like a real route
    final midLat = (start.latitude + end.latitude) / 2;
    final midLng = (start.longitude + end.longitude) / 2;

    // Add turns
    points.add(LatLng(start.latitude, midLng));
    points.add(LatLng(midLat, midLng));
    points.add(LatLng(midLat, end.longitude));
    points.add(end);

    return points;
  }

  List<LatLng> _generateAlternativeRoute(LatLng start, LatLng end) {
    // Generate a slightly different route
    List<LatLng> points = [start];

    final offset = 0.005; // Small offset for alternative route
    final midLat = (start.latitude + end.latitude) / 2 + offset;
    final midLng = (start.longitude + end.longitude) / 2 - offset;

    points.add(LatLng(start.latitude + offset, start.longitude));
    points.add(LatLng(midLat, start.longitude));
    points.add(LatLng(midLat, midLng));
    points.add(LatLng(end.latitude, midLng));
    points.add(end);

    return points;
  }

  List<NavigationStep> _generateNavigationSteps(bool isVn) {
    // Mock navigation steps based on route
    return [
      NavigationStep(
        instruction: isVn ? 'Đi thẳng về phía Bắc' : 'Head north',
        distance: '${(_totalDistance * 0.3).toStringAsFixed(1)} km',
        icon: Icons.arrow_upward,
        maneuver: 'straight',
      ),
      NavigationStep(
        instruction: isVn
            ? 'Rẽ phải vào đường Nguyễn Huệ'
            : 'Turn right onto Nguyen Hue St',
        distance: '${(_totalDistance * 0.2).toStringAsFixed(1)} km',
        icon: Icons.turn_right,
        maneuver: 'turn-right',
      ),
      NavigationStep(
        instruction: isVn ? 'Tiếp tục đi thẳng' : 'Continue straight',
        distance: '${(_totalDistance * 0.25).toStringAsFixed(1)} km',
        icon: Icons.arrow_upward,
        maneuver: 'straight',
      ),
      NavigationStep(
        instruction:
            isVn ? 'Rẽ trái vào đường Lê Lợi' : 'Turn left onto Le Loi St',
        distance: '${(_totalDistance * 0.15).toStringAsFixed(1)} km',
        icon: Icons.turn_left,
        maneuver: 'turn-left',
      ),
      NavigationStep(
        instruction: isVn
            ? 'Đích đến ở bên phải - ${widget.station.name}'
            : 'Destination on right - ${widget.station.name}',
        distance: '${(_totalDistance * 0.1).toStringAsFixed(1)} km',
        icon: Icons.location_on,
        maneuver: 'arrive',
      ),
    ];
  }

  void _startNavigation(bool isVn) {
    // Generate steps now with language context
    _steps = _generateNavigationSteps(isVn);

    setState(() {
      _isNavigating = true;
      _currentStepIndex = 0;
    });

    // Start location tracking
    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Update every 10 meters
      ),
    ).listen((position) {
      _updateNavigation(position);
    });

    // Zoom to current location
    if (_currentPosition != null) {
      _mapController.move(
        LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
        17,
      );
    }

    HapticFeedback.mediumImpact();
  }

  void _updateNavigation(Position position) {
    if (!mounted) return;

    setState(() {
      _currentPosition = position;

      // Update remaining distance
      _remainingDistance = Geolocator.distanceBetween(
            position.latitude,
            position.longitude,
            widget.station.lat,
            widget.station.lng,
          ) /
          1000;

      // Update remaining time
      _remainingTime = (_remainingDistance / 30 * 60).round();

      // Check if arrived (within 50 meters)
      if (_remainingDistance < 0.05) {
        _onArrived();
      }
    });

    // Update camera to follow user
    if (_isNavigating) {
      _mapController.move(
        LatLng(position.latitude, position.longitude),
        17,
      );
    }
  }

  void _onArrived() {
    _positionStream?.cancel();
    if (mounted) setState(() => _isNavigating = false);

    if (!mounted) return;
    final lang = context.read<LanguageProvider>();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.primary, AppColors.cyanLight],
                ),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check, color: Colors.white, size: 48),
            ),
            const SizedBox(height: 20),
            Text(
              lang.isVietnamese ? 'Bạn đã đến nơi!' : 'You have arrived!',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              widget.station.name,
              style: TextStyle(color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(lang.isVietnamese ? 'Đóng' : 'Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: Text(
              lang.isVietnamese ? 'Đặt sạc ngay' : 'Book charging',
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _stopNavigation() {
    _positionStream?.cancel();
    setState(() => _isNavigating = false);
    HapticFeedback.lightImpact();
  }

  Future<void> _openInGoogleMaps() async {
    final url = Uri.parse(
      'https://www.google.com/maps/dir/?api=1'
      '&destination=${widget.station.lat},${widget.station.lng}'
      '&travelmode=driving',
    );

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(color: AppColors.primary),
              const SizedBox(height: 16),
              Text(
                lang.isVietnamese ? 'Đang tải bản đồ...' : 'Loading map...',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: Stack(
        children: [
          // OpenStreetMap
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: LatLng(
                _currentPosition?.latitude ?? 10.7769,
                _currentPosition?.longitude ?? 106.7009,
              ),
              initialZoom: 14.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.scsgo.scs_go',
                maxNativeZoom: 19,
                maxZoom: 19,
              ),
              // Route polyline
              if (_routePoints.isNotEmpty)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _routePoints,
                      strokeWidth: 6.0,
                      color: AppColors.primary,
                    ),
                  ],
                ),
              // Markers
              MarkerLayer(
                markers: [
                  // Current location marker
                  if (_currentPosition != null)
                    Marker(
                      point: LatLng(_currentPosition!.latitude,
                          _currentPosition!.longitude),
                      width: 40,
                      height: 40,
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.blue.withOpacity(0.3),
                          border: Border.all(color: Colors.blue, width: 3),
                        ),
                        child: const Icon(Icons.navigation,
                            color: Colors.blue, size: 20),
                      ),
                    ),
                  // Destination marker
                  Marker(
                    point: LatLng(widget.station.lat, widget.station.lng),
                    width: 60,
                    height: 60,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.primary, AppColors.cyanLight],
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.ev_station,
                              color: Colors.white, size: 24),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Top navigation info (when navigating)
          if (_isNavigating) _buildNavigationHeader(lang, isDark),

          // Back button (when not navigating)
          if (!_isNavigating)
            Positioned(
              top: MediaQuery.of(context).padding.top + 10,
              left: 16,
              child: _buildCircleButton(
                icon: Icons.arrow_back,
                onTap: () => Navigator.pop(context),
              ),
            ),

          // Map controls
          Positioned(
            right: 16,
            bottom: _isNavigating ? 320 : 280,
            child: Column(
              children: [
                _buildCircleButton(
                  icon: Icons.my_location,
                  onTap: () {
                    if (_currentPosition != null) {
                      _mapController.move(
                        LatLng(_currentPosition!.latitude,
                            _currentPosition!.longitude),
                        17,
                      );
                    }
                  },
                ),
                const SizedBox(height: 8),
                _buildCircleButton(
                  icon: Icons.layers,
                  onTap: () {
                    // Toggle map type
                  },
                ),
              ],
            ),
          ),

          // Bottom panel
          _buildBottomPanel(lang, isDark),
        ],
      ),
    );
  }

  Widget _buildCircleButton({
    required IconData icon,
    required VoidCallback onTap,
    Color? backgroundColor,
  }) {
    return Material(
      color: backgroundColor ?? Colors.white,
      borderRadius: BorderRadius.circular(24),
      elevation: 4,
      shadowColor: Colors.black26,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Container(
          width: 48,
          height: 48,
          alignment: Alignment.center,
          child: Icon(icon, color: Colors.grey[700]),
        ),
      ),
    );
  }

  Widget _buildNavigationHeader(LanguageProvider lang, bool isDark) {
    final currentStep = _steps.isNotEmpty && _currentStepIndex < _steps.length
        ? _steps[_currentStepIndex]
        : null;

    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: EdgeInsets.fromLTRB(
            16, MediaQuery.of(context).padding.top + 10, 16, 16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.cyanLight],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Current instruction
            if (currentStep != null)
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      currentStep.icon,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          currentStep.distance,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          currentStep.instruction,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 14,
                          ),
                          maxLines: 2,
                        ),
                      ],
                    ),
                  ),
                  // Close navigation
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: _stopNavigation,
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomPanel(LanguageProvider lang, bool isDark) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // Route info
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  // Time
                  Expanded(
                    child: _buildInfoCard(
                      icon: Icons.access_time,
                      value:
                          _isNavigating ? '$_remainingTime' : '$_estimatedTime',
                      label: lang.isVietnamese ? 'phút' : 'min',
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Distance
                  Expanded(
                    child: _buildInfoCard(
                      icon: Icons.route,
                      value: _isNavigating
                          ? _remainingDistance.toStringAsFixed(1)
                          : _totalDistance.toStringAsFixed(1),
                      label: 'km',
                      color: Colors.orange,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Traffic
                  Expanded(
                    child: _buildInfoCard(
                      icon: Icons.traffic,
                      value: lang.isVietnamese ? 'Bình thường' : 'Moderate',
                      label: '',
                      color: Colors.green,
                      isSmallText: true,
                    ),
                  ),
                ],
              ),
            ),

            // Destination info
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[800] : Colors.grey[100],
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, AppColors.cyanLight],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.ev_station,
                          color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.station.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.station.address,
                            style: TextStyle(
                              color: Colors.grey[600],
                              fontSize: 13,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    // Available slots
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.success.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.bolt,
                              color: AppColors.success, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            '${widget.station.availableChargers}/${widget.station.totalChargers}',
                            style: const TextStyle(
                              color: AppColors.success,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Action buttons
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  // Open in Google Maps
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _openInGoogleMaps,
                      icon: Image.network(
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Google_Maps_icon_%282020%29.svg/1024px-Google_Maps_icon_%282020%29.svg.png',
                        width: 20,
                        height: 20,
                        errorBuilder: (_, __, ___) =>
                            const Icon(Icons.map, size: 20),
                      ),
                      label: Text('Google Maps'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Start/Stop navigation
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      onPressed: _isNavigating
                          ? _stopNavigation
                          : () => _startNavigation(lang.isVietnamese),
                      icon: AnimatedBuilder(
                        animation: _pulseAnimation,
                        builder: (context, child) {
                          return Transform.scale(
                            scale: _isNavigating ? _pulseAnimation.value : 1.0,
                            child: Icon(
                              _isNavigating ? Icons.stop : Icons.navigation,
                              color: Colors.white,
                            ),
                          );
                        },
                      ),
                      label: Text(
                        _isNavigating
                            ? (lang.isVietnamese ? 'Dừng dẫn đường' : 'Stop')
                            : (lang.isVietnamese ? 'Bắt đầu' : 'Start'),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                            _isNavigating ? Colors.red : AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Steps list (when navigating)
            if (_isNavigating) _buildStepsList(lang, isDark),

            SizedBox(height: MediaQuery.of(context).padding.bottom),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String value,
    required String label,
    required Color color,
    bool isSmallText = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: isSmallText ? 12 : 18,
              color: color,
            ),
          ),
          if (label.isNotEmpty)
            Text(
              label,
              style: TextStyle(
                color: color.withOpacity(0.7),
                fontSize: 11,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStepsList(LanguageProvider lang, bool isDark) {
    return Container(
      height: 120,
      margin: const EdgeInsets.only(bottom: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _steps.length,
        itemBuilder: (context, index) {
          final step = _steps[index];
          final isActive = index == _currentStepIndex;
          final isPast = index < _currentStepIndex;

          return Container(
            width: 140,
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isActive
                  ? AppColors.primary.withOpacity(0.1)
                  : (isDark ? Colors.grey[800] : Colors.grey[100]),
              borderRadius: BorderRadius.circular(12),
              border: isActive
                  ? Border.all(color: AppColors.primary, width: 2)
                  : null,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      step.icon,
                      size: 24,
                      color: isActive
                          ? AppColors.primary
                          : (isPast ? Colors.grey : Colors.grey[700]),
                    ),
                    const Spacer(),
                    Text(
                      step.distance,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isActive ? AppColors.primary : Colors.grey[700],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  step.instruction,
                  style: TextStyle(
                    fontSize: 12,
                    color: isPast ? Colors.grey : Colors.grey[700],
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class NavigationStep {
  final String instruction;
  final String distance;
  final IconData icon;
  final String maneuver;

  NavigationStep({
    required this.instruction,
    required this.distance,
    required this.icon,
    required this.maneuver,
  });
}
