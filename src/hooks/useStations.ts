import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Station, Charger } from '@/types';

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
}

export function useStations() {
  const [stations, setStations] = useState<StationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    try {
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
        } as StationWithDetails;
      });

      setStations(stationsWithDetails);
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
