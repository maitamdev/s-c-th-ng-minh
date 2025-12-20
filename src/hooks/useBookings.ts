import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Booking {
  id: string;
  user_id: string;
  station_id: string;
  charger_id: string;
  start_time: string;
  end_time: string;
  status: 'held' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
  services: string[];
  payment_method: string;
  notes: string;
  created_at: string;
  station?: {
    id: string;
    name: string;
    address: string;
    provider: string;
    image_url: string;
  };
  charger?: {
    id: string;
    connector_type: string;
    power_kw: number;
    charger_number: number;
  };
}

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          station:stations(id, name, address, provider, image_url),
          charger:chargers(id, connector_type, power_kw, charger_number)
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, fetchBookings]);

  const createBooking = useCallback(async (bookingData: {
    station_id: string;
    charger_id: string;
    start_time: string;
    end_time: string;
    total_price?: number;
    services?: string[];
    payment_method?: string;
    notes?: string;
  }) => {
    if (!supabase || !user) {
      return { error: 'Not authenticated' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          user_id: user.id,
          status: 'confirmed',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      await supabase
        .from('chargers')
        .update({ status: 'occupied' })
        .eq('id', bookingData.charger_id);

      await fetchBookings();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [user, fetchBookings]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    if (!supabase) return { error: 'Supabase not configured' };

    try {
      const booking = bookings.find(b => b.id === bookingId);
      
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      if (booking) {
        await supabase
          .from('chargers')
          .update({ status: 'available' })
          .eq('id', booking.charger_id);
      }

      await fetchBookings();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, [bookings, fetchBookings]);

  return { bookings, loading, error, createBooking, cancelBooking, refetch: fetchBookings };
}
