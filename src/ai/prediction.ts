import { HourlyPrediction, GoldenHour, CrowdLevel, Booking, Station } from '@/types';
import { PEAK_HOURS } from '@/lib/constants';

interface PredictionParams {
  station: Station;
  bookings?: Booking[];
  currentHour?: number;
}

// Get crowd level based on occupancy ratio
function getCrowdLevel(occupancyRatio: number): CrowdLevel {
  if (occupancyRatio < 0.4) return 'low';
  if (occupancyRatio < 0.7) return 'medium';
  return 'high';
}

// Get estimated wait time based on crowd level
function getEstimatedWait(level: CrowdLevel, totalChargers: number): number {
  const baseWait = {
    low: 0,
    medium: 10,
    high: 25,
  };
  
  // Adjust based on number of chargers
  const chargerFactor = Math.max(0.5, 1 - (totalChargers - 4) * 0.1);
  return Math.round(baseWait[level] * chargerFactor);
}

// Calculate base occupancy for an hour using rules + mock data
function calculateBaseOccupancy(hour: number, station: Station): number {
  let baseOccupancy = 0.3; // Base 30% occupancy
  
  // Morning peak (6-9)
  if (hour >= PEAK_HOURS.morning.start && hour <= PEAK_HOURS.morning.end) {
    baseOccupancy += 0.35;
    // Peak at 8am
    if (hour === 8) baseOccupancy += 0.1;
  }
  
  // Evening peak (17-21)
  if (hour >= PEAK_HOURS.evening.start && hour <= PEAK_HOURS.evening.end) {
    baseOccupancy += 0.4;
    // Peak at 18-19
    if (hour >= 18 && hour <= 19) baseOccupancy += 0.15;
  }
  
  // Lunch time slight increase
  if (hour >= 11 && hour <= 13) {
    baseOccupancy += 0.15;
  }
  
  // Night time low (22-6)
  if (hour >= 22 || hour < 6) {
    baseOccupancy -= 0.2;
  }
  
  // Weekend adjustment (simulate slightly different pattern)
  const isWeekend = new Date().getDay() % 6 === 0;
  if (isWeekend) {
    // Later morning peak on weekends
    if (hour >= 9 && hour <= 11) baseOccupancy += 0.2;
    // Less evening peak
    if (hour >= 17 && hour <= 21) baseOccupancy -= 0.1;
  }
  
  // Station-specific adjustments
  const totalChargers = station.chargers?.length || 4;
  if (totalChargers < 4) baseOccupancy += 0.15; // Smaller stations fill up faster
  if (totalChargers > 8) baseOccupancy -= 0.1; // Larger stations have more capacity
  
  // Provider popularity factor (mock)
  if (station.provider === 'VinFast') baseOccupancy += 0.1;
  
  // Add some randomness for realism
  baseOccupancy += (Math.random() - 0.5) * 0.1;
  
  return Math.max(0, Math.min(1, baseOccupancy));
}

// Calculate confidence based on data quality
function calculateConfidence(hour: number, hasBookingData: boolean): number {
  let confidence = 70; // Base confidence
  
  // Higher confidence for immediate hours
  const currentHour = new Date().getHours();
  const hoursDiff = Math.abs(hour - currentHour);
  if (hoursDiff <= 2) confidence += 15;
  else if (hoursDiff <= 6) confidence += 5;
  else confidence -= 10;
  
  // Boost if we have booking data
  if (hasBookingData) confidence += 10;
  
  // Add slight randomness
  confidence += (Math.random() - 0.5) * 10;
  
  return Math.round(Math.max(50, Math.min(95, confidence)));
}

export function getHourlyPredictions(params: PredictionParams): HourlyPrediction[] {
  const { station, bookings = [] } = params;
  const predictions: HourlyPrediction[] = [];
  const totalChargers = station.chargers?.length || 4;
  
  for (let hour = 0; hour < 24; hour++) {
    const occupancy = calculateBaseOccupancy(hour, station);
    const level = getCrowdLevel(occupancy);
    const confidence = calculateConfidence(hour, bookings.length > 0);
    const estimatedWait = getEstimatedWait(level, totalChargers);
    
    predictions.push({
      hour,
      level,
      confidence,
      estimated_wait_min: estimatedWait,
    });
  }
  
  return predictions;
}

export function getGoldenHours(predictions: HourlyPrediction[]): GoldenHour[] {
  const goldenHours: GoldenHour[] = [];
  let currentGolden: GoldenHour | null = null;
  
  predictions.forEach((pred, index) => {
    if (pred.level === 'low') {
      if (!currentGolden) {
        currentGolden = { start: pred.hour, end: pred.hour, level: 'low' };
      } else {
        currentGolden.end = pred.hour;
      }
    } else {
      if (currentGolden) {
        // Only add if span is at least 1 hour
        if (currentGolden.end - currentGolden.start >= 0) {
          goldenHours.push(currentGolden);
        }
        currentGolden = null;
      }
    }
  });
  
  // Handle wrap-around case
  if (currentGolden) {
    goldenHours.push(currentGolden);
  }
  
  // Sort by start hour and return top 3
  return goldenHours.slice(0, 3);
}

export function getCurrentPrediction(predictions: HourlyPrediction[]): HourlyPrediction {
  const currentHour = new Date().getHours();
  return predictions.find((p) => p.hour === currentHour) || predictions[0];
}

// Get simple prediction label for free tier
export function getSimplePrediction(station: Station): { level: CrowdLevel; label: string } {
  const predictions = getHourlyPredictions({ station });
  const current = getCurrentPrediction(predictions);
  
  const labels: Record<CrowdLevel, string> = {
    low: 'Ít đông',
    medium: 'Bình thường',
    high: 'Đông đúc',
  };
  
  return {
    level: current.level,
    label: labels[current.level],
  };
}
