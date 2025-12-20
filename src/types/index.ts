// SCS GO Type Definitions

export type UserRole = 'user' | 'operator' | 'admin';
export type PlanAudience = 'driver' | 'operator';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
  address?: string | null;
  onboarding_completed?: boolean;
  subscription_plan?: 'free' | 'plus' | 'pro';
  subscription_start?: string;
  ai_calls_today?: number;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  battery_kwh: number;
  soc_current: number; // 0-100%
  consumption_kwh_per_100km: number;
  preferred_connector: ConnectorType;
  updated_at: string;
}

export type ConnectorType = 'CCS2' | 'Type2' | 'CHAdeMO' | 'GBT';
export type ChargerStatus = 'available' | 'occupied' | 'out_of_service';
export type StationStatus = 'pending' | 'approved' | 'rejected';
export type BookingStatus = 'held' | 'confirmed' | 'cancelled' | 'completed';

export interface Station {
  id: string;
  operator_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  provider: string;
  hours_json: StationHours;
  amenities_json: string[];
  status: StationStatus;
  created_at: string;
  // Computed fields
  chargers?: Charger[];
  photos?: StationPhoto[];
  avg_rating?: number;
  review_count?: number;
  distance_km?: number;
  min_price?: number;
  max_power?: number;
  available_chargers?: number;
}

export interface StationHours {
  open: string; // "06:00"
  close: string; // "23:00"
  is_24h: boolean;
}

export interface StationPhoto {
  id: string;
  station_id: string;
  url: string;
}

export interface Charger {
  id: string;
  station_id: string;
  connector_type: ConnectorType;
  power_kw: number;
  status: ChargerStatus;
  price_per_kwh: number;
}

export interface Booking {
  id: string;
  user_id: string;
  station_id: string;
  charger_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  hold_expires_at: string | null;
  created_at: string;
  // Relations
  station?: Station;
  charger?: Charger;
}

export interface Review {
  id: string;
  user_id: string;
  station_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Relations
  profile?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  station_id: string;
  created_at: string;
  station?: Station;
}

export interface Flag {
  id: string;
  user_id: string;
  target_type: 'station' | 'review' | 'user';
  target_id: string;
  reason: string;
  created_at: string;
}

// Monetization Types
export interface Plan {
  id: string;
  code: string;
  name: string;
  audience: PlanAudience;
  monthly_price_mock: number;
  description_json: PlanDescription;
}

export interface PlanDescription {
  tagline: string;
  features: string[];
  highlighted?: boolean;
}

export interface PlanLimit {
  id: string;
  plan_code: string;
  key: LimitKey;
  value: number;
}

export type LimitKey =
  | 'ai_calls_per_day'
  | 'max_bookings_per_month'
  | 'max_top_results'
  | 'max_favorites'
  | 'max_stations'
  | 'max_chargers'
  | 'prediction_detail'
  | 'analytics_access';

export interface Subscription {
  id: string;
  user_id: string;
  plan_code: string;
  status: 'active' | 'cancelled';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  plan?: Plan;
}

export interface UsageCounter {
  id: string;
  user_id: string;
  date: string;
  ai_calls_count: number;
}

export interface UsageMonthly {
  id: string;
  user_id: string;
  month: string; // "2024-01"
  bookings_count: number;
}

// AI Types
export type OptimizationMode = 'fastest' | 'cheapest' | 'balanced' | 'least_detour' | 'least_wait';

export interface AIRecommendation {
  station: Station;
  match_percent: number;
  reasons: AIReason[];
  travel_time_min: number;
  detour_km?: number;
}

export interface AIReason {
  icon: string;
  text: string;
  value?: string;
}

export type CrowdLevel = 'low' | 'medium' | 'high';

export interface HourlyPrediction {
  hour: number;
  level: CrowdLevel;
  confidence: number; // 0-100
  estimated_wait_min: number;
}

export interface GoldenHour {
  start: number;
  end: number;
  level: CrowdLevel;
}

// Filter Types
export interface StationFilters {
  connectors: ConnectorType[];
  minPower: number | null;
  maxDistance: number | null;
  priceRange: [number, number] | null;
  providers: string[];
  openNow: boolean;
  availableNow: boolean;
}

export type SortOption = 'ai_recommended' | 'distance' | 'price' | 'power' | 'rating';
