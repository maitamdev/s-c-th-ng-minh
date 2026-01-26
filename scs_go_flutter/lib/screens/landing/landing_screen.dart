import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/stations_provider.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  final TextEditingController _addressController = TextEditingController();
  bool _isAnalyzing = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _analyzeWithAI() async {
    final lang = context.read<LanguageProvider>();

    setState(() => _isAnalyzing = true);

    try {
      // Kiểm tra GPS service
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _showErrorSnackbar(lang.isVietnamese
            ? 'Vui lòng bật GPS để sử dụng tính năng này'
            : 'Please enable GPS to use this feature');
        setState(() => _isAnalyzing = false);
        return;
      }

      // Kiểm tra permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showErrorSnackbar(lang.isVietnamese
              ? 'Cần quyền truy cập vị trí để tìm trạm sạc gần bạn'
              : 'Location permission required to find nearby stations');
          setState(() => _isAnalyzing = false);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        _showErrorSnackbar(lang.isVietnamese
            ? 'Vui lòng cho phép truy cập vị trí trong Cài đặt'
            : 'Please enable location access in Settings');
        setState(() => _isAnalyzing = false);
        return;
      }

      // Lấy vị trí hiện tại
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () => throw Exception('GPS timeout'),
      );

      debugPrint(
          '📍 Got location: ${position.latitude}, ${position.longitude}');

      // Load stations với vị trí mới
      if (mounted) {
        final stationsProvider = context.read<StationsProvider>();
        await stationsProvider.loadStations(
          latitude: position.latitude,
          longitude: position.longitude,
        );

        // Chuyển đến Explore với thông báo AI
        if (mounted) {
          _showSuccessSnackbar(lang.isVietnamese
              ? '🤖 AI đã tìm thấy ${stationsProvider.stations.length} trạm sạc gần bạn!'
              : '🤖 AI found ${stationsProvider.stations.length} stations near you!');
          context.go('/explore');
        }
      }
    } catch (e) {
      debugPrint('Error analyzing location: $e');
      _showErrorSnackbar(lang.isVietnamese
          ? 'Không thể xác định vị trí. Vui lòng thử lại.'
          : 'Could not determine location. Please try again.');
    } finally {
      if (mounted) {
        setState(() => _isAnalyzing = false);
      }
    }
  }

  void _searchByAddress() {
    final address = _addressController.text.trim();
    if (address.isEmpty) {
      final lang = context.read<LanguageProvider>();
      _showErrorSnackbar(lang.isVietnamese
          ? 'Vui lòng nhập địa chỉ'
          : 'Please enter an address');
      return;
    }

    // TODO: Geocode address to lat/lng using Google Maps API
    // For now, go to explore with search query
    context.go('/explore');
  }

  void _showErrorSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _showSuccessSnackbar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      body: Stack(
        children: [
          // Background gradient effects
          Positioned(
            top: -150,
            left: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withOpacity(0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 50,
            right: -100,
            child: Container(
              width: 350,
              height: 350,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.cyan.withOpacity(0.1),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Main content
          SafeArea(
            child: Column(
              children: [
                // Content (scrollable)
                Expanded(
                  child: SingleChildScrollView(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      child: FadeTransition(
                        opacity: _fadeAnimation,
                        child: SlideTransition(
                          position: _slideAnimation,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const SizedBox(height: 40),

                              // Logo
                              ClipRRect(
                                borderRadius: BorderRadius.circular(24),
                                child: Image.asset(
                                  'assets/images/logo.jpg',
                                  width: 80,
                                  height: 80,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      width: 80,
                                      height: 80,
                                      decoration: BoxDecoration(
                                        gradient: const LinearGradient(
                                          colors: [
                                            AppColors.primary,
                                            AppColors.cyanLight
                                          ],
                                        ),
                                        borderRadius: BorderRadius.circular(24),
                                      ),
                                      child: const Icon(Icons.bolt,
                                          color: Colors.white, size: 40),
                                    );
                                  },
                                ),
                              ),

                              const SizedBox(height: 16),

                              // App name
                              ShaderMask(
                                shaderCallback: (bounds) =>
                                    const LinearGradient(
                                  colors: [
                                    AppColors.primary,
                                    AppColors.cyanLight
                                  ],
                                ).createShader(bounds),
                                child: Text(
                                  'SCS GO',
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineMedium
                                      ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                ),
                              ),

                              const SizedBox(height: 24),

                              // Title
                              Text(
                                lang.isVietnamese
                                    ? 'Tìm trạm sạc thông minh'
                                    : 'Smart Charging Station Finder',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleLarge
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                textAlign: TextAlign.center,
                              ),

                              const SizedBox(height: 8),

                              Text(
                                lang.isVietnamese
                                    ? 'AI sẽ phân tích vị trí và đưa ra trạm sạc gần nhất'
                                    : 'AI will analyze your location and find nearest stations',
                                style: Theme.of(context)
                                    .textTheme
                                    .bodyMedium
                                    ?.copyWith(
                                      color: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.color,
                                    ),
                                textAlign: TextAlign.center,
                              ),

                              const SizedBox(height: 32),

                              // Address input
                              Container(
                                decoration: BoxDecoration(
                                  color: Theme.of(context).cardColor,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: Theme.of(context).dividerColor,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.05),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: TextField(
                                  controller: _addressController,
                                  decoration: InputDecoration(
                                    hintText: lang.isVietnamese
                                        ? 'Nhập địa chỉ của bạn...'
                                        : 'Enter your address...',
                                    prefixIcon: const Icon(
                                      Icons.location_on_outlined,
                                      color: AppColors.primary,
                                    ),
                                    suffixIcon: IconButton(
                                      icon: const Icon(Icons.search),
                                      onPressed: _searchByAddress,
                                    ),
                                    border: InputBorder.none,
                                    contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                      vertical: 16,
                                    ),
                                  ),
                                  onSubmitted: (_) => _searchByAddress(),
                                ),
                              ),

                              const SizedBox(height: 16),

                              // AI Analyze Button
                              SizedBox(
                                width: double.infinity,
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [
                                        AppColors.primary,
                                        AppColors.cyanLight
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(16),
                                    boxShadow: [
                                      BoxShadow(
                                        color:
                                            AppColors.primary.withOpacity(0.4),
                                        blurRadius: 15,
                                        offset: const Offset(0, 6),
                                      ),
                                    ],
                                  ),
                                  child: ElevatedButton(
                                    onPressed:
                                        _isAnalyzing ? null : _analyzeWithAI,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.transparent,
                                      shadowColor: Colors.transparent,
                                      disabledBackgroundColor:
                                          Colors.transparent,
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 16),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                    ),
                                    child: _isAnalyzing
                                        ? const Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: [
                                              SizedBox(
                                                width: 20,
                                                height: 20,
                                                child:
                                                    CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  color: Colors.white,
                                                ),
                                              ),
                                              SizedBox(width: 12),
                                              Text(
                                                'Đang phân tích...',
                                                style: TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.w600,
                                                  fontSize: 16,
                                                ),
                                              ),
                                            ],
                                          )
                                        : Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: [
                                              const Icon(
                                                Icons.auto_awesome,
                                                color: Colors.white,
                                              ),
                                              const SizedBox(width: 10),
                                              Text(
                                                lang.isVietnamese
                                                    ? 'AI Phân tích vị trí'
                                                    : 'AI Analyze Location',
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 16,
                                                ),
                                              ),
                                            ],
                                          ),
                                  ),
                                ),
                              ),

                              const SizedBox(height: 12),

                              Text(
                                lang.isVietnamese
                                    ? '🤖 Sử dụng GPS để tìm trạm sạc gần nhất'
                                    : '🤖 Uses GPS to find nearest stations',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),

                              const SizedBox(height: 32),

                              // Features list
                              _buildFeatureItem(
                                context,
                                Icons.gps_fixed,
                                lang.isVietnamese
                                    ? 'Định vị chính xác vị trí của bạn'
                                    : 'Accurately locate your position',
                              ),
                              const SizedBox(height: 12),
                              _buildFeatureItem(
                                context,
                                Icons.bolt,
                                lang.isVietnamese
                                    ? 'AI gợi ý trạm phù hợp nhất'
                                    : 'AI recommends best stations',
                              ),
                              const SizedBox(height: 12),
                              _buildFeatureItem(
                                context,
                                Icons.calendar_today,
                                lang.isVietnamese
                                    ? 'Đặt chỗ trước, không lo hết chỗ'
                                    : 'Book ahead, never miss a spot',
                              ),
                              const SizedBox(height: 12),
                              _buildFeatureItem(
                                context,
                                Icons.attach_money,
                                lang.isVietnamese
                                    ? 'So sánh giá minh bạch'
                                    : 'Compare prices transparently',
                              ),

                              const SizedBox(height: 60),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                // Bottom bar
                _buildBottomBar(context, lang),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(BuildContext context, IconData icon, String text) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.primary, size: 20),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomBar(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            // Skip/Explore button
            Expanded(
              child: OutlinedButton(
                onPressed: () => context.go('/explore'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: const BorderSide(color: AppColors.primary),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  lang.isVietnamese ? 'Khám phá' : 'Explore',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Login button
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary, AppColors.cyanLight],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ElevatedButton(
                  onPressed: () => context.push('/login'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    lang.isVietnamese ? 'Đăng nhập' : 'Login',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
