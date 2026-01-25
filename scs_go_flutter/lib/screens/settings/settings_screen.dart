import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/theme_provider.dart';
import '../../providers/auth_provider.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final theme = context.watch<ThemeProvider>();
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.t('settings.title')),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile card
            _buildProfileCard(context, lang, auth),

            const SizedBox(height: 16),

            // Settings sections
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Appearance section
                  _buildSectionTitle(
                      context, lang.isVietnamese ? 'Giao diện' : 'Appearance'),
                  _buildSettingsCard(context, [
                    _buildThemeToggle(context, lang, theme),
                    const Divider(height: 1),
                    _buildLanguageToggle(context, lang),
                  ]),

                  const SizedBox(height: 24),

                  // Account section
                  _buildSectionTitle(
                      context, lang.isVietnamese ? 'Tài khoản' : 'Account'),
                  _buildSettingsCard(context, [
                    _buildSettingsTile(
                      context,
                      icon: Icons.person_outline,
                      title: lang.t('settings.profile'),
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    _buildSettingsTile(
                      context,
                      icon: Icons.directions_car_outlined,
                      title: lang.t('dashboard.myVehicle'),
                      onTap: () => context.push('/vehicle'),
                    ),
                    const Divider(height: 1),
                    _buildSettingsTile(
                      context,
                      icon: Icons.favorite_outline,
                      title: lang.t('favorites.title'),
                      onTap: () => context.push('/favorites'),
                    ),
                    const Divider(height: 1),
                    _buildSettingsTile(
                      context,
                      icon: Icons.history,
                      title: lang.isVietnamese
                          ? 'Lịch sử sạc'
                          : 'Charging History',
                      onTap: () => context.push('/history'),
                    ),
                  ]),

                  const SizedBox(height: 24),

                  // Support section
                  _buildSectionTitle(
                      context, lang.isVietnamese ? 'Hỗ trợ' : 'Support'),
                  _buildSettingsCard(context, [
                    _buildSettingsTile(
                      context,
                      icon: Icons.help_outline,
                      title:
                          lang.isVietnamese ? 'Trợ giúp & FAQ' : 'Help & FAQ',
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    _buildSettingsTile(
                      context,
                      icon: Icons.description_outlined,
                      title: lang.isVietnamese
                          ? 'Điều khoản sử dụng'
                          : 'Terms of Service',
                      onTap: () {},
                    ),
                    const Divider(height: 1),
                    _buildSettingsTile(
                      context,
                      icon: Icons.privacy_tip_outlined,
                      title: lang.isVietnamese
                          ? 'Chính sách bảo mật'
                          : 'Privacy Policy',
                      onTap: () {},
                    ),
                  ]),

                  const SizedBox(height: 24),

                  // Upgrade to Pro
                  _buildUpgradeCard(context, lang),

                  const SizedBox(height: 24),

                  // Logout button
                  if (auth.isAuthenticated)
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          await auth.signOut();
                          if (context.mounted) context.go('/');
                        },
                        icon: const Icon(Icons.logout, color: AppColors.error),
                        label: Text(
                          lang.t('settings.logout'),
                          style: const TextStyle(color: AppColors.error),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(
                              color: AppColors.error.withOpacity(0.5)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),

                  const SizedBox(height: 32),

                  // App version
                  Center(
                    child: Text(
                      'SCS GO v1.0.0',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard(
      BuildContext context, LanguageProvider lang, AuthProvider auth) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.cyanLight.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.primary, AppColors.cyanLight],
              ),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                auth.user?.profile?.fullName?.substring(0, 1).toUpperCase() ??
                    'U',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  auth.user?.profile?.fullName ?? 'Người dùng',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  auth.user?.email ?? 'email@example.com',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Free Plan',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w600,
              color: Theme.of(context).textTheme.bodySmall?.color,
            ),
      ),
    );
  }

  Widget _buildSettingsCard(BuildContext context, List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border:
            Border.all(color: Theme.of(context).dividerColor.withOpacity(0.6)),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildSettingsTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle) : null,
      trailing: trailing ?? const Icon(Icons.chevron_right, size: 20),
      onTap: onTap,
    );
  }

  Widget _buildThemeToggle(
      BuildContext context, LanguageProvider lang, ThemeProvider theme) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(
          theme.isDarkMode ? Icons.dark_mode : Icons.light_mode,
          color: AppColors.primary,
          size: 20,
        ),
      ),
      title: Text(lang.t('settings.darkMode')),
      trailing: Switch(
        value: theme.isDarkMode,
        onChanged: (value) => theme.toggleTheme(),
        activeColor: AppColors.primary,
      ),
    );
  }

  Widget _buildLanguageToggle(BuildContext context, LanguageProvider lang) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: const Icon(Icons.language, color: AppColors.primary, size: 20),
      ),
      title: Text(lang.t('settings.language')),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: DropdownButton<String>(
          value: lang.isVietnamese ? 'vi' : 'en',
          underline: const SizedBox(),
          isDense: true,
          items: const [
            DropdownMenuItem(value: 'vi', child: Text('🇻🇳 Tiếng Việt')),
            DropdownMenuItem(value: 'en', child: Text('🇺🇸 English')),
          ],
          onChanged: (value) {
            if (value != null) {
              lang.setLocale(Locale(value));
            }
          },
        ),
      ),
    );
  }

  Widget _buildUpgradeCard(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withOpacity(0.15),
            AppColors.cyanLight.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.auto_awesome, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang.isVietnamese ? 'Nâng cấp Pro' : 'Upgrade to Pro',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      lang.isVietnamese
                          ? 'Mở khóa đầy đủ tính năng AI'
                          : 'Unlock full AI features',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.cyanLight],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: Text(
                  lang.isVietnamese ? 'Xem các gói' : 'View Plans',
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
    );
  }
}
