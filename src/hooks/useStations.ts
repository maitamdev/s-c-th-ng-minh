import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Station, Charger } from '@/types';
import { fetchOCMStations, OCMStation } from '@/services/openChargeMapService';

interface ReviewData {
  id: string;
  station_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

interface StationData {
  id: string;
  chargers: Charger[];
  hours_open?: string;
  hours_close?: string;
  is_24h?: boolean;
  amenities?: string[];
  [key: string]: unknown;
}

export interface StationWithDetails extends Station {
  chargers: Charger[];
  avg_rating: number;
  review_count: number;
  min_price: number;
  max_power: number;
  available_chargers: number;
  image_url?: string;
  reviews?: ReviewData[];
  source?: 'supabase' | 'openchargeMap';
  distance_km?: number;
}

export function useStations() {
  const [stations, setStations] = useState<StationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch from both sources in parallel
      const [supabaseResult, ocmResult] = await Promise.allSettled([
        fetchSupabaseStations(),
        fetchOpenChargeMapStations(),
      ]);

      const supabaseStations = supabaseResult.status === 'fulfilled' ? supabaseResult.value : [];
      const ocmStations = ocmResult.status === 'fulfilled' ? ocmResult.value : [];

      if (supabaseResult.status === 'rejected') {
        console.warn('Supabase fetch failed:', supabaseResult.reason);
      }
      if (ocmResult.status === 'rejected') {
        console.warn('OpenChargeMap fetch failed:', ocmResult.reason);
      }

      // Merge stations - Supabase first, then OCM
      const allStations = [...supabaseStations, ...ocmStations];

      // Sort by distance if available
      allStations.sort((a, b) => {
        const distA = a.distance_km ?? 100;
        const distB = b.distance_km ?? 100;
        return distA - distB;
      });

      setStations(allStations);
      console.log(`✅ Loaded ${supabaseStations.length} Supabase + ${ocmStations.length} OCM stations`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return { stations, loading, error, refetch: fetchStations };
}

// Fetch from Supabase (operator-created stations)
async function fetchSupabaseStations(): Promise<StationWithDetails[]> {
  if (!supabase) {
    return [];
  }

  const { data: stationsData, error: stationsError } = await supabase
    .from('stations')
    .select(`
      *,
      chargers (*)
    `)
    .eq('status', 'approved');

  if (stationsError) throw stationsError;

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('station_id, rating');

  const stationsWithDetails: StationWithDetails[] = (stationsData || []).map((station: StationData) => {
    const chargers = station.chargers || [];
    const stationReviews = (reviewsData || []).filter((r: ReviewData) => r.station_id === station.id);

    const avgRating = stationReviews.length > 0
      ? stationReviews.reduce((sum: number, r: ReviewData) => sum + r.rating, 0) / stationReviews.length
      : 0;

    return {
      ...station,
      chargers,
      hours_json: {
        open: station.hours_open || '06:00',
        close: station.hours_close || '23:00',
        is_24h: station.is_24h || false,
      },
      amenities_json: station.amenities || [],
      avg_rating: Math.round(avgRating * 10) / 10,
      review_count: stationReviews.length,
      min_price: chargers.length > 0
        ? Math.min(...chargers.map((c: Charger) => c.price_per_kwh))
        : 0,
      max_power: chargers.length > 0
        ? Math.max(...chargers.map((c: Charger) => c.power_kw))
        : 0,
      available_chargers: chargers.filter((c: Charger) => c.status === 'available').length,
      source: 'supabase' as const,
    } as StationWithDetails;
  });

  return stationsWithDetails;
}

// Fetch from OpenChargeMap API
async function fetchOpenChargeMapStations(): Promise<StationWithDetails[]> {
  try {
    const ocmStations = await fetchOCMStations();

    // Convert OCM stations to our format
    return ocmStations.map((ocm: OCMStation): StationWithDetails => ({
      id: ocm.id,
      operator_id: 'ocm',
      name: ocm.name,
      address: ocm.address,
      lat: ocm.lat,
      lng: ocm.lng,
      provider: ocm.provider,
      status: ocm.status as 'pending' | 'approved' | 'rejected',
      created_at: new Date().toISOString(),
      hours_json: {
        open: ocm.hours.open,
        close: ocm.hours.close,
        is_24h: ocm.hours.is24h,
      },
      amenities_json: ocm.amenities,
      chargers: ocm.chargers.map((c) => ({
        id: c.id,
        station_id: c.stationId,
        connector_type: mapOCMConnectorType(c.connectorType),
        power_kw: c.powerKw,
        status: c.status as 'available' | 'occupied' | 'out_of_service',
        price_per_kwh: c.pricePerKwh,
      })),
      avg_rating: ocm.avgRating ?? 0,
      review_count: ocm.reviewCount,
      min_price: ocm.chargers.length > 0
        ? Math.min(...ocm.chargers.map((c) => c.pricePerKwh))
        : 0,
      max_power: ocm.chargers.length > 0
        ? Math.max(...ocm.chargers.map((c) => c.powerKw))
        : 0,
      available_chargers: ocm.chargers.filter((c) => c.status === 'available').length,
      source: 'openchargeMap' as const,
      distance_km: ocm.distanceKm,
    }));
  } catch (error) {
    console.error('Failed to fetch OpenChargeMap stations:', error);
    return [];
  }
}

// Map OCM connector types to our ConnectorType
function mapOCMConnectorType(ocmType: string): 'CCS2' | 'Type2' | 'CHAdeMO' | 'GBT' {
  const typeMap: Record<string, 'CCS2' | 'Type2' | 'CHAdeMO' | 'GBT'> = {
    'CCS2': 'CCS2',
    'CCS1': 'CCS2',
    'CHAdeMO': 'CHAdeMO',
    'Type2': 'Type2',
    'Type1': 'Type2',
    'Tesla': 'Type2',
    'GB/T AC': 'GBT',
    'GB/T DC': 'GBT',
  };
  return typeMap[ocmType] || 'Type2';
}

export function useStation(id: string) {
  const [station, setStation] = useState<StationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStation = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('stations')
        .select(`
          *,
          chargers (*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('station_id', id)
        .order('created_at', { ascending: false });

      const chargers = data.chargers || [];
      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum: number, r: ReviewData) => sum + r.rating, 0) / reviews.length
        : 0;

      setStation({
        ...data,
        chargers,
        hours_json: {
          open: data.hours_open || '06:00',
          close: data.hours_close || '23:00',
          is_24h: data.is_24h || false,
        },
        amenities_json: data.amenities || [],
        avg_rating: Math.round(avgRating * 10) / 10,
        review_count: reviews?.length || 0,
        min_price: chargers.length > 0
          ? Math.min(...chargers.map((c: Charger) => c.price_per_kwh))
          : 0,
        max_power: chargers.length > 0
          ? Math.max(...chargers.map((c: Charger) => c.power_kw))
          : 0,
        available_chargers: chargers.filter((c: Charger) => c.status === 'available').length,
        reviews,
      } as StationWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchStation();
  }, [id, fetchStation]);

  return { station, loading, error, refetch: fetchStation };
}
