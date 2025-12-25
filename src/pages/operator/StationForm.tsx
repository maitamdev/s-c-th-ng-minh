import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OperatorLayout } from '@/components/layout/OperatorLayout';
import { Button } from '@/components/ui/button';
import { useOperator, OperatorCharger } from '@/hooks/useOperator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Zap,
  Clock,
  Image,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  Wifi,
  Coffee,
  Car,
  ShoppingBag,
  Utensils,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AMENITIES = [
  { id: 'wifi', icon: Wifi, label: 'WiFi' },
  { id: 'cafe', icon: Coffee, label: 'Cafe' },
  { id: 'parking', icon: Car, label: 'Bãi đỗ xe' },
  { id: 'shopping', icon: ShoppingBag, label: 'Mua sắm' },
  { id: 'toilet', icon: Utensils, label: 'WC' },
];

const CONNECTOR_TYPES = ['CCS2', 'Type2', 'CHAdeMO', 'GBT'];
const POWER_OPTIONS = [22, 50, 60, 100, 120, 150, 250, 350];

export default function StationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { stations, createStation, updateStation, createCharger, deleteCharger } = useOperator();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: 21.0285,
    lng: 105.8542,
    provider: '',
    description: '',
    image_url: '',
    hours_open: '06:00',
    hours_close: '23:00',
    is_24h: false,
    amenities: [] as string[],
  });

  const [chargers, setChargers] = useState<Partial<OperatorCharger>[]>([
    { connector_type: 'CCS2', power_kw: 150, price_per_kwh: 3500, charger_number: 1 },
  ]);

  // Load existing station data
  useEffect(() => {
    if (isEdit && stations.length > 0) {
      const station = stations.find(s => s.id === id);
      if (station) {
        setFormData({
          name: station.name,
          address: station.address,
          lat: station.lat,
          lng: station.lng,
          provider: station.provider,
          description: station.description || '',
          image_url: station.image_url || '',
          hours_open: station.hours_open,
          hours_close: station.hours_close,
          is_24h: station.is_24h,
          amenities: station.amenities || [],
        });
        if (station.chargers && station.chargers.length > 0) {
          setChargers(station.chargers);
        }
      }
    }
  }, [isEdit, id, stations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        const { error } = await updateStation(id!, formData);
        if (error) throw new Error(error);
        toast({ title: t('common.success'), description: t('operator.stationUpdated') });
      } else {
        const { data, error } = await createStation(formData);
        if (error) throw new Error(error);
        
        // Create chargers for new station
        if (data) {
          for (const charger of chargers) {
            await createCharger({
              ...charger,
              station_id: data.id,
              status: 'available',
            });
          }
        }
        toast({ title: t('common.success'), description: t('operator.stationCreated') });
      }
      navigate('/operator/stations');
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addCharger = () => {
    setChargers([
      ...chargers,
      {
        connector_type: 'CCS2',
        power_kw: 150,
        price_per_kwh: 3500,
        charger_number: chargers.length + 1,
      },
    ]);
  };

  const removeCharger = (index: number) => {
    if (chargers.length > 1) {
      setChargers(chargers.filter((_, i) => i !== index));
    }
  };

  const updateChargerField = (index: number, field: string, value: any) => {
    setChargers(chargers.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const toggleAmenity = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  return (
    <OperatorLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/operator/stations')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {isEdit ? t('operator.editStation') : t('operator.addStation')}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? t('operator.editStationDesc') : t('operator.addStationDesc')}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('operator.form.basicInfo')}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('operator.form.stationName')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Trạm sạc VinFast Hà Nội"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('operator.form.provider')} *
              </label>
              <input
                type="text"
                required
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="VD: VinFast, EVN, EV One..."
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('operator.form.address')} *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="VD: 123 Nguyễn Trãi, Thanh Xuân, Hà Nội"
              className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('operator.form.latitude')} *
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('operator.form.longitude')} *
              </label>
              <input
                type="number"
                step="any"
                required
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('operator.form.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('operator.form.descriptionPlaceholder')}
              rows={3}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              {t('operator.form.imageUrl')}
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </motion.div>

        {/* Operating Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t('operator.form.operatingHours')}
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_24h}
                onChange={(e) => setFormData({ ...formData, is_24h: e.target.checked })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-foreground">{t('operator.form.is24h')}</span>
            </label>
          </div>

          {!formData.is_24h && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('operator.form.openTime')}
                </label>
                <input
                  type="time"
                  value={formData.hours_open}
                  onChange={(e) => setFormData({ ...formData, hours_open: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('operator.form.closeTime')}
                </label>
                <input
                  type="time"
                  value={formData.hours_close}
                  onChange={(e) => setFormData({ ...formData, hours_close: e.target.value })}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Amenities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground">
            {t('operator.form.amenities')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {AMENITIES.map((amenity) => (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all',
                  formData.amenities.includes(amenity.id)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-secondary text-muted-foreground border-border hover:border-primary'
                )}
              >
                <amenity.icon className="w-4 h-4" />
                {amenity.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Chargers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {t('operator.form.chargers')}
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={addCharger}>
              <Plus className="w-4 h-4" />
              {t('operator.form.addCharger')}
            </Button>
          </div>

          <div className="space-y-4">
            {chargers.map((charger, index) => (
              <div
                key={index}
                className="p-4 bg-secondary/50 rounded-xl border border-border space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {t('operator.form.charger')} #{index + 1}
                  </span>
                  {chargers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCharger(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      {t('operator.form.connectorType')}
                    </label>
                    <select
                      value={charger.connector_type}
                      onChange={(e) => updateChargerField(index, 'connector_type', e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    >
                      {CONNECTOR_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      {t('operator.form.power')} (kW)
                    </label>
                    <select
                      value={charger.power_kw}
                      onChange={(e) => updateChargerField(index, 'power_kw', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    >
                      {POWER_OPTIONS.map((power) => (
                        <option key={power} value={power}>{power} kW</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      {t('operator.form.pricePerKwh')} (đ)
                    </label>
                    <input
                      type="number"
                      value={charger.price_per_kwh}
                      onChange={(e) => updateChargerField(index, 'price_per_kwh', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/operator/stations')}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="hero" className="flex-1" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? t('common.save') : t('operator.createStation')}
              </>
            )}
          </Button>
        </div>
      </form>
    </OperatorLayout>
  );
}
