import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/language_provider.dart';

class TopNavBar extends StatelessWidget {
  const TopNavBar({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor.withOpacity(0.95),
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).dividerColor.withOpacity(0.3),
          ),
        ),
      ),
      child: Row(
        children: [
          // Logo
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.asset(
                  'assets/images/logo.jpg',
                  width: 32,
                  height: 32,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, AppColors.cyanLight],
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child:
                          const Icon(Icons.bolt, color: Colors.white, size: 18),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              ShaderMask(
                shaderCallback: (bounds) => const LinearGradient(
                  colors: [AppColors.primary, AppColors.cyanLight],
                ).createShader(bounds),
                child: const Text(
                  'SCS GO',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),

          const Spacer(),

          // Navigation links
          Row(
            children: [
              _buildNavLink(
                context,
                label: lang.isVietnamese ? 'Trang chủ' : 'Home',
                onTap: () => context.go('/'),
              ),
              const SizedBox(width: 24),
              _buildNavLink(
                context,
                label: lang.isVietnamese ? 'Khám phá' : 'Explore',
                onTap: () => context.go('/explore'),
              ),
              const SizedBox(width: 24),
              _buildNavLink(
                context,
                label: lang.isVietnamese ? 'Đội ngũ' : 'Team',
                onTap: () => context.push('/team'),
              ),
              const SizedBox(width: 24),
              _buildNavLink(
                context,
                label: lang.isVietnamese ? 'Bảng giá' : 'Pricing',
                onTap: () {
                  // TODO: Navigate to pricing page
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavLink(
    BuildContext context, {
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Text(
          label,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
                color: Theme.of(context).textTheme.bodyLarge?.color,
              ),
        ),
      ),
    );
  }
}
