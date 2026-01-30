import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { InsightsPanel } from '@/components/stations/InsightsPanel';
import { PredictionChip } from '@/components/ui/prediction-chip';
import { AIScoreBadge } from '@/components/ui/ai-score-badge';
import { Button } from '@/components/ui/button';
import { StationDetailSkeleton } from '@/components/ui/skeleton';
import { ShareModal } from '@/components/ShareModal';
import { ReviewSection } from '@/components/reviews';
import { useStation } from '@/hooks/useStations';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CONNECTOR_LABELS } from '@/lib/constants';
import { getSimplePrediction } from '@/ai/prediction';
import { Charger, ChargerStatus } from '@/types';
import {
  MapPin,
  Clock,
  Star,
  Zap,
  ChevronLeft,
  Navigation,
  Heart,
  Share2,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plug,
  Coins,
  Calendar,
  User,
  Wifi,
  Coffee,
  Car,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const amenityIcons: Record<string, React.ElementType> = {
  'toilet': User,
  'cafe': Coffee,
  'wifi': Wifi,
  'parking': Car,
  'shopping': Car,
};

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const { station, loading, refetch } = useStation(id || '');
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const chargerStatusConfig: Record<ChargerStatus, { icon: React.ElementType; label: string; className: string }> = {
    available: { icon: CheckCircle2, label: t('booking.chargerAvailable'), className: 'text-success' },
    occupied: { icon: AlertCircle, label: t('booking.chargerOccupied'), className: 'text-warning' },
    out_of_service: { icon: XCircle, label: t('booking.chargerMaintenance'), className: 'text-destructive' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 container mx-auto px-4">
          <StationDetailSkeleton />
        </main>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 container mx-auto px-4 text-center py-12">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('explore.noStations')}</h1>
          <p className="text-muted-foreground mb-4">{t('common.noData')}</p>
          <Button asChild>
            <Link to="/explore">{t('common.back')}</Link>
          </Button>
        </main>
      </div>
    );
  }

  const prediction = getSimplePrediction(station);
  const availableChargers = station.chargers?.filter((c) => c.status === 'available') || [];
  const stationFavorite = isFavorite(station.id);

  const handleToggleFavorite = () => {
    toggleFavorite(station.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to="/explore">
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <motion.div
                className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-cyan-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {station.image_url ? (
                  <img src={station.image_url} alt={station.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-20 h-20 text-primary/30" />
                  </div>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  {station.hours_json?.is_24h && (
                    <span className="px-2.5 py-1 bg-success/90 text-success-foreground rounded-full text-sm font-medium">
                      24h
                    </span>
                  )}
                  <PredictionChip level={prediction.level} />
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <Heart className={cn('w-5 h-5', stationFavorite && 'fill-destructive text-destructive')} />
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              {/* Station Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{station.name}</h1>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{station.address}</span>
                    </div>
                  </div>
                  <AIScoreBadge score={85} size="lg" />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="card-premium p-4 text-center">
                    <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{station.avg_rating?.toFixed(1) || '-'}</p>
                    <p className="text-xs text-muted-foreground">{station.review_count} {t('station.reviews')}</p>
                  </div>
                  <div className="card-premium p-4 text-center">
                    <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold">{station.max_power} kW</p>
                    <p className="text-xs text-muted-foreground">{t('explore.power')}</p>
                  </div>
                  <div className="card-premium p-4 text-center">
                    <Plug className="w-5 h-5 text-success mx-auto mb-1" />
                    <p className="text-xl font-bold">{availableChargers.length}/{station.chargers?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">{t('explore.available')}</p>
                  </div>
                  <div className="card-premium p-4 text-center">
                    <Coins className="w-5 h-5 text-warning mx-auto mb-1" />
                    <p className="text-xl font-bold">{station.min_price?.toLocaleString()}đ</p>
                    <p className="text-xs text-muted-foreground">{t('explore.price')}/kWh</p>
                  </div>
                </div>

                {/* Hours & Provider */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {station.hours_json?.is_24h
                        ? t('station.open24h')
                        : `${station.hours_json?.open} - ${station.hours_json?.close}`
                      }
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-secondary rounded-full text-sm">
                    {station.provider}
                  </span>
                </div>

                {/* Amenities */}
                {station.amenities_json && station.amenities_json.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">{t('station.amenities')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {station.amenities_json.map((amenity) => {
                        const Icon = amenityIcons[amenity] || CheckCircle2;
                        return (
                          <div
                            key={amenity}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-sm capitalize"
                          >
                            <Icon className="w-4 h-4 text-primary" />
                            {amenity}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Chargers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-semibold mb-4">{t('station.chargers')} ({station.chargers?.length || 0})</h3>
                <div className="grid gap-3">
                  {station.chargers?.map((charger) => {
                    const status = chargerStatusConfig[charger.status];
                    const StatusIcon = status.icon;
                    const isSelected = selectedCharger?.id === charger.id;

                    return (
                      <button
                        key={charger.id}
                        onClick={() => setSelectedCharger(isSelected ? null : charger)}
                        disabled={charger.status !== 'available'}
                        className={cn(
                          'card-premium p-4 text-left transition-all',
                          isSelected && 'border-primary',
                          charger.status !== 'available' && 'opacity-60'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              charger.status === 'available' ? 'bg-success/10' : 'bg-muted'
                            )}>
                              <Plug className={cn('w-5 h-5', status.className)} />
                            </div>
                            <div>
                              <p className="font-medium">{CONNECTOR_LABELS[charger.connector_type] || charger.connector_type}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{charger.power_kw} kW</span>
                                <span>•</span>
                                <span>{charger.price_per_kwh.toLocaleString()}đ/kWh</span>
                              </div>
                            </div>
                          </div>
                          <div className={cn('flex items-center gap-1.5 text-sm', status.className)}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ReviewSection
                  stationId={station.id}
                  stationName={station.name}
                />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <InsightsPanel
                station={station}
                planLevel={1}
                onUpgrade={() => { }}
              />

              <motion.div
                className="card-premium p-6 sticky top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-semibold mb-4 text-foreground">{t('station.bookCharging')}</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{availableChargers.length} {t('station.portsAvailable')}</p>
                        <p className="text-sm text-foreground/60">{t('station.from')} {station.min_price?.toLocaleString()}đ/kWh</p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/50">
                      {t('station.bookAdvice')}
                    </p>
                  </div>

                  <Button variant="hero" className="w-full" size="lg" asChild>
                    <Link to={`/booking/${station.id}`}>
                      <Calendar className="w-4 h-4" />
                      {t('station.bookNow')}
                    </Link>
                  </Button>

                  <p className="text-xs text-foreground/50 text-center">
                    {t('station.cancelPolicy')}
                  </p>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Navigation className="w-4 h-4" />
                    {t('station.directions')}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4" />
                    {t('station.contact')}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        stationId={station.id}
        stationName={station.name}
        stationAddress={station.address}
      />
    </div>
  );
}
