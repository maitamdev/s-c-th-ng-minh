import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { InsightsPanel } from '@/components/stations/InsightsPanel';
import { PredictionChip } from '@/components/ui/prediction-chip';
import { AIScoreBadge } from '@/components/ui/ai-score-badge';
import { Button } from '@/components/ui/button';
import { StationDetailSkeleton } from '@/components/ui/skeleton';
import { enrichedStations, mockReviews } from '@/data/mockStations';
import { CONNECTOR_LABELS, AMENITIES } from '@/lib/constants';
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
  'Nhà vệ sinh': User,
  'Quán cà phê': Coffee,
  'WiFi miễn phí': Wifi,
  'Bãi đỗ có mái che': Car,
};

const chargerStatusConfig: Record<ChargerStatus, { icon: React.ElementType; label: string; className: string }> = {
  available: { icon: CheckCircle2, label: 'Sẵn sàng', className: 'text-success' },
  occupied: { icon: AlertCircle, label: 'Đang sử dụng', className: 'text-warning' },
  out_of_service: { icon: XCircle, label: 'Tạm ngưng', className: 'text-destructive' },
};

export default function StationDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const station = useMemo(() => {
    return enrichedStations.find((s) => s.id === id);
  }, [id]);

  const reviews = useMemo(() => {
    return mockReviews.filter((r) => r.station_id === id).slice(0, 5);
  }, [id]);

  if (!station) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 container mx-auto px-4">
          <StationDetailSkeleton />
        </main>
      </div>
    );
  }

  const prediction = getSimplePrediction(station);
  const availableChargers = station.chargers?.filter((c) => c.status === 'available') || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to="/explore">
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image */}
              <motion.div 
                className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-cyan-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-20 h-20 text-primary/30" />
                </div>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {station.hours_json?.is_24h && (
                    <span className="px-2.5 py-1 bg-success/90 text-success-foreground rounded-full text-sm font-medium">
                      24h
                    </span>
                  )}
                  <PredictionChip level={prediction.level} />
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <Heart className={cn('w-5 h-5', isFavorite && 'fill-destructive text-destructive')} />
                  </button>
                  <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
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
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{station.address}</span>
                      </div>
                    </div>
                  </div>
                  <AIScoreBadge score={85} size="lg" />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="card-premium p-4 text-center">
                    <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-xl font-bold">{station.avg_rating?.toFixed(1) || '-'}</p>
                    <p className="text-xs text-muted-foreground">{station.review_count} đánh giá</p>
                  </div>
                  <div className="card-premium p-4 text-center">
                    <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold">{station.max_power} kW</p>
                    <p className="text-xs text-muted-foreground">Công suất max</p>
                  </div>
                  <div className="card-premium p-4 text-center">
                    <Plug className="w-5 h-5 text-success mx-auto mb-1" />
                    <p className="text-xl font-bold">{availableChargers.length}/{station.chargers?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Cổng trống</p>
                  </div>
                  <div className="card-premium p-4 text-center">
                    <Coins className="w-5 h-5 text-warning mx-auto mb-1" />
                    <p className="text-xl font-bold">{station.min_price?.toLocaleString()}đ</p>
                    <p className="text-xs text-muted-foreground">Từ /kWh</p>
                  </div>
                </div>

                {/* Hours & Provider */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {station.hours_json?.is_24h 
                        ? 'Mở cửa 24/7' 
                        : `${station.hours_json?.open} - ${station.hours_json?.close}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 bg-secondary rounded-full">
                      {station.provider}
                    </span>
                  </div>
                </div>

                {/* Amenities */}
                {station.amenities_json && station.amenities_json.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Tiện ích</h3>
                    <div className="flex flex-wrap gap-2">
                      {station.amenities_json.map((amenity) => {
                        const Icon = amenityIcons[amenity] || CheckCircle2;
                        return (
                          <div 
                            key={amenity}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-sm"
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
                <h3 className="font-semibold mb-4">Cổng sạc ({station.chargers?.length || 0})</h3>
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

              {/* Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-semibold mb-4">Đánh giá gần đây</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="card-premium p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Người dùng</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i}
                              className={cn(
                                'w-4 h-4',
                                i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Insights */}
              <InsightsPanel 
                station={station} 
                planLevel={1}
                onUpgrade={() => {}}
              />

              {/* Booking Panel */}
              <motion.div 
                className="card-premium p-6 sticky top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-semibold mb-4 text-foreground">Đặt chỗ sạc</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{availableChargers.length} cổng trống</p>
                        <p className="text-sm text-foreground/60">Từ {station.min_price?.toLocaleString()}đ/kWh</p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/50">
                      Đặt chỗ trước để đảm bảo có cổng sạc khi bạn đến
                    </p>
                  </div>

                  <Button variant="hero" className="w-full" size="lg" asChild>
                    <Link to={`/booking/${station.id}`}>
                      <Calendar className="w-4 h-4" />
                      Đặt chỗ ngay
                    </Link>
                  </Button>

                  <p className="text-xs text-foreground/50 text-center">
                    Hủy miễn phí trước 30 phút • Giữ chỗ trong 10 phút
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/40">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Navigation className="w-4 h-4" />
                    Chỉ đường
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4" />
                    Liên hệ
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
