import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Station, Charger } from '@/types';

export interface StationWithDetails extends Station {
  chargers: Charger[];
  avg_rating: number;
  review_count: number;
  min_price: number;
  max_power: number;
  available_chargers: number;
  image_url?: string;
  reviews?: any[];
}

export function useStations() {
  const [stations, setStations] = useState<StationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    if (!supabase) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    try {
      // Fetch stations with chargers
      const { data: stationsData, error: stationsError } = await supabase
        .from('stations')
        .select(`
          *,
          chargers (*)
        `)
        .eq('status', 'approved');

      if (stationsError) throw stationsError;

      // Fetch reviews for ratings
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('station_id, rating');

      // Calculate aggregates
      const stationsWithDetails: StationWithDetails[] = (stationsData || []).map((station: any) => {
        const chargers = station.chargers || [];
        const stationReviews = (reviewsData || []).filter((r: any) => r.station_id === station.id);
        
        const avgRating = stationReviews.length > 0
          ? stationReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / stationReviews.length
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
        };
      });

      setStations(stationsWithDetails);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { stations, loading, error, refetch: fetchStations };
}

export function useStation(id: string) {
  const [station, setStation] = useState<StationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchStation();
  }, [id]);

  const fetchStation = async () => {
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

      // Fetch reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*, profiles(full_name, avatar_url)')
        .eq('station_id', id)
        .order('created_at', { ascending: false });

      const chargers = data.chargers || [];
      const avgRating = reviews && reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
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
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { station, loading, error, refetch: fetchStation };
}
