import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/language_provider.dart';
import '../config/theme.dart';

class MainShell extends StatefulWidget {
  final Widget child;

  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;

  final _tabs = [
    '/explore',
    '/dashboard',
    '/community',
    '/settings',
  ];

  final _navItems = [
    {
      'icon': Icons.explore_outlined,
      'activeIcon': Icons.explore,
      'label': 'explore.title'
    },
    {
      'icon': Icons.dashboard_outlined,
      'activeIcon': Icons.dashboard,
      'label': 'Dashboard'
    },
    {
      'icon': Icons.forum_outlined,
      'activeIcon': Icons.forum,
      'label': 'community'
    },
    {
      'icon': Icons.settings_outlined,
      'activeIcon': Icons.settings,
      'label': 'settings.title'
    },
  ];

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final location = GoRouterState.of(context).uri.toString();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Update current index based on location
    for (int i = 0; i < _tabs.length; i++) {
      if (location.startsWith(_tabs[i])) {
        _currentIndex = i;
        break;
      }
    }

    return Scaffold(
      extendBody: true,
      body: widget.child,
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : Colors.white,
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: isDark
                  ? Colors.black.withOpacity(0.3)
                  : AppColors.primary.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, 8),
              spreadRadius: 2,
            ),
            BoxShadow(
              color: isDark
                  ? Colors.black.withOpacity(0.2)
                  : Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
          border: Border.all(
            color: isDark
                ? AppColors.darkBorder.withOpacity(0.3)
                : AppColors.lightBorder.withOpacity(0.5),
            width: 1,
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_navItems.length, (index) {
                final isSelected = _currentIndex == index;
                final item = _navItems[index];
                // Use short labels for nav bar
                String label;
                switch (index) {
                  case 0:
                    label = lang.isVietnamese ? 'Khám phá' : 'Explore';
                    break;
                  case 1:
                    label = 'Dashboard';
                    break;
                  case 2:
                    label = lang.isVietnamese ? 'Cộng đồng' : 'Community';
                    break;
                  case 3:
                    label = lang.isVietnamese ? 'Cài đặt' : 'Settings';
                    break;
                  default:
                    label = '';
                }

                return _buildNavItem(
                  context,
                  icon: item['icon'] as IconData,
                  activeIcon: item['activeIcon'] as IconData,
                  label: label,
                  isSelected: isSelected,
                  onTap: () {
                    if (index != _currentIndex) {
                      HapticFeedback.lightImpact();
                      context.go(_tabs[index]);
                    }
                  },
                );
              }),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 16 : 12,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [
                    AppColors.primary,
                    AppColors.cyanLight,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              size: 22,
              color: isSelected
                  ? Colors.white
                  : Theme.of(context).textTheme.bodySmall?.color,
            ),
            if (isSelected)
              Padding(
                padding: const EdgeInsets.only(left: 8),
                child: Text(
                  label,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
