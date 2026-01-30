import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui' as ui;
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/booking_provider.dart';
import '../../providers/stations_provider.dart';
import '../../models/booking.dart';

class BookingDetailScreen extends StatelessWidget {
  final String bookingId;

  const BookingDetailScreen({super.key, required this.bookingId});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final bookingProvider = context.watch<BookingProvider>();
    final booking = bookingProvider.getBookingById(bookingId);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (booking == null) {
      return Scaffold(
        appBar: AppBar(
          title:
              Text(lang.isVietnamese ? 'Chi tiết đặt chỗ' : 'Booking Detail'),
        ),
        body: Center(
          child: Text(lang.isVietnamese ? 'Không tìm thấy' : 'Not found'),
        ),
      );
    }

    final dateFormat =
        DateFormat('EEEE, dd/MM/yyyy', lang.isVietnamese ? 'vi' : 'en');
    final timeFormat = DateFormat('HH:mm');

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.isVietnamese ? 'Chi tiết đặt chỗ' : 'Booking Detail'),
        actions: [
          if (booking.isUpcoming)
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () =>
                  _showCancelDialog(context, lang, bookingProvider),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // QR Code Card - Show for all confirmed bookings (until checked-in)
            if (booking.status == 'confirmed')
              _buildQRCard(context, lang, booking, isDark),

            const SizedBox(height: 20),

            // Status Card
            _buildStatusCard(context, lang, booking),

            const SizedBox(height: 16),

            // Station Info Card
            _buildStationCard(context, lang, booking),

            const SizedBox(height: 16),

            // Time Info Card
            _buildTimeCard(context, lang, booking, dateFormat, timeFormat),

            const SizedBox(height: 16),

            // Charger Info Card
            _buildChargerCard(context, lang, booking),

            const SizedBox(height: 24),

            // Action Buttons
            if (booking.isUpcoming) ...[
              SizedBox(
                width: double.infinity,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.cyanLight],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ElevatedButton.icon(
                    onPressed: () =>
                        _handleCheckIn(context, lang, bookingProvider),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    icon:
                        const Icon(Icons.qr_code_scanner, color: Colors.white),
                    label: Text(
                      lang.isVietnamese ? 'Check-in ngay' : 'Check-in Now',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () =>
                      _showCancelDialog(context, lang, bookingProvider),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.error,
                    side: BorderSide(color: AppColors.error.withOpacity(0.5)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  icon: const Icon(Icons.cancel_outlined),
                  label: Text(
                      lang.isVietnamese ? 'Hủy đặt chỗ' : 'Cancel Booking'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildQRCard(BuildContext context, LanguageProvider lang,
      Booking booking, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.primary.withOpacity(0.1),
            AppColors.cyanLight.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            lang.isVietnamese ? 'Mã QR Check-in' : 'Check-in QR Code',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            lang.isVietnamese
                ? 'Quét mã này tại trạm sạc để check-in'
                : 'Scan this code at the station to check-in',
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: QrImageView(
              data: booking.qrData,
              version: QrVersions.auto,
              size: 200,
              backgroundColor: Colors.white,
              eyeStyle: const QrEyeStyle(
                eyeShape: QrEyeShape.square,
                color: Colors.black,
              ),
              dataModuleStyle: const QrDataModuleStyle(
                dataModuleShape: QrDataModuleShape.square,
                color: Colors.black,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.white.withOpacity(0.1)
                  : Colors.grey.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'ID: ${booking.id.substring(0, 8).toUpperCase()}',
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 14,
                color: Theme.of(context).textTheme.bodyMedium?.color,
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Action Buttons - Save & Navigate
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _saveQRImage(context, lang, booking),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: BorderSide(color: AppColors.primary.withOpacity(0.5)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  icon: const Icon(Icons.save_alt, size: 20),
                  label: Text(
                    lang.isVietnamese ? 'Lưu ảnh' : 'Save Image',
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _navigateToStation(context, booking),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  icon: const Icon(Icons.directions, size: 20),
                  label: Text(
                    lang.isVietnamese ? 'Chỉ đường' : 'Navigate',
                    style: const TextStyle(fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard(
      BuildContext context, LanguageProvider lang, Booking booking) {
    Color statusColor;
    String statusText;
    IconData statusIcon;

    switch (booking.status) {
      case 'confirmed':
        statusColor = AppColors.primary;
        statusText = lang.isVietnamese ? 'Đã xác nhận' : 'Confirmed';
        statusIcon = Icons.check_circle;
        break;
      case 'completed':
        statusColor = AppColors.success;
        statusText = lang.isVietnamese ? 'Hoàn thành' : 'Completed';
        statusIcon = Icons.verified;
        break;
      case 'cancelled':
        statusColor = AppColors.error;
        statusText = lang.isVietnamese ? 'Đã hủy' : 'Cancelled';
        statusIcon = Icons.cancel;
        break;
      default:
        statusColor = AppColors.warning;
        statusText = booking.status;
        statusIcon = Icons.hourglass_empty;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: statusColor.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(statusIcon, color: statusColor, size: 32),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  lang.isVietnamese ? 'Trạng thái' : 'Status',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                Text(
                  statusText,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ),
          if (booking.isActive)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.success,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                lang.isVietnamese ? 'Đang diễn ra' : 'Active',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStationCard(
      BuildContext context, LanguageProvider lang, Booking booking) {
    return _buildInfoCard(
      context,
      icon: Icons.ev_station,
      title: lang.isVietnamese ? 'Trạm sạc' : 'Station',
      children: [
        Text(
          booking.stationName ?? 'N/A',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        if (booking.stationAddress != null) ...[
          const SizedBox(height: 4),
          Text(
            booking.stationAddress!,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ],
    );
  }

  Widget _buildTimeCard(BuildContext context, LanguageProvider lang,
      Booking booking, DateFormat dateFormat, DateFormat timeFormat) {
    return _buildInfoCard(
      context,
      icon: Icons.access_time,
      title: lang.isVietnamese ? 'Thời gian' : 'Time',
      children: [
        Text(
          dateFormat.format(booking.startTime),
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 4),
        Text(
          '${timeFormat.format(booking.startTime)} - ${timeFormat.format(booking.endTime)} (${booking.durationMinutes} ${lang.isVietnamese ? 'phút' : 'min'})',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      ],
    );
  }

  Widget _buildChargerCard(
      BuildContext context, LanguageProvider lang, Booking booking) {
    return _buildInfoCard(
      context,
      icon: Icons.electrical_services,
      title: lang.isVietnamese ? 'Cổng sạc' : 'Charger',
      children: [
        Row(
          children: [
            if (booking.chargerType != null)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  booking.chargerType!,
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            if (booking.chargerPowerKw != null) ...[
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${booking.chargerPowerKw!.toInt()} kW',
                  style: const TextStyle(
                    color: AppColors.warning,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ],
        ),
        if (booking.totalPrice != null) ...[
          const SizedBox(height: 8),
          Text(
            '${lang.isVietnamese ? 'Tổng tiền' : 'Total'}: ${booking.totalPrice!.toInt()}đ',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ],
    );
  }

  Widget _buildInfoCard(BuildContext context,
      {required IconData icon,
      required String title,
      required List<Widget> children}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border:
            Border.all(color: Theme.of(context).dividerColor.withOpacity(0.6)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 4),
                ...children,
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showCancelDialog(
      BuildContext context, LanguageProvider lang, BookingProvider provider) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(lang.isVietnamese ? 'Hủy đặt chỗ?' : 'Cancel Booking?'),
        content: Text(
          lang.isVietnamese
              ? 'Bạn có chắc muốn hủy đặt chỗ này?'
              : 'Are you sure you want to cancel this booking?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(lang.isVietnamese ? 'Không' : 'No'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await provider.cancelBooking(bookingId);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(lang.isVietnamese
                        ? 'Đã hủy đặt chỗ'
                        : 'Booking cancelled'),
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: Text(
              lang.isVietnamese ? 'Hủy' : 'Cancel',
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _handleCheckIn(BuildContext context, LanguageProvider lang,
      BookingProvider provider) async {
    final success = await provider.checkIn(bookingId);
    if (context.mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(lang.isVietnamese
                ? 'Check-in thành công!'
                : 'Check-in successful!'),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text(lang.isVietnamese ? 'Có lỗi xảy ra' : 'An error occurred'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _saveQRImage(
      BuildContext context, LanguageProvider lang, Booking booking) async {
    try {
      // Request storage permission
      if (Platform.isAndroid) {
        final status = await Permission.storage.request();
        if (!status.isGranted) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(lang.isVietnamese
                    ? 'Cần cấp quyền truy cập bộ nhớ'
                    : 'Storage permission required'),
                backgroundColor: AppColors.error,
              ),
            );
          }
          return;
        }
      }

      // Create QR image
      final qrValidationResult = QrValidator.validate(
        data: booking.qrData,
        version: QrVersions.auto,
        errorCorrectionLevel: QrErrorCorrectLevel.L,
      );

      if (qrValidationResult.status == QrValidationStatus.valid) {
        final qrCode = qrValidationResult.qrCode!;
        final painter = QrPainter.withQr(
          qr: qrCode,
          color: Colors.black,
          emptyColor: Colors.white,
          gapless: true,
        );

        final picData =
            await painter.toImageData(400, format: ui.ImageByteFormat.png);
        if (picData != null) {
          // Save to Pictures directory
          final directory = Platform.isAndroid
              ? Directory('/storage/emulated/0/Pictures/SCS_GO')
              : await getApplicationDocumentsDirectory();

          if (!await directory.exists()) {
            await directory.create(recursive: true);
          }

          final fileName =
              'QR_${booking.id.substring(0, 8)}_${DateTime.now().millisecondsSinceEpoch}.png';
          final file = File('${directory.path}/$fileName');
          await file.writeAsBytes(picData.buffer.asUint8List());

          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(lang.isVietnamese
                    ? 'Đã lưu ảnh QR vào thư mục Pictures/SCS_GO'
                    : 'QR image saved to Pictures/SCS_GO'),
                backgroundColor: AppColors.success,
                action: SnackBarAction(
                  label: 'OK',
                  textColor: Colors.white,
                  onPressed: () {},
                ),
              ),
            );
          }
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(lang.isVietnamese
                ? 'Lỗi khi lưu ảnh: $e'
                : 'Error saving image: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _navigateToStation(BuildContext context, Booking booking) {
    try {
      // Get station from provider
      final stationProvider = context.read<StationsProvider>();
      final station = stationProvider.stations.firstWhere(
        (s) => s.name == booking.stationName,
        orElse: () => stationProvider.stations.first,
      );

      context.push('/navigation', extra: station);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Không tìm thấy trạm sạc'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}
