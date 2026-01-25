import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/booking_provider.dart';
import '../../models/booking.dart';
import 'package:intl/intl.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingProvider>().fetchBookings();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final bookingProvider = context.watch<BookingProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.isVietnamese ? 'Đặt chỗ của tôi' : 'My Bookings'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          tabs: [
            Tab(text: lang.isVietnamese ? 'Sắp tới' : 'Upcoming'),
            Tab(text: lang.isVietnamese ? 'Hoàn thành' : 'Completed'),
            Tab(text: lang.isVietnamese ? 'Đã hủy' : 'Cancelled'),
          ],
        ),
      ),
      body: bookingProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildBookingList(bookingProvider.upcomingBookings, lang),
                _buildBookingList(bookingProvider.completedBookings, lang),
                _buildBookingList(bookingProvider.cancelledBookings, lang),
              ],
            ),
    );
  }

  Widget _buildBookingList(List<Booking> bookings, LanguageProvider lang) {
    if (bookings.isEmpty) {
      return _buildEmptyState(lang);
    }

    return RefreshIndicator(
      onRefresh: () => context.read<BookingProvider>().fetchBookings(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: bookings.length,
        itemBuilder: (context, index) {
          return _buildBookingCard(bookings[index], lang);
        },
      ),
    );
  }

  Widget _buildEmptyState(LanguageProvider lang) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.calendar_today_outlined,
            size: 64,
            color: AppColors.primary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            lang.isVietnamese ? 'Chưa có đặt chỗ' : 'No bookings yet',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            lang.isVietnamese
                ? 'Đặt chỗ tại trạm sạc để bắt đầu'
                : 'Book a charging station to get started',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _buildBookingCard(Booking booking, LanguageProvider lang) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    final timeFormat = DateFormat('HH:mm');

    Color statusColor;
    String statusText;

    switch (booking.status) {
      case 'confirmed':
        statusColor = AppColors.primary;
        statusText = lang.isVietnamese ? 'Đã xác nhận' : 'Confirmed';
        break;
      case 'completed':
        statusColor = AppColors.success;
        statusText = lang.isVietnamese ? 'Hoàn thành' : 'Completed';
        break;
      case 'cancelled':
        statusColor = AppColors.error;
        statusText = lang.isVietnamese ? 'Đã hủy' : 'Cancelled';
        break;
      default:
        statusColor = AppColors.warning;
        statusText = booking.status;
    }

    return GestureDetector(
      onTap: () => context.push('/booking-detail/${booking.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Theme.of(context).dividerColor.withOpacity(0.6),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.bolt, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        booking.stationName ?? 'Trạm sạc',
                        style:
                            Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        booking.stationAddress ?? '',
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    statusText,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _buildInfoChip(
                  Icons.calendar_today,
                  dateFormat.format(booking.startTime),
                ),
                const SizedBox(width: 12),
                _buildInfoChip(
                  Icons.access_time,
                  '${timeFormat.format(booking.startTime)} - ${timeFormat.format(booking.endTime)}',
                ),
              ],
            ),
            if (booking.chargerType != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildInfoChip(
                    Icons.electrical_services,
                    booking.chargerType!,
                  ),
                  if (booking.chargerPowerKw != null) ...[
                    const SizedBox(width: 12),
                    _buildInfoChip(
                      Icons.bolt,
                      '${booking.chargerPowerKw!.toInt()} kW',
                    ),
                  ],
                ],
              ),
            ],
            if (booking.isUpcoming || booking.isActive) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () =>
                          context.push('/booking-detail/${booking.id}'),
                      icon: const Icon(Icons.qr_code, size: 18),
                      label: Text(lang.isVietnamese ? 'Xem QR' : 'View QR'),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.primary),
          const SizedBox(width: 4),
          Text(
            text,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}
