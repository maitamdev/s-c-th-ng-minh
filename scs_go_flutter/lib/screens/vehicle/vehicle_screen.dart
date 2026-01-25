import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/vehicle.dart';

class VehicleScreen extends StatefulWidget {
  const VehicleScreen({super.key});

  @override
  State<VehicleScreen> createState() => _VehicleScreenState();
}

class _VehicleScreenState extends State<VehicleScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _batteryController;
  late TextEditingController _socController;
  late TextEditingController _consumptionController;
  String _connector = 'CCS2';
  bool _loading = false;

  final List<String> _connectorTypes = ['CCS2', 'Type2', 'CHAdeMO', 'GBT'];

  @override
  void initState() {
    super.initState();
    final vehicle = context.read<AuthProvider>().user?.vehicle;
    _nameController = TextEditingController(text: vehicle?.name ?? '');
    _batteryController =
        TextEditingController(text: vehicle?.batteryKwh.toString() ?? '60');
    _socController =
        TextEditingController(text: vehicle?.socCurrent.toString() ?? '50');
    _consumptionController = TextEditingController(
        text: vehicle?.consumptionKwhPer100km.toString() ?? '15');
    _connector = vehicle?.preferredConnector ?? 'CCS2';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _batteryController.dispose();
    _socController.dispose();
    _consumptionController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    try {
      final auth = context.read<AuthProvider>();
      final vehicle = Vehicle(
        id: auth.user?.vehicle?.id ??
            DateTime.now().millisecondsSinceEpoch.toString(),
        userId: auth.user?.id ?? '',
        name: _nameController.text,
        batteryKwh: double.parse(_batteryController.text),
        socCurrent: int.parse(_socController.text),
        consumptionKwhPer100km: double.parse(_consumptionController.text),
        preferredConnector: _connector,
        updatedAt: DateTime.now(),
      );

      await auth.updateVehicle(vehicle);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(context.read<LanguageProvider>().isVietnamese
                ? 'Đã lưu thông tin xe'
                : 'Vehicle info saved'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.t('vehicle.title')),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Vehicle illustration
              Center(
                child: Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.directions_car,
                    size: 60,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  lang.t('vehicle.subtitle'),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).textTheme.bodySmall?.color,
                      ),
                ),
              ),

              const SizedBox(height: 32),

              // Vehicle name
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: lang.t('vehicle.name'),
                  prefixIcon: const Icon(Icons.drive_file_rename_outline),
                  hintText: 'VD: VinFast VF8, Tesla Model 3...',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return lang.isVietnamese
                        ? 'Vui lòng nhập tên xe'
                        : 'Please enter vehicle name';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Battery capacity
              TextFormField(
                controller: _batteryController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: lang.t('vehicle.battery'),
                  prefixIcon: const Icon(Icons.battery_full),
                  suffixText: 'kWh',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return lang.isVietnamese
                        ? 'Vui lòng nhập dung lượng pin'
                        : 'Please enter battery capacity';
                  }
                  final num = double.tryParse(value);
                  if (num == null || num <= 0 || num > 200) {
                    return lang.isVietnamese
                        ? 'Dung lượng không hợp lệ'
                        : 'Invalid capacity';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Current SOC
              TextFormField(
                controller: _socController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: lang.t('vehicle.soc'),
                  prefixIcon: const Icon(Icons.battery_charging_full),
                  suffixText: '%',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return lang.isVietnamese
                        ? 'Vui lòng nhập mức pin'
                        : 'Please enter battery level';
                  }
                  final num = int.tryParse(value);
                  if (num == null || num < 0 || num > 100) {
                    return lang.isVietnamese
                        ? 'Mức pin phải từ 0-100%'
                        : 'Battery level must be 0-100%';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Consumption
              TextFormField(
                controller: _consumptionController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: lang.t('vehicle.consumption'),
                  prefixIcon: const Icon(Icons.speed),
                  suffixText: 'kWh/100km',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return lang.isVietnamese
                        ? 'Vui lòng nhập mức tiêu thụ'
                        : 'Please enter consumption';
                  }
                  final num = double.tryParse(value);
                  if (num == null || num <= 0 || num > 50) {
                    return lang.isVietnamese
                        ? 'Mức tiêu thụ không hợp lệ'
                        : 'Invalid consumption';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 24),

              // Connector type
              Text(
                lang.t('vehicle.connector'),
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                children: _connectorTypes.map((type) {
                  final isSelected = _connector == type;
                  return ChoiceChip(
                    selected: isSelected,
                    label: Text(type),
                    selectedColor: AppColors.primary,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : null,
                    ),
                    onSelected: (selected) {
                      setState(() => _connector = type);
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: _loading ? null : _save,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: _loading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : Text(
                    lang.t('vehicle.save'),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}
