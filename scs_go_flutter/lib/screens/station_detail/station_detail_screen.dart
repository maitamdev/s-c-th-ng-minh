import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/stations_provider.dart';
import '../../models/station.dart';

class StationDetailScreen extends StatefulWidget {
  final String stationId;

  const StationDetailScreen({super.key, required this.stationId});

  @override
  State<StationDetailScreen> createState() => _StationDetailScreenState();
}

class _StationDetailScreenState extends State<StationDetailScreen> {
  Charger? _selectedCharger;

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final stationsProvider = context.watch<StationsProvider>();
    final station = stationsProvider.getStationById(widget.stationId);

    if (station == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.bolt,
                  size: 64, color: AppColors.primary.withOpacity(0.3)),
              const SizedBox(height: 16),
              Text(lang.t('common.noData')),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.go('/explore'),
                child: Text(lang.t('common.back')),
              ),
            ],
          ),
        ),
      );
    }

    final isFavorite = stationsProvider.isFavorite(widget.stationId);
    final availableChargers =
        station.chargers?.where((c) => c.status == 'available').toList() ?? [];

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Hero image with app bar
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Theme.of(context)
                      .scaffoldBackgroundColor
                      .withOpacity(0.8),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back),
              ),
              onPressed: () => context.pop(),
            ),
            actions: [
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Theme.of(context)
                        .scaffoldBackgroundColor
                        .withOpacity(0.8),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: isFavorite ? AppColors.error : null,
                  ),
                ),
                onPressed: () => stationsProvider.toggleFavorite(station),
              ),
              IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Theme.of(context)
                        .scaffoldBackgroundColor
                        .withOpacity(0.8),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.share),
                ),
                onPressed: () {
                  // Share
                },
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColors.primary.withOpacity(0.3),
                          AppColors.cyanLight.withOpacity(0.2),
                        ],
                      ),
                    ),
                    child: Center(
                      child: Icon(
                        Icons.bolt,
                        size: 80,
                        color: AppColors.primary.withOpacity(0.3),
                      ),
                    ),
                  ),
                  // Badges
                  Positioned(
                    top: 80,
                    left: 16,
                    child: Row(
                      children: [
                        if (station.hoursJson.is24h)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.success.withOpacity(0.9),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Text(
                              '24h',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        const SizedBox(width: 8),
                        _buildPredictionChip(context),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Station info header
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              station.name,
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineSmall
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Icon(Icons.location_on,
                                    size: 14,
                                    color: Theme.of(context)
                                        .textTheme
                                        .bodySmall
                                        ?.color),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    station.address,
                                    style:
                                        Theme.of(context).textTheme.bodySmall,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // AI Score badge
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: AppColors.primary.withOpacity(0.3)),
                        ),
                        child: const Column(
                          children: [
                            Icon(Icons.auto_awesome,
                                color: AppColors.primary, size: 20),
                            SizedBox(height: 4),
                            Text(
                              '85%',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Quick stats grid
                  _buildQuickStats(context, lang, station, availableChargers),

                  const SizedBox(height: 20),

                  // Hours & Provider
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.access_time,
                              size: 16,
                              color:
                                  Theme.of(context).textTheme.bodySmall?.color),
                          const SizedBox(width: 8),
                          Text(
                            station.hoursJson.is24h
                                ? '${lang.t('station.hours')} 24/7'
                                : '${station.hoursJson.open} - ${station.hoursJson.close}',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          station.provider,
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    fontWeight: FontWeight.w500,
                                  ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // Amenities
                  if (station.amenitiesJson.isNotEmpty) ...[
                    Text(
                      lang.t('station.amenities'),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: station.amenitiesJson.map((amenity) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Theme.of(context).cardColor,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                                color: Theme.of(context).dividerColor),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(_getAmenityIcon(amenity),
                                  size: 16, color: AppColors.primary),
                              const SizedBox(width: 6),
                              Text(
                                amenity,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      fontWeight: FontWeight.w500,
                                    ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Chargers section
                  Text(
                    '${lang.isVietnamese ? 'Cổng sạc' : 'Chargers'} (${station.chargers?.length ?? 0})',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 12),
                  ...station.chargers?.map((charger) =>
                          _buildChargerCard(context, lang, charger)) ??
                      [],

                  const SizedBox(height: 100), // Space for FAB
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar:
          _buildBottomBar(context, lang, station, availableChargers),
    );
  }

  Widget _buildPredictionChip(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.trending_up, size: 14, color: Colors.white),
          SizedBox(width: 4),
          Text(
            'Thấp',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats(BuildContext context, LanguageProvider lang,
      Station station, List<Charger> available) {
    final stats = [
      {
        'icon': Icons.star,
        'value': station.avgRating?.toStringAsFixed(1) ?? '-',
        'label': '${station.reviewCount} đánh giá',
        'color': Colors.amber
      },
      {
        'icon': Icons.bolt,
        'value': '${station.maxPower.toInt()} kW',
        'label': lang.isVietnamese ? 'Công suất' : 'Power',
        'color': AppColors.primary
      },
      {
        'icon': Icons.electrical_services,
        'value': '${available.length}/${station.chargers?.length ?? 0}',
        'label': lang.t('station.available'),
        'color': AppColors.success
      },
      {
        'icon': Icons.attach_money,
        'value': '${station.minPrice.toInt()}đ',
        'label': '/kWh',
        'color': AppColors.warning
      },
    ];

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4,
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: 0.75,
      children: stats.map((stat) {
        return Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
                color: Theme.of(context).dividerColor.withOpacity(0.6)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(stat['icon'] as IconData,
                  color: stat['color'] as Color, size: 20),
              const SizedBox(height: 4),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  stat['value'] as String,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  stat['label'] as String,
                  style: Theme.of(context)
                      .textTheme
                      .labelSmall
                      ?.copyWith(fontSize: 10),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildChargerCard(
      BuildContext context, LanguageProvider lang, Charger charger) {
    final isAvailable = charger.status == 'available';
    final isSelected = _selectedCharger?.id == charger.id;

    final statusConfig = {
      'available': {
        'icon': Icons.check_circle,
        'label': lang.t('station.available'),
        'color': AppColors.success
      },
      'occupied': {
        'icon': Icons.error_outline,
        'label': lang.isVietnamese ? 'Đang sử dụng' : 'Occupied',
        'color': AppColors.warning
      },
      'out_of_service': {
        'icon': Icons.cancel,
        'label': lang.isVietnamese ? 'Bảo trì' : 'Maintenance',
        'color': AppColors.error
      },
    };

    final status = statusConfig[charger.status] ?? statusConfig['available']!;

    return GestureDetector(
      onTap: isAvailable
          ? () {
              setState(() {
                _selectedCharger = isSelected ? null : charger;
              });
            }
          : null,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color:
                isSelected ? AppColors.primary : Theme.of(context).dividerColor,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Opacity(
          opacity: isAvailable ? 1.0 : 0.6,
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: (status['color'] as Color).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.electrical_services,
                  color: status['color'] as Color,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      charger.connectorType,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    Text(
                      '${charger.powerKw.toInt()} kW • ${charger.pricePerKwh.toInt()}đ/kWh',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: (status['color'] as Color).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(status['icon'] as IconData,
                        size: 14, color: status['color'] as Color),
                    const SizedBox(width: 4),
                    Text(
                      status['label'] as String,
                      style: TextStyle(
                        color: status['color'] as Color,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, LanguageProvider lang,
      Station station, List<Charger> available) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        border: Border(
          top: BorderSide(color: Theme.of(context).dividerColor),
        ),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Info row
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.bolt,
                        color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${available.length} ${lang.isVietnamese ? 'cổng khả dụng' : 'ports available'}',
                          style:
                              Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                        ),
                        Text(
                          '${lang.isVietnamese ? 'Từ' : 'From'} ${station.minPrice.toInt()}đ/kWh',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Buttons row
            Row(
              children: [
                OutlinedButton(
                  onPressed: () {
                    // Navigate
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.directions, size: 20),
                      const SizedBox(width: 6),
                      Text(
                        lang.isVietnamese ? 'Đường' : 'Go',
                        style: const TextStyle(fontSize: 13),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [AppColors.primary, AppColors.cyanLight],
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ElevatedButton.icon(
                      onPressed: () =>
                          context.push('/booking/${widget.stationId}'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      icon: const Icon(Icons.calendar_today,
                          color: Colors.white, size: 18),
                      label: Text(
                        lang.t('station.book'),
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  IconData _getAmenityIcon(String amenity) {
    switch (amenity.toLowerCase()) {
      case 'toilet':
        return Icons.wc;
      case 'cafe':
        return Icons.local_cafe;
      case 'wifi':
        return Icons.wifi;
      case 'parking':
        return Icons.local_parking;
      case 'shopping':
        return Icons.shopping_bag;
      default:
        return Icons.check_circle;
    }
  }
}
