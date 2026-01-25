import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';

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
  final TextEditingController _searchController = TextEditingController();
  String _distanceFilter = '10';
  String _powerFilter = 'all';

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final size = MediaQuery.of(context).size;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Stack(
        children: [
          // Background gradient effects
          Positioned(
            top: -100,
            left: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withOpacity(0.1),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 100,
            right: -100,
            child: Container(
              width: 400,
              height: 400,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.cyan.withOpacity(0.05),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Main content
          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  _buildHeader(context, lang),

                  // Hero section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: FadeTransition(
                      opacity: _fadeAnimation,
                      child: SlideTransition(
                        position: _slideAnimation,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 24),

                            // AI Badge
                            _buildAiBadge(lang),

                            const SizedBox(height: 16),

                            // Title with gradient
                            _buildHeroTitle(context, lang),

                            const SizedBox(height: 12),

                            // Subtitle
                            Text(
                              lang.t('landing.hero.subtitle'),
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyLarge
                                  ?.copyWith(
                                    color: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.color,
                                    height: 1.6,
                                  ),
                            ),

                            const SizedBox(height: 24),

                            // Search Card
                            _buildSearchCard(context, lang),

                            const SizedBox(height: 16),

                            // Explore map button
                            _buildExploreButton(context, lang),

                            const SizedBox(height: 32),

                            // Stats section
                            _buildStatsSection(context, lang),

                            const SizedBox(height: 32),

                            // Impact stats
                            _buildImpactStats(context, lang),

                            const SizedBox(height: 32),

                            // Steps section
                            _buildStepsSection(context, lang),

                            const SizedBox(height: 32),

                            // Why different section
                            _buildWhySection(context, lang),

                            const SizedBox(height: 60),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, LanguageProvider lang) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Logo
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.asset(
                  'assets/images/logo.jpg',
                  width: 40,
                  height: 40,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, AppColors.cyanLight],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child:
                          const Icon(Icons.bolt, color: Colors.white, size: 22),
                    );
                  },
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'SCS GO',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),

          // Login button
          TextButton(
            onPressed: () => context.push('/auth'),
            child: Text(
              lang.t('landing.cta.login'),
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiBadge(LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.auto_awesome, size: 16, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            lang.t('landing.badge'),
            style: const TextStyle(
              color: AppColors.primary,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroTitle(BuildContext context, LanguageProvider lang) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          lang.t('landing.hero.title'),
          style: Theme.of(context).textTheme.displaySmall?.copyWith(
                fontWeight: FontWeight.bold,
                height: 1.1,
              ),
        ),
        ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [AppColors.primary, AppColors.cyanLight],
          ).createShader(bounds),
          child: Text(
            lang.t('landing.hero.highlight'),
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  height: 1.1,
                ),
          ),
        ),
      ],
    );
  }

  Widget _buildSearchCard(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor.withOpacity(0.8),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Theme.of(context).dividerColor),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.1),
            blurRadius: 30,
            offset: const Offset(0, 15),
          ),
        ],
      ),
      child: Column(
        children: [
          // Search input
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: lang.t('landing.search.placeholder'),
                    prefixIcon: Icon(Icons.search,
                        color: Theme.of(context).textTheme.bodySmall?.color),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.my_location,
                          color: AppColors.primary),
                      onPressed: () => context.go('/explore?nearby=true'),
                    ),
                  ),
                  onSubmitted: (_) => _handleSearch(),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                Text(
                  lang.isVietnamese ? 'Khoảng cách:' : 'Distance:',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(width: 8),
                _buildFilterChip('5km', _distanceFilter == '5',
                    () => setState(() => _distanceFilter = '5')),
                _buildFilterChip('10km', _distanceFilter == '10',
                    () => setState(() => _distanceFilter = '10')),
                _buildFilterChip('20km', _distanceFilter == '20',
                    () => setState(() => _distanceFilter = '20')),
                const SizedBox(width: 16),
                Text(
                  lang.isVietnamese ? 'Công suất:' : 'Power:',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(width: 8),
                _buildFilterChip('>60kW', _powerFilter == '60',
                    () => setState(() => _powerFilter = '60')),
                _buildFilterChip('>120kW', _powerFilter == '120',
                    () => setState(() => _powerFilter = '120')),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Search button
          SizedBox(
            width: double.infinity,
            child: Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.cyanLight],
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: ElevatedButton(
                onPressed: _handleSearch,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.search, color: Colors.white),
                    const SizedBox(width: 8),
                    Text(
                      lang.t('landing.search.button'),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool selected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.primary
                : Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color:
                  selected ? AppColors.primary : Theme.of(context).dividerColor,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: selected
                  ? Colors.white
                  : Theme.of(context).textTheme.bodyMedium?.color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildExploreButton(BuildContext context, LanguageProvider lang) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: () => context.go('/explore'),
        icon: const Icon(Icons.map_outlined),
        label: Text(lang.t('landing.cta.explore')),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildStatsSection(BuildContext context, LanguageProvider lang) {
    final stats = [
      {
        'value': '150+',
        'label': lang.t('landing.stats.stations'),
        'icon': Icons.location_on
      },
      {
        'value': '500+',
        'label': lang.t('landing.stats.ports'),
        'icon': Icons.bolt
      },
      {
        'value': '25K+',
        'label': lang.t('landing.stats.searches'),
        'icon': Icons.search
      },
      {'value': '99.2%', 'label': 'Uptime', 'icon': Icons.refresh},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: Theme.of(context).dividerColor.withOpacity(0.6)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: stats.map((stat) {
          return _buildStatItem(
            context,
            stat['icon'] as IconData,
            stat['value'] as String,
            stat['label'] as String,
          );
        }).toList(),
      ),
    );
  }

  Widget _buildStatItem(
      BuildContext context, IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary, size: 22),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.labelSmall,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildImpactStats(BuildContext context, LanguageProvider lang) {
    return Row(
      children: [
        Expanded(
          child: _buildImpactCard(
            context,
            Icons.timer_outlined,
            '12 ${lang.isVietnamese ? 'phút' : 'min'}',
            lang.isVietnamese ? 'Tiết kiệm TB/lần' : 'Saved per search',
            AppColors.primary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildImpactCard(
            context,
            Icons.check_circle_outline,
            '93%',
            lang.isVietnamese ? 'Điểm thành công' : 'Success rate',
            AppColors.success,
          ),
        ),
      ],
    );
  }

  Widget _buildImpactCard(BuildContext context, IconData icon, String value,
      String label, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                ),
                Text(
                  label,
                  style: Theme.of(context).textTheme.labelSmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepsSection(BuildContext context, LanguageProvider lang) {
    final steps = [
      {
        'icon': Icons.location_on_outlined,
        'title': lang.isVietnamese ? 'Nhập vị trí' : 'Enter Location',
        'desc': lang.isVietnamese
            ? 'Xác định địa điểm của bạn'
            : 'Identify your location',
      },
      {
        'icon': Icons.psychology_outlined,
        'title': lang.isVietnamese ? 'AI phân tích' : 'AI Analysis',
        'desc': lang.isVietnamese ? 'Tính toán tối ưu' : 'Optimize calculation',
      },
      {
        'icon': Icons.account_balance_wallet_outlined,
        'title': lang.isVietnamese ? 'So sánh & chọn' : 'Compare & Select',
        'desc': lang.isVietnamese
            ? 'Chọn trạm phù hợp nhất'
            : 'Choose best station',
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          lang.isVietnamese ? 'Cách hoạt động' : 'How It Works',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        ...steps.asMap().entries.map((entry) {
          final step = entry.value;
          final index = entry.key;
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child:
                      Icon(step['icon'] as IconData, color: AppColors.primary),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        step['title'] as String,
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                      ),
                      Text(
                        step['desc'] as String,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                if (index < steps.length - 1)
                  const Icon(Icons.chevron_right, color: AppColors.primary),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildWhySection(BuildContext context, LanguageProvider lang) {
    final items = [
      {
        'icon': Icons.battery_charging_full,
        'title': lang.isVietnamese ? 'Dự đoán SOC' : 'SOC Prediction',
        'desc': lang.isVietnamese
            ? 'Tính sạc cần thiết'
            : 'Calculate needed charge',
      },
      {
        'icon': Icons.refresh,
        'title': lang.isVietnamese ? 'Realtime' : 'Real-time',
        'desc': lang.isVietnamese ? 'Cập nhật liên tục' : 'Live updates',
      },
      {
        'icon': Icons.trending_down,
        'title': lang.isVietnamese ? 'So sánh giá' : 'Price Compare',
        'desc': lang.isVietnamese ? 'Tìm giá tốt nhất' : 'Find best price',
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          lang.isVietnamese ? 'Tại sao khác biệt?' : 'Why Different?',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        ...items.map((item) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: Theme.of(context).dividerColor.withOpacity(0.6)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(item['icon'] as IconData,
                        color: AppColors.primary, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item['title'] as String,
                          style:
                              Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                        ),
                        Text(
                          item['desc'] as String,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  void _handleSearch() {
    context.go(
        '/explore?q=${_searchController.text}&distance=$_distanceFilter&power=$_powerFilter');
  }
}
