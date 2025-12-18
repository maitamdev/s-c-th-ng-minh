import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { StationCard } from '@/components/stations/StationCard';
import { FiltersBar } from '@/components/stations/FiltersBar';
import { StationCardSkeleton } from '@/components/ui/skeleton';
import { NoStationsFound } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { enrichedStations } from '@/data/mockStations';
import { getTopRecommendations } from '@/ai/recommendation';
import { StationFilters, SortOption, Station, Vehicle, OptimizationMode } from '@/types';
import { 
  MapPin, 
  Locate, 
  Sparkles,
  Filter,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Default vehicle profile for demo
const defaultVehicle: Vehicle = {
  id: 'demo',
  user_id: 'demo',
  name: 'Demo Vehicle',
  battery_kwh: 82,
  soc_current: 35,
  consumption_kwh_per_100km: 18,
  preferred_connector: 'CCS2',
  updated_at: new Date().toISOString(),
};

export default function Explore() {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StationFilters>({
    connectors: [],
    minPower: null,
    maxDistance: null,
    priceRange: null,
    providers: [],
    openNow: false,
    availableNow: false,
  });
  const [sortBy, setSortBy] = useState<SortOption>('ai_recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [optimizationMode, setOptimizationMode] = useState<OptimizationMode>('balanced');

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          // Default to Hanoi
          setUserLocation({ lat: 21.0285, lng: 105.8542 });
          setLocationError('Không thể lấy vị trí. Đang sử dụng vị trí mặc định.');
          setLoading(false);
        }
      );
    } else {
      setUserLocation({ lat: 21.0285, lng: 105.8542 });
      setLoading(false);
    }
  }, []);

  // Calculate distance and AI scores
  const stationsWithData = useMemo(() => {
    if (!userLocation) return [];

    // Calculate distances
    const stationsWithDistance = enrichedStations.map((station) => {
      const R = 6371;
      const dLat = ((station.lat - userLocation.lat) * Math.PI) / 180;
      const dLng = ((station.lng - userLocation.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLocation.lat * Math.PI) / 180) *
          Math.cos((station.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return { ...station, distance_km: distance };
    });

    // Get AI recommendations
    const recommendations = getTopRecommendations({
      userLat: userLocation.lat,
      userLng: userLocation.lng,
      vehicle: defaultVehicle,
      mode: optimizationMode,
      stations: stationsWithDistance,
    }, 100);

    // Map AI scores to stations
    const stationScores = new Map(
      recommendations.map((r) => [r.station.id, { score: r.match_percent, reasons: r.reasons }])
    );

    return stationsWithDistance.map((station) => ({
      ...station,
      aiScore: stationScores.get(station.id)?.score,
      aiReasons: stationScores.get(station.id)?.reasons,
    }));
  }, [userLocation, optimizationMode]);

  // Filter and sort stations
  const filteredStations = useMemo(() => {
    let result = stationsWithData;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          s.provider.toLowerCase().includes(query)
      );
    }

    // Filters
    if (filters.connectors.length > 0) {
      result = result.filter((s) =>
        s.chargers?.some((c) => filters.connectors.includes(c.connector_type))
      );
    }

    if (filters.minPower) {
      result = result.filter((s) => (s.max_power || 0) >= filters.minPower!);
    }

    if (filters.maxDistance) {
      result = result.filter((s) => (s.distance_km || 100) <= filters.maxDistance!);
    }

    if (filters.openNow) {
      result = result.filter((s) => s.hours_json?.is_24h);
    }

    if (filters.availableNow) {
      result = result.filter((s) => (s.available_chargers || 0) > 0);
    }

    // Sort
    switch (sortBy) {
      case 'ai_recommended':
        result = [...result].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
        break;
      case 'distance':
        result = [...result].sort((a, b) => (a.distance_km || 100) - (b.distance_km || 100));
        break;
      case 'price':
        result = [...result].sort((a, b) => (a.min_price || 10000) - (b.min_price || 10000));
        break;
      case 'power':
        result = [...result].sort((a, b) => (b.max_power || 0) - (a.max_power || 0));
        break;
      case 'rating':
        result = [...result].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        break;
    }

    return result;
  }, [stationsWithData, filters, sortBy, searchQuery]);

  const optimizationModes: { value: OptimizationMode; label: string }[] = [
    { value: 'balanced', label: 'Cân bằng' },
    { value: 'fastest', label: 'Nhanh nhất' },
    { value: 'cheapest', label: 'Rẻ nhất' },
    { value: 'least_detour', label: 'Ít lệch' },
    { value: 'least_wait', label: 'Ít chờ' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Khám phá trạm sạc</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {userLocation 
                  ? `Đang hiển thị trạm gần bạn` 
                  : 'Đang lấy vị trí...'
                }
              </span>
              {locationError && (
                <span className="text-xs text-warning">{locationError}</span>
              )}
            </div>
          </div>

          {/* AI Optimization Mode */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Chế độ AI tối ưu</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {optimizationModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setOptimizationMode(mode.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                    optimizationMode === mode.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary border-border hover:border-primary/50'
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <FiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Results */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {loading ? 'Đang tải...' : `Tìm thấy ${filteredStations.length} trạm`}
              </p>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <StationCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredStations.length === 0 ? (
              <NoStationsFound />
            ) : (
              <motion.div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {filteredStations.slice(0, 30).map((station, i) => (
                  <motion.div
                    key={station.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <StationCard
                      station={station}
                      aiScore={station.aiScore}
                      aiReasons={station.aiReasons}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {filteredStations.length > 30 && (
              <div className="text-center mt-8">
                <Button variant="outline">
                  Xem thêm {filteredStations.length - 30} trạm
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
