import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/stations_provider.dart';
import '../../providers/booking_provider.dart';
import '../../models/station.dart';

class BookingScreen extends StatefulWidget {
  final String stationId;

  const BookingScreen({super.key, required this.stationId});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  Charger? _selectedCharger;
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _selectedTime = TimeOfDay.now();
  int _duration = 30; // minutes

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final stationsProvider = context.watch<StationsProvider>();
    final station = stationsProvider.getStationById(widget.stationId);

    if (station == null) {
      return Scaffold(
        appBar: AppBar(title: Text(lang.t('station.book'))),
        body: Center(child: Text(lang.t('common.noData'))),
      );
    }

    final availableChargers =
        station.chargers?.where((c) => c.status == 'available').toList() ?? [];

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.t('station.book')),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Station info card
              _buildStationInfo(context, lang, station),

              const SizedBox(height: 24),

              // Select charger
              Text(
                lang.isVietnamese ? 'Chọn cổng sạc' : 'Select Charger',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 12),
              ...availableChargers
                  .map((charger) => _buildChargerOption(context, charger)),

              if (availableChargers.isEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border:
                        Border.all(color: AppColors.warning.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber, color: AppColors.warning),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          lang.isVietnamese
                              ? 'Không có cổng sạc khả dụng'
                              : 'No chargers available',
                          style: const TextStyle(color: AppColors.warning),
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 24),

              // Select date & time
              Text(
                lang.isVietnamese ? 'Chọn thời gian' : 'Select Time',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildDatePicker(context, lang),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildTimePicker(context, lang),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Duration
              Text(
                lang.isVietnamese ? 'Thời lượng' : 'Duration',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [30, 60, 90, 120].map((mins) {
                  final isSelected = _duration == mins;
                  return ChoiceChip(
                    label: Text('$mins ${lang.isVietnamese ? 'phút' : 'min'}'),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : null,
                    ),
                    onSelected: (selected) {
                      if (selected) setState(() => _duration = mins);
                    },
                  );
                }).toList(),
              ),

              const SizedBox(height: 32),

              // Summary card
              if (_selectedCharger != null)
                _buildSummaryCard(context, lang, station),

              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
      bottomNavigationBar:
          _buildBottomBar(context, lang, station, availableChargers.isNotEmpty),
    );
  }

  Widget _buildStationInfo(
      BuildContext context, LanguageProvider lang, Station station) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.cyanLight.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.bolt, color: AppColors.primary, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  station.name,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.location_on,
                        size: 14,
                        color: Theme.of(context).textTheme.bodySmall?.color),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        station.address,
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChargerOption(BuildContext context, Charger charger) {
    final isSelected = _selectedCharger?.id == charger.id;

    return GestureDetector(
      onTap: () =>
          setState(() => _selectedCharger = isSelected ? null : charger),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color:
                isSelected ? AppColors.primary : Theme.of(context).dividerColor,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.electrical_services,
                  color: AppColors.success),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    charger.connectorType,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
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
            if (isSelected)
              const Icon(Icons.check_circle,
                  color: AppColors.primary, size: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildDatePicker(BuildContext context, LanguageProvider lang) {
    return InkWell(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: _selectedDate,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 7)),
        );
        if (picked != null) setState(() => _selectedDate = picked);
      },
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today,
                size: 20, color: AppColors.primary),
            const SizedBox(width: 10),
            Text(
              '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimePicker(BuildContext context, LanguageProvider lang) {
    return InkWell(
      onTap: () async {
        final picked = await showTimePicker(
          context: context,
          initialTime: _selectedTime,
        );
        if (picked != null) setState(() => _selectedTime = picked);
      },
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Row(
          children: [
            const Icon(Icons.access_time, size: 20, color: AppColors.primary),
            const SizedBox(width: 10),
            Text(
              _selectedTime.format(context),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCard(
      BuildContext context, LanguageProvider lang, Station station) {
    final estimatedCost = (_selectedCharger!.pricePerKwh *
            _selectedCharger!.powerKw *
            _duration /
            60)
        .toInt();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            lang.isVietnamese ? 'Tóm tắt đặt chỗ' : 'Booking Summary',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          const SizedBox(height: 12),
          _buildSummaryRow(context, lang.isVietnamese ? 'Cổng sạc' : 'Charger',
              _selectedCharger!.connectorType),
          _buildSummaryRow(context, lang.isVietnamese ? 'Công suất' : 'Power',
              '${_selectedCharger!.powerKw.toInt()} kW'),
          _buildSummaryRow(
              context,
              lang.isVietnamese ? 'Thời lượng' : 'Duration',
              '$_duration ${lang.isVietnamese ? 'phút' : 'min'}'),
          const Divider(),
          _buildSummaryRow(
            context,
            lang.isVietnamese ? 'Ước tính chi phí' : 'Estimated Cost',
            '${estimatedCost.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}đ',
            isBold: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(BuildContext context, String label, String value,
      {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).textTheme.bodySmall?.color,
                ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
                  color: isBold ? AppColors.primary : null,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, LanguageProvider lang,
      Station station, bool canBook) {
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
            SizedBox(
              width: double.infinity,
              child: Container(
                decoration: BoxDecoration(
                  gradient: _selectedCharger != null
                      ? const LinearGradient(
                          colors: [AppColors.primary, AppColors.cyanLight])
                      : null,
                  color: _selectedCharger == null
                      ? Theme.of(context).disabledColor
                      : null,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ElevatedButton.icon(
                  onPressed: _selectedCharger != null
                      ? () => _confirmBooking(context, lang)
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    disabledBackgroundColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  icon: Icon(Icons.calendar_today,
                      color: _selectedCharger != null ? Colors.white : null),
                  label: Text(
                    lang.t('station.book'),
                    style: TextStyle(
                      color: _selectedCharger != null ? Colors.white : null,
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              lang.isVietnamese
                  ? 'Hủy miễn phí trước 30 phút'
                  : 'Free cancellation up to 30 min before',
              style: Theme.of(context).textTheme.labelSmall,
            ),
          ],
        ),
      ),
    );
  }

  void _confirmBooking(BuildContext context, LanguageProvider lang) async {
    if (_selectedCharger == null) return;

    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    final bookingProvider = context.read<BookingProvider>();

    // Calculate start time
    final startTime = DateTime(
      _selectedDate.year,
      _selectedDate.month,
      _selectedDate.day,
      _selectedTime.hour,
      _selectedTime.minute,
    );

    // Calculate price
    final pricePerKwh = _selectedCharger!.pricePerKwh;
    final powerKw = _selectedCharger!.powerKw;
    final hours = _duration / 60;
    final estimatedKwh = powerKw * hours;
    final totalPrice = estimatedKwh * pricePerKwh;

    final booking = await bookingProvider.createBooking(
      stationId: widget.stationId,
      chargerId: _selectedCharger!.id,
      startTime: startTime,
      durationMinutes: _duration,
      totalPrice: totalPrice,
    );

    if (!context.mounted) return;
    Navigator.pop(context); // Close loading

    if (booking != null) {
      // Success - navigate to booking detail
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Row(
            children: [
              const Icon(Icons.check_circle, color: AppColors.success),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  lang.isVietnamese
                      ? 'Đặt chỗ thành công!'
                      : 'Booking Confirmed!',
                  style: const TextStyle(fontSize: 18),
                ),
              ),
            ],
          ),
          content: Text(
            lang.isVietnamese
                ? 'Bạn đã đặt chỗ thành công. Xem mã QR để check-in.'
                : 'Your booking is confirmed. View QR code to check-in.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.go('/dashboard');
              },
              child: Text(lang.isVietnamese ? 'Về Dashboard' : 'Dashboard'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.push('/booking-detail/${booking.id}');
              },
              child: Text(lang.isVietnamese ? 'Xem QR' : 'View QR'),
            ),
          ],
        ),
      );
    } else {
      // Error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            bookingProvider.error ??
                (lang.isVietnamese ? 'Có lỗi xảy ra' : 'An error occurred'),
          ),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}
