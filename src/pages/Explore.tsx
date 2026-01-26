import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { StationCard } from '@/components/stations/StationCard';
import { FiltersBar } from '@/components/stations/FiltersBar';
import { AIRecommendationPanel } from '@/components/AIRecommendation';
import { StationCardSkeleton } from '@/components/ui/skeleton';
import { NoStationsFound } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { useStations } from '@/hooks/useStations';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTopRecommendations } from '@/ai/recommendation';
import { StationFilters, SortOption, Vehicle, OptimizationMode } from '@/types';
import { MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Explore() {
  const { stations, loading: stationsLoading } = useStations();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
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

  // Default vehicle for AI recommendations
  const defaultVehicle: Vehicle = user?.vehicle || {
    id: 'demo',
    user_id: 'demo',
    name: 'Demo Vehicle',
    battery_kwh: 82,
    soc_current: 35,
    consumption_kwh_per_100km: 18,
    preferred_connector: 'CCS2',
    updated_at: new Date().toISOString(),
  };

  // Get user location
  useEffect(() => {
    const getLocation = () => {
      if (!('geolocation' in navigator)) {
        setUserLocation({ lat: 21.0285, lng: 105.8542 });
        setLocationError('Trình duyệt không hỗ trợ định vị.');
        setLocationLoading(false);
        return;
      }

      const timeoutId = setTimeout(() => {
        setUserLocation({ lat: 21.0285, lng: 105.8542 });
        setLocationError('Lấy vị trí quá lâu.');
        setLocationLoading(false);
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
          setLocationLoading(false);
        },
        (error) => {
          clearTimeout(timeoutId);
          let errorMessage = 'Không thể lấy vị trí. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Bạn đã từ chối quyền truy cập.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Vị trí không khả dụng.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Hết thời gian.';
              break;
          }
          setUserLocation({ lat: 21.0285, lng: 105.8542 });
          setLocationError(errorMessage);
          setLocationLoading(false);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    };

    getLocation();
  }, []);

  // Calculate distance and AI scores
  const stationsWithData = useMemo(() => {
    if (!userLocation || stations.length === 0) return [];

    const stationsWithDistance = stations.map((station) => {
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

    const stationScores = new Map(
      recommendations.map((r) => [r.station.id, { score: r.match_percent, reasons: r.reasons }])
    );

    return stationsWithDistance.map((station) => ({
      ...station,
      aiScore: stationScores.get(station.id)?.score,
      aiReasons: stationScores.get(station.id)?.reasons,
    }));
  }, [userLocation, stations, optimizationMode, defaultVehicle]);

  // Filter and sort stations
  const filteredStations = useMemo(() => {
    let result = stationsWithData;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          s.provider.toLowerCase().includes(query)
      );
    }

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

  const loading = stationsLoading || locationLoading;

  const optimizationModes: { value: OptimizationMode; label: string }[] = [
    { value: 'balanced', label: t('explore.sortAI') },
    { value: 'fastest', label: t('explore.sortPower') },
    { value: 'cheapest', label: t('explore.sortPrice') },
    { value: 'least_detour', label: t('explore.sortDistance') },
    { value: 'least_wait', label: t('explore.available') },
  ];

  return (
    <div className="min-h-screen bg-background pb-mobile-nav">
      <Header />

      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('explore.title')}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {userLocation ? t('explore.subtitle') : t('common.loading')}
              </span>
              {locationError && (
                <span className="text-xs text-yellow-500">{locationError}</span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{t('explore.sortAI')}</span>
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {optimizationModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setOptimizationMode(mode.value)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-colors whitespace-nowrap flex-shrink-0',
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

          <FiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <div className="mt-6 flex flex-col lg:flex-row gap-6">
            {/* Mobile AI Panel - Show on top for mobile */}
            <div className="lg:hidden">
              <AIRecommendationPanel
                stations={stations}
                userLocation={userLocation}
                vehicle={defaultVehicle}
              />
            </div>

            {/* Main content - Station grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {loading ? t('common.loading') : `${filteredStations.length} ${t('landing.stats.stations')}`}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <StationCardSkeleton key={index} />
                  ))}
                </div>
              ) : filteredStations.length === 0 ? (
                <NoStationsFound />
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                  }}
                >
                  {filteredStations.slice(0, 30).map((station) => (
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
                    {t('common.viewAll')} {filteredStations.length - 30}
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar - AI Recommendation Panel (Desktop only) */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <AIRecommendationPanel
                  stations={stations}
                  userLocation={userLocation}
                  vehicle={defaultVehicle}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
