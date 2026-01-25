import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/stations_provider.dart';
import '../../models/station.dart';
import '../../widgets/station_card.dart';
import '../../widgets/ai_recommendation_panel.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  String _sortBy = 'ai_recommended';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  // Filters
  final List<String> _selectedConnectors = [];
  double? _minPower;
  // double? _maxDistance; // Reserved for future distance filter
  bool _openNow = false;
  bool _availableNow = false;

  final List<Map<String, dynamic>> _sortOptions = [
    {'value': 'ai_recommended', 'icon': Icons.auto_awesome, 'label': 'AI'},
    {'value': 'distance', 'icon': Icons.near_me, 'label': 'Gần nhất'},
    {'value': 'price', 'icon': Icons.attach_money, 'label': 'Giá rẻ'},
    {'value': 'power', 'icon': Icons.bolt, 'label': 'Công suất'},
    {'value': 'rating', 'icon': Icons.star, 'label': 'Đánh giá'},
  ];

  final List<String> _connectorTypes = ['CCS2', 'Type2', 'CHAdeMO', 'GBT'];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final stationsProvider = context.watch<StationsProvider>();

    return Scaffold(
      body: SafeArea(
        bottom: false, // Let content extend behind nav bar
        child: Column(
          children: [
            // Header with search
            _buildHeader(context, lang),

            // Scrollable content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.only(
                    bottom: 100), // Space for floating nav
                child: Column(
                  children: [
                    // AI Recommendation Panel
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: AIRecommendationPanel(
                        stations:
                            _getFilteredStations(stationsProvider.stations),
                        hasLocation: true,
                      ),
                    ),

                    // Sort options
                    _buildSortOptions(context, lang),

                    // Filter chips
                    _buildFilterChips(context, lang),

                    // Results count
                    _buildResultsCount(context, lang, stationsProvider),

                    // Stations list
                    stationsProvider.loading
                        ? _buildLoadingSkeleton()
                        : stationsProvider.error != null
                            ? _buildErrorState(context, lang, stationsProvider)
                            : _buildStationsList(context, stationsProvider),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, LanguageProvider lang) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        border: Border(
          bottom: BorderSide(color: Theme.of(context).dividerColor),
        ),
      ),
      child: Column(
        children: [
          // Title row with logo
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang.t('explore.title'),
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      lang.t('explore.subtitle'),
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.map_outlined),
                onPressed: () {
                  // TODO: Toggle map view
                },
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Search bar
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: lang.isVietnamese
                  ? 'Tìm theo tên, địa chỉ, nhà cung cấp...'
                  : 'Search by name, address, provider...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : IconButton(
                      icon: const Icon(Icons.my_location,
                          color: AppColors.primary),
                      onPressed: () {
                        // Use current location
                      },
                    ),
            ),
            onChanged: (value) => setState(() => _searchQuery = value),
          ),
        ],
      ),
    );
  }

  Widget _buildSortOptions(BuildContext context, LanguageProvider lang) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: _sortOptions.map((option) {
          final isSelected = _sortBy == option['value'];
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              selected: isSelected,
              label: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    option['icon'] as IconData,
                    size: 16,
                    color: isSelected ? Colors.white : AppColors.primary,
                  ),
                  const SizedBox(width: 6),
                  Text(option['label'] as String),
                ],
              ),
              selectedColor: AppColors.primary,
              checkmarkColor: Colors.white,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : null,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
              onSelected: (selected) {
                setState(() => _sortBy = option['value'] as String);
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildFilterChips(BuildContext context, LanguageProvider lang) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // Connector filter
          _buildDropdownChip(
            context,
            icon: Icons.electrical_services,
            label: lang.isVietnamese ? 'Loại cổng' : 'Connector',
            value: _selectedConnectors.isEmpty
                ? null
                : _selectedConnectors.join(', '),
            onTap: () => _showConnectorFilter(context),
          ),
          const SizedBox(width: 8),

          // Power filter
          _buildDropdownChip(
            context,
            icon: Icons.bolt,
            label: lang.isVietnamese ? 'Công suất' : 'Power',
            value: _minPower != null ? '>${_minPower!.toInt()}kW' : null,
            onTap: () => _showPowerFilter(context),
          ),
          const SizedBox(width: 8),

          // Open now toggle
          FilterChip(
            selected: _openNow,
            label: Text(lang.isVietnamese ? 'Mở cửa' : 'Open Now'),
            selectedColor: AppColors.success.withOpacity(0.2),
            labelStyle: TextStyle(
              color: _openNow ? AppColors.success : null,
              fontSize: 13,
            ),
            onSelected: (selected) => setState(() => _openNow = selected),
          ),
          const SizedBox(width: 8),

          // Available now toggle
          FilterChip(
            selected: _availableNow,
            label: Text(lang.isVietnamese ? 'Còn trống' : 'Available'),
            selectedColor: AppColors.primary.withOpacity(0.2),
            labelStyle: TextStyle(
              color: _availableNow ? AppColors.primary : null,
              fontSize: 13,
            ),
            onSelected: (selected) => setState(() => _availableNow = selected),
          ),
        ],
      ),
    );
  }

  Widget _buildDropdownChip(
    BuildContext context, {
    required IconData icon,
    required String label,
    String? value,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: value != null
              ? AppColors.primary.withOpacity(0.1)
              : Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: value != null
                ? AppColors.primary
                : Theme.of(context).dividerColor,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 16, color: value != null ? AppColors.primary : null),
            const SizedBox(width: 6),
            Text(
              value ?? label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: value != null ? AppColors.primary : null,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.keyboard_arrow_down,
              size: 16,
              color: value != null ? AppColors.primary : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultsCount(
      BuildContext context, LanguageProvider lang, StationsProvider provider) {
    final filteredCount = _getFilteredStations(provider.stations).length;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '$filteredCount ${lang.t('landing.stats.stations')}',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
          ),
          if (_sortBy == 'ai_recommended')
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.auto_awesome,
                      size: 12, color: AppColors.primary),
                  const SizedBox(width: 4),
                  Text(
                    lang.isVietnamese ? 'AI sắp xếp' : 'AI sorted',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildLoadingSkeleton() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Container(
          height: 160,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Center(
            child: CircularProgressIndicator(),
          ),
        );
      },
    );
  }

  Widget _buildErrorState(
      BuildContext context, LanguageProvider lang, StationsProvider provider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: AppColors.error),
          const SizedBox(height: 16),
          Text(lang.t('common.error')),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: () => provider.loadStations(),
            icon: const Icon(Icons.refresh),
            label: Text(lang.t('common.retry')),
          ),
        ],
      ),
    );
  }

  Widget _buildStationsList(BuildContext context, StationsProvider provider) {
    final filtered = _getFilteredStations(provider.stations);

    if (filtered.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search_off,
              size: 64,
              color: Theme.of(context).textTheme.bodySmall?.color,
            ),
            const SizedBox(height: 16),
            Text(
              context.read<LanguageProvider>().isVietnamese
                  ? 'Không tìm thấy trạm sạc'
                  : 'No stations found',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              context.read<LanguageProvider>().isVietnamese
                  ? 'Thử thay đổi bộ lọc hoặc vị trí'
                  : 'Try changing filters or location',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: filtered.map((station) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: StationCard(station: station),
          );
        }).toList(),
      ),
    );
  }

  List<Station> _getFilteredStations(List<Station> stations) {
    var filtered = stations.where((s) {
      // Search query
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        if (!s.name.toLowerCase().contains(query) &&
            !s.address.toLowerCase().contains(query) &&
            !s.provider.toLowerCase().contains(query)) {
          return false;
        }
      }

      // Connector filter
      if (_selectedConnectors.isNotEmpty) {
        final hasConnector = s.chargers
                ?.any((c) => _selectedConnectors.contains(c.connectorType)) ??
            false;
        if (!hasConnector) return false;
      }

      // Power filter
      if (_minPower != null && s.maxPower < _minPower!) {
        return false;
      }

      // Open now filter
      if (_openNow && !s.hoursJson.is24h) {
        return false;
      }

      // Available now filter
      if (_availableNow && s.availableChargers <= 0) {
        return false;
      }

      return true;
    }).toList();

    // Sort
    switch (_sortBy) {
      case 'distance':
        filtered.sort(
            (a, b) => (a.distanceKm ?? 100).compareTo(b.distanceKm ?? 100));
        break;
      case 'price':
        filtered.sort((a, b) => a.minPrice.compareTo(b.minPrice));
        break;
      case 'power':
        filtered.sort((a, b) => b.maxPower.compareTo(a.maxPower));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.avgRating ?? 0).compareTo(a.avgRating ?? 0));
        break;
      case 'ai_recommended':
      default:
        // AI score simulation - combine multiple factors
        filtered.sort((a, b) {
          final scoreA = (a.avgRating ?? 3) * 20 +
              (100 - (a.distanceKm ?? 10) * 5) +
              (a.availableChargers > 0 ? 30 : 0);
          final scoreB = (b.avgRating ?? 3) * 20 +
              (100 - (b.distanceKm ?? 10) * 5) +
              (b.availableChargers > 0 ? 30 : 0);
          return scoreB.compareTo(scoreA);
        });
        break;
    }

    return filtered;
  }

  void _showConnectorFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Chọn loại cổng sạc',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _connectorTypes.map((type) {
                      final isSelected = _selectedConnectors.contains(type);
                      return FilterChip(
                        selected: isSelected,
                        label: Text(type),
                        selectedColor: AppColors.primary,
                        onSelected: (selected) {
                          setModalState(() {
                            if (selected) {
                              _selectedConnectors.add(type);
                            } else {
                              _selectedConnectors.remove(type);
                            }
                          });
                          setState(() {});
                        },
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Áp dụng'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showPowerFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Công suất tối thiểu',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                children: [null, 50.0, 100.0, 150.0].map((power) {
                  final isSelected = _minPower == power;
                  return FilterChip(
                    selected: isSelected,
                    label:
                        Text(power == null ? 'Tất cả' : '>${power.toInt()}kW'),
                    selectedColor: AppColors.primary,
                    onSelected: (selected) {
                      setState(() => _minPower = selected ? power : null);
                      Navigator.pop(context);
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        );
      },
    );
  }
}
