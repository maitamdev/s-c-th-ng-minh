// SCS GO Constants

export const CONNECTOR_TYPES = ['CCS2', 'Type2', 'CHAdeMO', 'GBT'] as const;

export const CONNECTOR_LABELS: Record<string, string> = {
  CCS2: 'CCS Combo 2',
  Type2: 'Type 2 (AC)',
  CHAdeMO: 'CHAdeMO',
  GBT: 'GB/T',
};

export const PROVIDERS = [
  'VinFast',
  'EVN',
  'Petrolimex',
  'GreenCharge',
  'EverCharge',
  'SolarCharge',
  'CityPower',
  'EcoStation',
];

export const AMENITIES = [
  'Nhà vệ sinh',
  'Quán cà phê',
  'WiFi miễn phí',
  'Bãi đỗ có mái che',
  'Cửa hàng tiện lợi',
  'Khu vui chơi trẻ em',
  'Phòng chờ máy lạnh',
  'ATM',
];

export const PLAN_CODES = {
  DRIVER_FREE: 'driver_free',
  DRIVER_PLUS: 'driver_plus',
  DRIVER_PRO: 'driver_pro',
  OPERATOR_FREE: 'operator_free',
  OPERATOR_BUSINESS: 'operator_business',
  OPERATOR_ENTERPRISE: 'operator_enterprise',
};

export const PLAN_LIMITS: Record<string, Record<string, number>> = {
  [PLAN_CODES.DRIVER_FREE]: {
    ai_calls_per_day: 20,
    max_bookings_per_month: 2,
    max_top_results: 3,
    max_favorites: 5,
    prediction_detail: 0, // 0 = basic, 1 = chart, 2 = advanced
  },
  [PLAN_CODES.DRIVER_PLUS]: {
    ai_calls_per_day: 200,
    max_bookings_per_month: 20,
    max_top_results: 10,
    max_favorites: -1, // unlimited
    prediction_detail: 1,
  },
  [PLAN_CODES.DRIVER_PRO]: {
    ai_calls_per_day: -1,
    max_bookings_per_month: -1,
    max_top_results: -1,
    max_favorites: -1,
    prediction_detail: 2,
  },
  [PLAN_CODES.OPERATOR_FREE]: {
    max_stations: 1,
    max_chargers: 4,
    analytics_access: 0,
  },
  [PLAN_CODES.OPERATOR_BUSINESS]: {
    max_stations: 10,
    max_chargers: 100,
    analytics_access: 1,
  },
  [PLAN_CODES.OPERATOR_ENTERPRISE]: {
    max_stations: -1,
    max_chargers: -1,
    analytics_access: 2,
  },
};

export const BOOKING_HOLD_MINUTES = 10;
export const BOOKING_CANCEL_BEFORE_MINUTES = 30;
export const DEFAULT_SLOT_DURATION = 30; // minutes
export const SLOT_DURATIONS = [30, 60]; // minutes

// Vietnam major cities coordinates for seed data
export const VIETNAM_CITIES = [
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  { name: 'TP. Hồ Chí Minh', lat: 10.8231, lng: 106.6297 },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022 },
  { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881 },
  { name: 'Cần Thơ', lat: 10.0452, lng: 105.7469 },
  { name: 'Nha Trang', lat: 12.2388, lng: 109.1967 },
  { name: 'Huế', lat: 16.4637, lng: 107.5909 },
  { name: 'Vũng Tàu', lat: 10.3460, lng: 107.0843 },
  { name: 'Biên Hòa', lat: 10.9574, lng: 106.8426 },
  { name: 'Bình Dương', lat: 10.9804, lng: 106.6519 },
];

// Peak hours for prediction
export const PEAK_HOURS = {
  morning: { start: 6, end: 9 },
  evening: { start: 17, end: 21 },
};

// Default map center (Hanoi)
export const DEFAULT_MAP_CENTER: [number, number] = [21.0285, 105.8542];
export const DEFAULT_MAP_ZOOM = 12;
