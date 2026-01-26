import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/stations_provider.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final auth = context.watch<AuthProvider>();
    final stations = context.watch<StationsProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        automaticallyImplyLeading: false,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: IconButton(
              icon: const Icon(Icons.notifications_outlined,
                  color: AppColors.primary),
              onPressed: () {},
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 100), // Space for floating nav
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome header
            _buildWelcomeHeader(context, lang, auth, isDark),

            // Stats grid
            Padding(
              padding: const EdgeInsets.all(16),
              child: _buildStatsGrid(context, lang, isDark),
            ),

            // Recent bookings
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildRecentBookings(context, lang, isDark),
            ),

            const SizedBox(height: 20),

            // Quick actions
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: _buildQuickActions(context, lang, isDark),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeHeader(BuildContext context, LanguageProvider lang,
      AuthProvider auth, bool isDark) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withOpacity(isDark ? 0.2 : 0.12),
            AppColors.cyanLight.withOpacity(isDark ? 0.1 : 0.06),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.2),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  lang.isVietnamese ? 'Xin chào!' : 'Hello!',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  auth.user?.profile?.fullName ?? 'Bạn',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.success.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                    border:
                        Border.all(color: AppColors.success.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle,
                          size: 14, color: AppColors.success),
                      const SizedBox(width: 4),
                      Text(
                        lang.isVietnamese ? 'Sẵn sàng sạc' : 'Ready to charge',
                        style: const TextStyle(
                          color: AppColors.success,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          _PrimaryActionButton(
            onPressed: () => context.push('/explore'),
            icon: Icons.bolt,
            label: lang.t('dashboard.findStation'),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid(
      BuildContext context, LanguageProvider lang, bool isDark) {
    final stats = [
      {
        'value': '3',
        'label': lang.isVietnamese ? 'Lượt sạc' : 'Charges',
        'subtitle': lang.isVietnamese ? 'Tháng này' : 'This month',
        'icon': Icons.bolt,
        'color': AppColors.primary,
        'gradient': [AppColors.primary, AppColors.cyanLight],
      },
      {
        'value': '2',
        'label': lang.t('favorites.title'),
        'subtitle': lang.isVietnamese ? 'Trạm yêu thích' : 'Stations',
        'icon': Icons.favorite,
        'color': AppColors.error,
        'gradient': [AppColors.error, Colors.pink.shade300],
      },
      {
        'value': '180',
        'label': 'AI Calls',
        'subtitle': lang.isVietnamese ? 'Còn lại 20' : '20 remaining',
        'icon': Icons.auto_awesome,
        'color': AppColors.cyan,
        'gradient': [AppColors.cyan, Colors.blue.shade300],
      },
      {
        'value': '17',
        'label': lang.isVietnamese ? 'Booking' : 'Bookings',
        'subtitle': lang.isVietnamese ? 'Còn 3 lượt' : '3 remaining',
        'icon': Icons.calendar_today,
        'color': AppColors.warning,
        'gradient': [AppColors.warning, Colors.orange.shade300],
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 1.3,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final stat = stats[index];
        return _StatCard(
          value: stat['value'] as String,
          label: stat['label'] as String,
          subtitle: stat['subtitle'] as String,
          icon: stat['icon'] as IconData,
          color: stat['color'] as Color,
          gradient: stat['gradient'] as List<Color>,
          isDark: isDark,
        );
      },
    );
  }

  Widget _buildRecentBookings(
      BuildContext context, LanguageProvider lang, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isDark
              ? AppColors.darkBorder.withOpacity(0.3)
              : AppColors.lightBorder.withOpacity(0.5),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withOpacity(0.2)
                : Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.history,
                          color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Flexible(
                      child: Text(
                        lang.t('dashboard.recentBookings'),
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              TextButton(
                onPressed: () => context.push('/my-bookings'),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      lang.t('common.viewAll'),
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                          fontSize: 13),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_forward,
                        size: 14, color: AppColors.primary),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Empty state
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.08),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.calendar_today_outlined,
                      size: 40,
                      color: AppColors.primary.withOpacity(0.5),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    lang.t('dashboard.noBookings'),
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    lang.isVietnamese
                        ? 'Đặt lịch sạc ngay để tiết kiệm thời gian'
                        : 'Book a charging slot to save time',
                    style: Theme.of(context).textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: () => context.push('/explore'),
                    icon: const Icon(Icons.search),
                    label: Text(lang.t('dashboard.findStation')),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
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

  Widget _buildQuickActions(
      BuildContext context, LanguageProvider lang, bool isDark) {
    final actions = [
      {
        'icon': Icons.route,
        'title': lang.isVietnamese ? 'Lập lộ trình AI' : 'AI Trip Planner',
        'subtitle': lang.isVietnamese
            ? 'Tính toán điểm sạc trên đường đi'
            : 'Calculate charging stops on route',
        'route': '/trip-planner',
        'color': AppColors.cyan,
      },
      {
        'icon': Icons.explore,
        'title': lang.t('dashboard.findStation'),
        'subtitle': lang.isVietnamese
            ? 'AI gợi ý trạm phù hợp nhất'
            : 'AI recommends best stations',
        'route': '/explore',
        'color': AppColors.primary,
      },
      {
        'icon': Icons.favorite,
        'title': lang.t('favorites.title'),
        'subtitle': lang.isVietnamese
            ? 'Xem trạm sạc yêu thích'
            : 'View favorite stations',
        'route': '/favorites',
        'color': AppColors.error,
      },
      {
        'icon': Icons.directions_car,
        'title': lang.t('dashboard.myVehicle'),
        'subtitle':
            lang.isVietnamese ? 'Quản lý xe điện của bạn' : 'Manage your EV',
        'route': '/vehicle',
        'color': AppColors.success,
      },
      {
        'icon': Icons.auto_awesome,
        'title': lang.isVietnamese ? 'Nâng cấp Pro' : 'Upgrade to Pro',
        'subtitle': lang.isVietnamese
            ? 'Mở khóa đầy đủ tính năng AI'
            : 'Unlock full AI features',
        'route': '/settings',
        'color': AppColors.warning,
        'isPro': true,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Text(
            lang.isVietnamese ? 'Thao tác nhanh' : 'Quick Actions',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
        ),
        ...actions.map((action) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _QuickActionCard(
              icon: action['icon'] as IconData,
              title: action['title'] as String,
              subtitle: action['subtitle'] as String,
              color: action['color'] as Color,
              isPro: action['isPro'] == true,
              isDark: isDark,
              onTap: () {
                HapticFeedback.lightImpact();
                context.push(action['route'] as String);
              },
            ),
          );
        }),
      ],
    );
  }
}

// Custom Primary Action Button
class _PrimaryActionButton extends StatefulWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final String label;

  const _PrimaryActionButton({
    required this.onPressed,
    required this.icon,
    required this.label,
  });

  @override
  State<_PrimaryActionButton> createState() => _PrimaryActionButtonState();
}

class _PrimaryActionButtonState extends State<_PrimaryActionButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: () {
        HapticFeedback.mediumImpact();
        widget.onPressed();
      },
      child: AnimatedScale(
        scale: _isPressed ? 0.95 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, AppColors.cyanLight],
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.4),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(widget.icon, color: Colors.white, size: 18),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  widget.label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Stats Card Widget
class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final String subtitle;
  final IconData icon;
  final Color color;
  final List<Color> gradient;
  final bool isDark;

  const _StatCard({
    required this.value,
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.gradient,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark
              ? AppColors.darkBorder.withOpacity(0.3)
              : AppColors.lightBorder.withOpacity(0.5),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withOpacity(0.2)
                : Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: gradient),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: color.withOpacity(0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Icon(icon, size: 20, color: Colors.white),
              ),
              Text(
                value,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// Quick Action Card Widget
class _QuickActionCard extends StatefulWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final bool isPro;
  final bool isDark;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.isDark,
    required this.onTap,
    this.isPro = false,
  });

  @override
  State<_QuickActionCard> createState() => _QuickActionCardState();
}

class _QuickActionCardState extends State<_QuickActionCard> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _isPressed ? 0.98 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: widget.isDark ? AppColors.darkCard : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: _isPressed
                  ? widget.color.withOpacity(0.4)
                  : (widget.isDark
                      ? AppColors.darkBorder.withOpacity(0.3)
                      : AppColors.lightBorder.withOpacity(0.5)),
              width: _isPressed ? 2 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: _isPressed
                    ? widget.color.withOpacity(0.15)
                    : (widget.isDark
                        ? Colors.black.withOpacity(0.2)
                        : Colors.black.withOpacity(0.04)),
                blurRadius: _isPressed ? 16 : 12,
                offset: Offset(0, _isPressed ? 6 : 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: widget.color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: widget.color.withOpacity(0.2)),
                ),
                child: Icon(widget.icon, color: widget.color, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          widget.title,
                          style:
                              Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                        ),
                        if (widget.isPro) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.warning,
                                  Colors.orange.shade300
                                ],
                              ),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'PRO',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.subtitle,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: widget.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  Icons.arrow_forward_ios,
                  size: 14,
                  color: widget.color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
