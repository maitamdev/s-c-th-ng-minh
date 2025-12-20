import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Vehicle } from '@/types';
import { CONNECTOR_TYPES, CONNECTOR_LABELS } from '@/lib/constants';
import {
  Car,
  Battery,
  Zap,
  Plug,
  Edit,
  Save,
  Loader2,
  Usb,
  CheckCircle2,
  Wifi,
  Smartphone,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Danh sách xe điện phổ biến tại Việt Nam
const CAR_DATABASE = [
  { id: 'vf8', name: 'VinFast VF8', battery: 82, consumption: 18, connector: 'CCS2' as const },
  { id: 'vf9', name: 'VinFast VF9', battery: 92, consumption: 20, connector: 'CCS2' as const },
  { id: 'vfe34', name: 'VinFast VFe34', battery: 42, consumption: 15, connector: 'CCS2' as const },
  { id: 'vf5', name: 'VinFast VF5', battery: 37, consumption: 14, connector: 'CCS2' as const },
  { id: 'vf6', name: 'VinFast VF6', battery: 59, consumption: 16, connector: 'CCS2' as const },
  { id: 'vf7', name: 'VinFast VF7', battery: 75, consumption: 17, connector: 'CCS2' as const },
  { id: 'model3', name: 'Tesla Model 3', battery: 60, consumption: 14, connector: 'CCS2' as const },
  { id: 'modely', name: 'Tesla Model Y', battery: 75, consumption: 16, connector: 'CCS2' as const },
  { id: 'ioniq5', name: 'Hyundai Ioniq 5', battery: 72, consumption: 17, connector: 'CCS2' as const },
  { id: 'ioniq6', name: 'Hyundai Ioniq 6', battery: 77, consumption: 14, connector: 'CCS2' as const },
  { id: 'ev6', name: 'KIA EV6', battery: 77, consumption: 16, connector: 'CCS2' as const },
  { id: 'eqs', name: 'Mercedes EQS', battery: 108, consumption: 18, connector: 'CCS2' as const },
  { id: 'ix', name: 'BMW iX', battery: 105, consumption: 20, connector: 'CCS2' as const },
  { id: 'byd_atto3', name: 'BYD Atto 3', battery: 60, consumption: 16, connector: 'CCS2' as const },
];

export default function VehicleSettings() {
  const { user, updateVehicle } = useAuth();
  const { toast } = useToast();

  const [vehicle, setVehicle] = useState<Partial<Vehicle>>({
    name: '',
    battery_kwh: 60,
    soc_current: 50,
    consumption_kwh_per_100km: 16,
    preferred_connector: 'CCS2',
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState(0);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Load user's vehicle data
  useEffect(() => {
    if (user?.vehicle) {
      setVehicle(user.vehicle);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateVehicle(vehicle);
      toast({
        title: 'Đã lưu',
        description: 'Thông tin xe đã được cập nhật',
      });
      setEditing(false);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thông tin xe',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Disconnect vehicle - clear data
  const handleDisconnect = async () => {
    try {
      await updateVehicle({
        name: '',
        battery_kwh: 0,
        soc_current: 0,
        consumption_kwh_per_100km: 0,
        preferred_connector: 'CCS2',
      });
      setVehicle({
        name: '',
        battery_kwh: 60,
        soc_current: 50,
        consumption_kwh_per_100km: 16,
        preferred_connector: 'CCS2',
      });
      toast({
        title: 'Đã ngắt kết nối',
        description: 'Thông tin xe đã được xóa',
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể ngắt kết nối xe',
        variant: 'destructive',
      });
    }
  };

  // Simulate connecting to vehicle
  const handleConnect = async () => {
    setConnecting(true);
    setConnectionStep(1);

    // Step 1: Searching
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnectionStep(2);

    // Step 2: Found device
    await new Promise(resolve => setTimeout(resolve, 1000));
    setConnectionStep(3);

    // Step 3: Reading data - randomly select a car
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const randomCar = CAR_DATABASE[Math.floor(Math.random() * CAR_DATABASE.length)];
    const randomSoc = Math.floor(Math.random() * 60) + 20; // 20-80%
    
    setVehicle({
      name: randomCar.name,
      battery_kwh: randomCar.battery,
      soc_current: randomSoc,
      consumption_kwh_per_100km: randomCar.consumption,
      preferred_connector: randomCar.connector,
    });

    setConnectionStep(4);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setConnecting(false);
    setShowConnectModal(false);
    setConnectionStep(0);

    // Auto save
    try {
      await updateVehicle({
        name: randomCar.name,
        battery_kwh: randomCar.battery,
        soc_current: randomSoc,
        consumption_kwh_per_100km: randomCar.consumption,
        preferred_connector: randomCar.connector,
      });
      
      toast({
        title: 'Kết nối thành công!',
        description: `Đã nhận diện ${randomCar.name} với ${randomSoc}% pin`,
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thông tin xe',
        variant: 'destructive',
      });
    }
  };

  const estimatedRange = Math.round(
    ((vehicle.battery_kwh || 60) * ((vehicle.soc_current || 50) / 100)) /
      ((vehicle.consumption_kwh_per_100km || 16) / 100)
  );

  const hasVehicle = user?.vehicle && user.vehicle.name;

  const connectionSteps = [
    { icon: Wifi, text: 'Đang tìm kiếm thiết bị...' },
    { icon: Car, text: 'Đã tìm thấy xe điện!' },
    { icon: Battery, text: 'Đang đọc thông tin xe...' },
    { icon: CheckCircle2, text: 'Hoàn tất!' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Xe của tôi</h1>
            <p className="text-muted-foreground">Kết nối và quản lý xe điện</p>
          </div>
          {hasVehicle && !editing && (
            <Button onClick={() => setEditing(true)}>
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>

        {/* Connect Vehicle Card */}
        {!hasVehicle && !editing ? (
          <motion.div
            className="card-premium p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Usb className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Kết nối xe điện</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Kết nối xe qua cáp sạc hoặc Bluetooth để tự động nhận diện thông tin xe và mức pin
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" size="lg" onClick={() => setShowConnectModal(true)}>
                <Usb className="w-5 h-5 mr-2" />
                Kết nối xe
              </Button>
              <Button variant="outline" size="lg" onClick={() => setEditing(true)}>
                <Edit className="w-5 h-5 mr-2" />
                Nhập thủ công
              </Button>
            </div>

            {/* Connection methods */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Phương thức kết nối hỗ trợ</p>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Usb className="w-4 h-4" />
                  <span>Cáp OBD-II</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wifi className="w-4 h-4" />
                  <span>Bluetooth</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="w-4 h-4" />
                  <span>App xe</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="card-premium p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Vehicle header */}
            <div className="flex items-center gap-4 pb-6 border-b border-border mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Car className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                {editing ? (
                  <Input
                    value={vehicle.name || ''}
                    onChange={(e) => setVehicle({ ...vehicle, name: e.target.value })}
                    placeholder="Tên xe (VD: VinFast VF8)"
                    className="text-xl font-bold"
                  />
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-foreground">{vehicle.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        Đã kết nối
                      </span>
                    </div>
                  </>
                )}
              </div>
              {!editing && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowConnectModal(true)}>
                    <Usb className="w-4 h-4 mr-1" />
                    Đồng bộ
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleDisconnect}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Battery status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-2 text-foreground">
                  <Battery className="w-4 h-4" />
                  Mức pin hiện tại
                </Label>
                <span className="text-lg font-bold text-primary">{vehicle.soc_current || 50}%</span>
              </div>
              {editing ? (
                <Slider
                  value={[vehicle.soc_current || 50]}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setVehicle({ ...vehicle, soc_current: v })}
                  className="my-4"
                />
              ) : (
                <div className="h-4 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full transition-all',
                      (vehicle.soc_current || 50) > 50 
                        ? 'bg-gradient-to-r from-primary to-cyan-400' 
                        : (vehicle.soc_current || 50) > 20 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
                          : 'bg-gradient-to-r from-red-500 to-red-400'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${vehicle.soc_current || 50}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Quãng đường ước tính:{' '}
                <span className="text-foreground font-medium">{estimatedRange} km</span>
              </p>
            </div>

            {/* Specs */}
            <div className="grid gap-4">
              <div>
                <Label className="flex items-center gap-2 mb-2 text-foreground">
                  <Zap className="w-4 h-4" />
                  Dung lượng pin (kWh)
                </Label>
                {editing ? (
                  <Input
                    type="number"
                    value={vehicle.battery_kwh || 60}
                    onChange={(e) => setVehicle({ ...vehicle, battery_kwh: Number(e.target.value) })}
                  />
                ) : (
                  <p className="text-lg font-semibold text-foreground">{vehicle.battery_kwh} kWh</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-foreground">
                  Tiêu hao (kWh/100km)
                </Label>
                {editing ? (
                  <Input
                    type="number"
                    value={vehicle.consumption_kwh_per_100km || 16}
                    onChange={(e) =>
                      setVehicle({ ...vehicle, consumption_kwh_per_100km: Number(e.target.value) })
                    }
                  />
                ) : (
                  <p className="text-lg font-semibold text-foreground">
                    {vehicle.consumption_kwh_per_100km} kWh/100km
                  </p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-foreground">
                  <Plug className="w-4 h-4" />
                  Cổng sạc ưa thích
                </Label>
                {editing ? (
                  <Select
                    value={vehicle.preferred_connector || 'CCS2'}
                    onValueChange={(v) =>
                      setVehicle({ ...vehicle, preferred_connector: v as Vehicle['preferred_connector'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONNECTOR_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {CONNECTOR_LABELS[type] || type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg font-semibold text-foreground">
                    {CONNECTOR_LABELS[vehicle.preferred_connector || 'CCS2'] || vehicle.preferred_connector}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {editing && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                <Button variant="hero" className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (user?.vehicle) {
                      setVehicle(user.vehicle);
                    }
                    setEditing(false);
                  }}
                >
                  Hủy
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Info */}
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-sm text-foreground">
            <strong>Mẹo:</strong> Kết nối xe thường xuyên để cập nhật mức pin chính xác, giúp AI gợi ý trạm sạc tốt hơn.
          </p>
        </div>
      </div>

      {/* Connection Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !connecting && setShowConnectModal(false)}
          >
            <motion.div
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {!connecting ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Kết nối xe</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowConnectModal(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Usb className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground">
                      Đảm bảo xe đang bật và kết nối với thiết bị OBD-II hoặc bật Bluetooth
                    </p>
                  </div>

                  <Button variant="hero" className="w-full" onClick={handleConnect}>
                    <Wifi className="w-4 h-4 mr-2" />
                    Bắt đầu kết nối
                  </Button>
                </>
              ) : (
                <div className="py-4">
                  <div className="space-y-4">
                    {connectionSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = connectionStep === index + 1;
                      const isCompleted = connectionStep > index + 1;
                      
                      return (
                        <motion.div
                          key={index}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl transition-colors',
                            isActive && 'bg-primary/10',
                            isCompleted && 'opacity-50'
                          )}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: connectionStep >= index + 1 ? 1 : 0.3,
                            x: 0 
                          }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                          )}>
                            {isActive ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <StepIcon className="w-5 h-5" />
                            )}
                          </div>
                          <span className={cn(
                            'font-medium',
                            isActive && 'text-primary'
                          )}>
                            {step.text}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
