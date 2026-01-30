import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../config/theme.dart';
import '../providers/language_provider.dart';
import '../models/station.dart';
import '../providers/stations_provider.dart';

enum OptimizationMode { balanced, fastest, cheapest, leastWait }

class AIRecommendation {
  final Station station;
  final int matchPercent;
  final int travelTimeMin;
  final List<AIReason> reasons;

  AIRecommendation({
    required this.station,
    required this.matchPercent,
    required this.travelTimeMin,
    required this.reasons,
  });
}

class AIReason {
  final IconData icon;
  final String text;
  final String? value;

  AIReason({required this.icon, required this.text, this.value});
}

class AIRecommendationPanel extends StatefulWidget {
  final List<Station> stations;
  final bool hasLocation;

  const AIRecommendationPanel({
    super.key,
    required this.stations,
    this.hasLocation = true,
  });

  @override
  State<AIRecommendationPanel> createState() => _AIRecommendationPanelState();
}

class _AIRecommendationPanelState extends State<AIRecommendationPanel> {
  OptimizationMode _mode = OptimizationMode.balanced;
  bool _isCalculating = false;
  bool _expanded = true;
  List<AIRecommendation> _recommendations = [];

  final _modeOptions = [
    {
      'id': OptimizationMode.balanced,
      'icon': Icons.adjust,
      'label': 'Cân bằng'
    },
    {'id': OptimizationMode.fastest, 'icon': Icons.bolt, 'label': 'Nhanh nhất'},
    {
      'id': OptimizationMode.cheapest,
      'icon': Icons.attach_money,
      'label': 'Rẻ nhất'
    },
    {'id': OptimizationMode.leastWait, 'icon': Icons.timer, 'label': 'Ít chờ'},
  ];

  @override
  void initState() {
    super.initState();
    _calculateRecommendations();
  }

  @override
  void didUpdateWidget(AIRecommendationPanel oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.stations != widget.stations) {
      _calculateRecommendations();
    }
  }

  void _calculateRecommendations() async {
    if (!widget.hasLocation || widget.stations.isEmpty) return;

    setState(() => _isCalculating = true);

    // Get current location to calculate distances
    Position? currentPosition;
    try {
      currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      ).timeout(const Duration(seconds: 3));
    } catch (e) {
      // Use default position if failed
      currentPosition = Position(
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
    }

    // Calculate distance for each station
    final stationsWithDistance = widget.stations.map((station) {
      final distance = Geolocator.distanceBetween(
            currentPosition!.latitude,
            currentPosition.longitude,
            station.lat,
            station.lng,
          ) /
          1000; // Convert to km

      // Create new station with updated distance
      return Station(
        id: station.id,
        operatorId: station.operatorId,
        name: station.name,
        address: station.address,
        lat: station.lat,
        lng: station.lng,
        provider: station.provider,
        hoursJson: station.hoursJson,
        amenitiesJson: station.amenitiesJson,
        status: station.status,
        chargers: station.chargers,
        avgRating: station.avgRating,
        reviewCount: station.reviewCount,
        distanceKm: distance,
      );
    }).toList();

    // Simulate AI processing
    await Future.delayed(const Duration(milliseconds: 500));

    final recommendations =
        _getTopRecommendations(stationsWithDistance, _mode, 3);

    if (mounted) {
      setState(() {
        _recommendations = recommendations;
        _isCalculating = false;
      });
    }
  }

  List<AIRecommendation> _getTopRecommendations(
    List<Station> stations,
    OptimizationMode mode,
    int limit,
  ) {
    // Sort by different criteria based on mode
    var sorted = List<Station>.from(stations);

    switch (mode) {
      case OptimizationMode.fastest:
        sorted.sort(
            (a, b) => (a.distanceKm ?? 100).compareTo(b.distanceKm ?? 100));
        break;
      case OptimizationMode.cheapest:
        sorted.sort((a, b) => a.minPrice.compareTo(b.minPrice));
        break;
      case OptimizationMode.leastWait:
        sorted
            .sort((a, b) => b.availableChargers.compareTo(a.availableChargers));
        break;
      case OptimizationMode.balanced:
        sorted.sort((a, b) {
          final scoreA = _calculateScore(a, mode);
          final scoreB = _calculateScore(b, mode);
          return scoreB.compareTo(scoreA);
        });
    }

    return sorted.take(limit).map((station) {
      final score = _calculateScore(station, mode);
      final travelTime =
          ((station.distanceKm ?? 5) * 3).toInt(); // Estimate 3 min per km

      return AIRecommendation(
        station: station,
        matchPercent: score.clamp(0, 100).toInt(),
        travelTimeMin: travelTime,
        reasons: _generateReasons(station, mode),
      );
    }).toList();
  }

  double _calculateScore(Station station, OptimizationMode mode) {
    double score = 70.0;

    // Distance factor
    final distance = station.distanceKm ?? 10.0;
    if (distance < 2) {
      score += 15;
    } else if (distance < 5) {
      score += 10;
    } else if (distance < 10) {
      score += 5;
    }

    // Price factor
    if (station.minPrice < 3500) score += 10;
    if (station.minPrice < 3000) score += 5;

    // Availability factor
    if (station.availableChargers > 0) score += 10;
    if (station.availableChargers > 2) score += 5;

    // Power factor
    if (station.maxPower > 100) score += 5;
    if (station.maxPower > 150) score += 5;

    // Rating factor
    if ((station.avgRating ?? 0) >= 4.5) score += 5;

    // Mode-specific bonuses
    switch (mode) {
      case OptimizationMode.fastest:
        if (distance < 3) score += 10;
        if (station.maxPower > 150) score += 10;
        break;
      case OptimizationMode.cheapest:
        if (station.minPrice < 3500) score += 10;
        break;
      case OptimizationMode.leastWait:
        if (station.availableChargers > 0) score += 15;
        break;
      default:
        break;
    }

    return score;
  }

  List<AIReason> _generateReasons(Station station, OptimizationMode mode) {
    final reasons = <AIReason>[];

    // Distance reason
    final distance = station.distanceKm ?? 0;
    if (distance < 3) {
      reasons.add(AIReason(
        icon: Icons.location_on,
        text: 'Gần bạn',
        value: '${distance.toStringAsFixed(1)} km',
      ));
    }

    // Price reason
    if (station.minPrice < 3500) {
      reasons.add(AIReason(
        icon: Icons.attach_money,
        text: 'Giá tốt',
        value: '${station.minPrice.toInt()}đ/kWh',
      ));
    }

    // Power reason
    if (station.maxPower > 100) {
      reasons.add(AIReason(
        icon: Icons.bolt,
        text: 'Sạc nhanh',
        value: '${station.maxPower.toInt()} kW',
      ));
    }

    // Availability reason
    if (station.availableChargers > 0) {
      reasons.add(AIReason(
        icon: Icons.check_circle,
        text: 'Còn trống',
        value: '${station.availableChargers} cổng',
      ));
    }

    // Connector reason
    if (station.chargers?.any((c) => c.connectorType == 'CCS2') ?? false) {
      reasons.add(AIReason(
        icon: Icons.electrical_services,
        text: 'Tương thích',
        value: 'CCS2',
      ));
    }

    return reasons.take(4).toList();
  }

  Color _getScoreColor(int score) {
    if (score >= 80) return AppColors.success;
    if (score >= 60) return Colors.amber;
    return Colors.orange;
  }

  String _getScoreLabel(int score, LanguageProvider lang) {
    if (score >= 90) return lang.isVietnamese ? 'Xuất sắc' : 'Excellent';
    if (score >= 80) return lang.isVietnamese ? 'Rất tốt' : 'Very Good';
    if (score >= 70) return lang.isVietnamese ? 'Tốt' : 'Good';
    if (score >= 60) return lang.isVietnamese ? 'Khá' : 'Fair';
    return 'OK';
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    if (!widget.hasLocation) {
      return _buildNoLocationState(context, lang);
    }

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: Theme.of(context).dividerColor.withOpacity(0.6)),
      ),
      child: Column(
        children: [
          // Header
          _buildHeader(context, lang),

          // Expandable content
          if (_expanded) ...[
            // Mode selector
            _buildModeSelector(context, lang),

            // Recommendations
            _buildRecommendations(context, lang),

            // Footer
            if (_recommendations.isNotEmpty) _buildFooter(context, lang),
          ],
        ],
      ),
    );
  }

  Widget _buildNoLocationState(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: Theme.of(context).dividerColor.withOpacity(0.6)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.psychology, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang.isVietnamese
                          ? 'AI Gợi ý thông minh'
                          : 'AI Smart Recommendations',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    Text(
                      lang.isVietnamese
                          ? 'Cần vị trí để gợi ý'
                          : 'Need location to recommend',
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
            child: OutlinedButton.icon(
              onPressed: () {
                // Request location
              },
              icon: const Icon(Icons.location_on),
              label: Text(lang.isVietnamese ? 'Bật vị trí' : 'Enable Location'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, LanguageProvider lang) {
    return InkWell(
      onTap: () => setState(() => _expanded = !_expanded),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppColors.primary.withOpacity(0.1),
              AppColors.cyanLight.withOpacity(0.05),
            ],
          ),
          borderRadius: BorderRadius.vertical(
            top: const Radius.circular(20),
            bottom: _expanded ? Radius.zero : const Radius.circular(20),
          ),
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
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child:
                  const Icon(Icons.auto_awesome, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        lang.isVietnamese
                            ? 'AI Gợi ý thông minh'
                            : 'AI Recommendations',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Text(
                          'AI',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    lang.isVietnamese
                        ? 'Dựa trên vị trí và thói quen sạc'
                        : 'Based on location and charging habits',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            Icon(
              _expanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
              color: Theme.of(context).textTheme.bodySmall?.color,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeSelector(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
              color: Theme.of(context).dividerColor.withOpacity(0.5)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            lang.isVietnamese ? 'Tối ưu theo:' : 'Optimize for:',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 10),
          Row(
            children: _modeOptions.map((option) {
              final isSelected = _mode == option['id'];
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: InkWell(
                    onTap: () {
                      setState(() => _mode = option['id'] as OptimizationMode);
                      _calculateRecommendations();
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary
                            : Theme.of(context).scaffoldBackgroundColor,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.3),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ]
                            : null,
                      ),
                      child: Column(
                        children: [
                          Icon(
                            option['icon'] as IconData,
                            size: 18,
                            color: isSelected
                                ? Colors.white
                                : Theme.of(context).textTheme.bodySmall?.color,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            option['label'] as String,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: isSelected
                                  ? Colors.white
                                  : Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.color,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendations(BuildContext context, LanguageProvider lang) {
    if (_isCalculating) {
      return Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            const Stack(
              alignment: Alignment.center,
              children: [
                Icon(Icons.psychology, size: 40, color: AppColors.primary),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              lang.isVietnamese ? 'Đang phân tích...' : 'Analyzing...',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      );
    }

    if (_recommendations.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(32),
        child: Text(
          lang.isVietnamese ? 'Không có gợi ý' : 'No recommendations',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).textTheme.bodySmall?.color,
              ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: _recommendations.asMap().entries.map((entry) {
          final index = entry.key;
          final rec = entry.value;
          return _buildRecommendationCard(context, lang, rec, index);
        }).toList(),
      ),
    );
  }

  Widget _buildRecommendationCard(
    BuildContext context,
    LanguageProvider lang,
    AIRecommendation rec,
    int index,
  ) {
    final isBest = index == 0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => context.push('/station/${rec.station.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: isBest
                ? LinearGradient(
                    colors: [
                      AppColors.primary.withOpacity(0.1),
                      AppColors.cyanLight.withOpacity(0.05),
                    ],
                  )
                : null,
            color: isBest ? null : Theme.of(context).scaffoldBackgroundColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isBest
                  ? AppColors.primary.withOpacity(0.3)
                  : Theme.of(context).dividerColor,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isBest
                                ? AppColors.primary
                                : Theme.of(context).scaffoldBackgroundColor,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            isBest
                                ? '#${index + 1} ${lang.isVietnamese ? "Phù hợp nhất" : "Best Match"}'
                                : '#${index + 1}',
                            style: TextStyle(
                              color: isBest
                                  ? Colors.white
                                  : Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.color,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        // Name
                        Text(
                          rec.station.name,
                          style:
                              Theme.of(context).textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          rec.station.address,
                          style: Theme.of(context).textTheme.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  // Score badge
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: _getScoreColor(rec.matchPercent).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Text(
                          '${rec.matchPercent}',
                          style: TextStyle(
                            color: _getScoreColor(rec.matchPercent),
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          _getScoreLabel(rec.matchPercent, lang),
                          style: TextStyle(
                            color: _getScoreColor(rec.matchPercent),
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Stats row
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  _buildStatChip(
                      context, Icons.access_time, '${rec.travelTimeMin} phút'),
                  _buildStatChip(context, Icons.bolt,
                      '${rec.station.maxPower.toInt()} kW'),
                  _buildStatChip(context, Icons.attach_money,
                      '${rec.station.minPrice.toInt()}đ'),
                  if (rec.station.availableChargers > 0)
                    _buildStatChip(
                      context,
                      Icons.check_circle,
                      '${rec.station.availableChargers}',
                      color: AppColors.success,
                    ),
                ],
              ),

              const SizedBox(height: 12),

              // Reasons
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: rec.reasons.map((reason) {
                  return Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Theme.of(context).scaffoldBackgroundColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(reason.icon, size: 12, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          reason.text,
                          style: TextStyle(
                            fontSize: 11,
                            color: Theme.of(context).textTheme.bodySmall?.color,
                          ),
                        ),
                        if (reason.value != null) ...[
                          const SizedBox(width: 4),
                          Text(
                            reason.value!,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatChip(BuildContext context, IconData icon, String value,
      {Color? color}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon,
            size: 14,
            color: color ?? Theme.of(context).textTheme.bodySmall?.color),
        const SizedBox(width: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            color: color ?? Theme.of(context).textTheme.bodySmall?.color,
          ),
        ),
      ],
    );
  }

  Widget _buildFooter(BuildContext context, LanguageProvider lang) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.psychology,
              size: 14, color: Theme.of(context).textTheme.bodySmall?.color),
          const SizedBox(width: 6),
          Text(
            lang.isVietnamese
                ? 'Được cung cấp bởi SCS GO AI'
                : 'Powered by SCS GO AI',
            style: Theme.of(context).textTheme.labelSmall,
          ),
        ],
      ),
    );
  }
}
