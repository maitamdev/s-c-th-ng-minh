import { useState } from 'react';
import { motion } from 'framer-motion';
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
import { Vehicle } from '@/types';
import { CONNECTOR_TYPES, CONNECTOR_LABELS } from '@/lib/constants';
import { 
  Car,
  Battery,
  Zap,
  Plug,
  Plus,
  Trash2,
  Edit,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock vehicle data
const mockVehicle: Vehicle = {
  id: '1',
  user_id: 'user1',
  name: 'VinFast VF8',
  battery_kwh: 82,
  soc_current: 45,
  consumption_kwh_per_100km: 18,
  preferred_connector: 'CCS2',
  updated_at: new Date().toISOString(),
};

export default function VehicleSettings() {
  const [vehicle, setVehicle] = useState<Vehicle>(mockVehicle);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setEditing(false);
    }, 1000);
  };

  const estimatedRange = Math.round(
    (vehicle.battery_kwh * (vehicle.soc_current / 100)) / 
    (vehicle.consumption_kwh_per_100km / 100)
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Xe của tôi</h1>
            <p className="text-muted-foreground">Quản lý thông tin xe điện</p>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)}>
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>

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
                  value={vehicle.name}
                  onChange={(e) => setVehicle({ ...vehicle, name: e.target.value })}
                  className="text-xl font-bold"
                />
              ) : (
                <h2 className="text-xl font-bold text-foreground">{vehicle.name}</h2>
              )}
              <p className="text-sm text-muted-foreground">
                Cập nhật: {new Date(vehicle.updated_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Battery status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Battery className="w-4 h-4" />
                Mức pin hiện tại
              </Label>
              <span className="text-lg font-bold text-primary">{vehicle.soc_current}%</span>
            </div>
            {editing ? (
              <Slider
                value={[vehicle.soc_current]}
                max={100}
                step={1}
                onValueChange={([v]) => setVehicle({ ...vehicle, soc_current: v })}
                className="my-4"
              />
            ) : (
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full transition-all"
                  style={{ width: `${vehicle.soc_current}%` }}
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Quãng đường ước tính: <span className="text-foreground font-medium">{estimatedRange} km</span>
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
                  value={vehicle.battery_kwh}
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
                  value={vehicle.consumption_kwh_per_100km}
                  onChange={(e) => setVehicle({ ...vehicle, consumption_kwh_per_100km: Number(e.target.value) })}
                />
              ) : (
                <p className="text-lg font-semibold text-foreground">{vehicle.consumption_kwh_per_100km} kWh/100km</p>
              )}
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2 text-foreground">
                <Plug className="w-4 h-4" />
                Cổng sạc ưa thích
              </Label>
              {editing ? (
                <Select 
                  value={vehicle.preferred_connector}
                  onValueChange={(v) => setVehicle({ ...vehicle, preferred_connector: v as Vehicle['preferred_connector'] })}
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
                  {CONNECTOR_LABELS[vehicle.preferred_connector] || vehicle.preferred_connector}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {editing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              <Button 
                variant="hero" 
                className="flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setVehicle(mockVehicle);
                  setEditing(false);
                }}
              >
                Hủy
              </Button>
            </div>
          )}
        </motion.div>

        {/* Info */}
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-sm text-foreground">
            <strong>Mẹo:</strong> Cập nhật mức pin thường xuyên để AI gợi ý trạm sạc chính xác hơn.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
