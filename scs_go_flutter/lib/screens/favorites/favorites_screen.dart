import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/stations_provider.dart';
import '../../widgets/station_card.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final stationsProvider = context.watch<StationsProvider>();
    final favorites = stationsProvider.favorites;

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.t('favorites.title')),
        automaticallyImplyLeading: false,
        actions: [
          if (favorites.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () =>
                  _showClearDialog(context, lang, stationsProvider),
            ),
        ],
      ),
      body: favorites.isEmpty
          ? _buildEmptyState(context, lang)
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: favorites.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: StationCard(station: favorites[index]),
                );
              },
            ),
    );
  }

  Widget _buildEmptyState(BuildContext context, LanguageProvider lang) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.favorite_border,
                size: 48,
                color: AppColors.error.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              lang.t('favorites.empty'),
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              lang.isVietnamese
                  ? 'Nhấn vào biểu tượng trái tim để lưu trạm yêu thích'
                  : 'Tap the heart icon to save favorite stations',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).textTheme.bodySmall?.color,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primary, AppColors.cyanLight],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: ElevatedButton.icon(
                onPressed: () => context.go('/explore'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                ),
                icon: const Icon(Icons.search, color: Colors.white),
                label: Text(
                  lang.t('landing.cta.explore'),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showClearDialog(
      BuildContext context, LanguageProvider lang, StationsProvider provider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(lang.isVietnamese ? 'Xóa tất cả?' : 'Clear all?'),
        content: Text(
          lang.isVietnamese
              ? 'Bạn có chắc muốn xóa tất cả trạm yêu thích?'
              : 'Are you sure you want to clear all favorites?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(lang.t('common.cancel')),
          ),
          ElevatedButton(
            onPressed: () {
              provider.clearFavorites();
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
            ),
            child: Text(
              lang.isVietnamese ? 'Xóa' : 'Clear',
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
