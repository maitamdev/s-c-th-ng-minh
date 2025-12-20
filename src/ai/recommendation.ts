import { Station, Vehicle, OptimizationMode, AIRecommendation, AIReason } from '@/types';

interface RecommendationParams {
  userLat: number;
  userLng: number;
  destination?: { lat: number; lng: number; name: string };
  vehicle: Vehicle;
  mode: OptimizationMode;
  stations: Station[];
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate travel time estimate (heuristic: 40km/h average in city)
function estimateTravelTime(distanceKm: number): number {
  return Math.round((distanceKm / 40) * 60); // minutes
}

// Calculate detour if destination is provided
function calculateDetour(
  userLat: number,
  userLng: number,
  stationLat: number,
  stationLng: number,
  destLat: number,
  destLng: number
): number {
  const directDistance = calculateDistance(userLat, userLng, destLat, destLng);
  const viaStationDistance =
    calculateDistance(userLat, userLng, stationLat, stationLng) +
    calculateDistance(stationLat, stationLng, destLat, destLng);
  return Math.max(0, viaStationDistance - directDistance);
}

// Score a station based on various factors
function scoreStation(
  station: Station,
  params: RecommendationParams
): { score: number; reasons: AIReason[]; travelTime: number; detour?: number } {
  const { userLat, userLng, destination, vehicle, mode } = params;
  
  const distance = calculateDistance(userLat, userLng, station.lat, station.lng);
  const travelTime = estimateTravelTime(distance);
  
  // Base scores (0-100)
  const distanceScore = Math.max(0, 100 - distance * 5); // -5 points per km
  const priceScore = station.min_price ? Math.max(0, 100 - (station.min_price - 3000) / 30) : 50;
  const powerScore = station.max_power ? Math.min(100, (station.max_power / 350) * 100) : 50;
  const availabilityScore = station.available_chargers 
    ? Math.min(100, (station.available_chargers / (station.chargers?.length || 1)) * 100)
    : 50;
  const ratingScore = station.avg_rating ? (station.avg_rating / 5) * 100 : 50;
  
  // Check connector compatibility
  const hasPreferredConnector = station.chargers?.some(
    (c) => c.connector_type === vehicle.preferred_connector && c.status === 'available'
  );
  const connectorBonus = hasPreferredConnector ? 20 : 0;
  
  // Calculate detour if destination provided
  let detour: number | undefined;
  let detourScore = 100;
  if (destination) {
    detour = calculateDetour(userLat, userLng, station.lat, station.lng, destination.lat, destination.lng);
    detourScore = Math.max(0, 100 - detour * 10); // -10 points per km detour
  }
  
  // Calculate range check
  const currentRangeKm = (vehicle.battery_kwh * (vehicle.soc_current / 100)) / (vehicle.consumption_kwh_per_100km / 100);
  const canReach = distance < currentRangeKm * 0.9; // 90% safety margin
  const rangeBonus = canReach ? 0 : -50;
  
  // Weight scores based on mode
  let weights: Record<string, number>;
  switch (mode) {
    case 'fastest':
      weights = { distance: 0.4, price: 0.1, power: 0.3, availability: 0.15, rating: 0.05 };
      break;
    case 'cheapest':
      weights = { distance: 0.2, price: 0.5, power: 0.1, availability: 0.15, rating: 0.05 };
      break;
    case 'least_detour':
      weights = { distance: 0.2, price: 0.1, power: 0.1, availability: 0.1, rating: 0.05, detour: 0.45 };
      break;
    case 'least_wait':
      weights = { distance: 0.2, price: 0.1, power: 0.2, availability: 0.45, rating: 0.05 };
      break;
    case 'balanced':
    default:
      weights = { distance: 0.25, price: 0.2, power: 0.2, availability: 0.25, rating: 0.1 };
  }
  
  // Calculate final score
  let finalScore =
    distanceScore * (weights.distance || 0) +
    priceScore * (weights.price || 0) +
    powerScore * (weights.power || 0) +
    availabilityScore * (weights.availability || 0) +
    ratingScore * (weights.rating || 0) +
    detourScore * (weights.detour || 0) +
    connectorBonus +
    rangeBonus;
  
  finalScore = Math.max(0, Math.min(100, finalScore));
  
  // Generate reasons
  const reasons: AIReason[] = [];
  
  if (distance < 3) {
    reasons.push({ icon: 'map-pin', text: 'Rất gần vị trí của bạn', value: `${distance.toFixed(1)} km` });
  } else if (distance < 10) {
    reasons.push({ icon: 'map-pin', text: 'Khoảng cách hợp lý', value: `${distance.toFixed(1)} km` });
  }
  
  if (station.min_price && station.min_price < 4000) {
    reasons.push({ icon: 'coins', text: 'Giá cạnh tranh', value: `${station.min_price.toLocaleString()}đ/kWh` });
  }
  
  if (station.max_power && station.max_power >= 150) {
    reasons.push({ icon: 'zap', text: 'Sạc siêu nhanh', value: `${station.max_power} kW` });
  } else if (station.max_power && station.max_power >= 100) {
    reasons.push({ icon: 'zap', text: 'Công suất cao', value: `${station.max_power} kW` });
  }
  
  if (availabilityScore >= 70) {
    reasons.push({ 
      icon: 'check-circle', 
      text: 'Nhiều cổng trống', 
      value: `${station.available_chargers}/${station.chargers?.length || 0}` 
    });
  }
  
  if (hasPreferredConnector) {
    reasons.push({ icon: 'plug', text: `Hỗ trợ ${vehicle.preferred_connector}` });
  }
  
  if (station.avg_rating && station.avg_rating >= 4.5) {
    reasons.push({ icon: 'star', text: 'Đánh giá xuất sắc', value: `${station.avg_rating.toFixed(1)}/5` });
  }
  
  if (detour !== undefined && detour < 2) {
    reasons.push({ icon: 'navigation', text: 'Ít lệch tuyến', value: `+${detour.toFixed(1)} km` });
  }
  
  // Take top 3 reasons
  const topReasons = reasons.slice(0, 3);
  
  return { score: Math.round(finalScore), reasons: topReasons, travelTime, detour };
}

export function getAIRecommendations(params: RecommendationParams): AIRecommendation[] {
  const scoredStations = params.stations
    .filter((station) => station.status === 'approved')
    .map((station) => {
      const { score, reasons, travelTime, detour } = scoreStation(station, params);
      return {
        station,
        match_percent: score,
        reasons,
        travel_time_min: travelTime,
        detour_km: detour,
      };
    })
    .sort((a, b) => b.match_percent - a.match_percent);
  
  return scoredStations;
}

export function getTopRecommendations(
  params: RecommendationParams,
  limit: number = 3
): AIRecommendation[] {
  return getAIRecommendations(params).slice(0, limit);
}
