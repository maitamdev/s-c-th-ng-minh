import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
      const firebaseUserId = user.id;

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          station:stations(id, name, address, provider, image_url),
          charger:chargers(id, connector_type, power_kw, charger_number)
        `)
        .eq('user_id', firebaseUserId)
        .order('start_time', { ascending: false });

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
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
      toast.error('Please login to create booking');
      return { error: 'Not authenticated' };
    }

    try {
      // Use Firebase UID as user_id (stored as text in Supabase)
      const firebaseUserId = user.id;

      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert({
          station_id: bookingData.station_id,
          charger_id: bookingData.charger_id,
          start_time: bookingData.start_time,
          end_time: bookingData.end_time,
          total_price: bookingData.total_price || 0,
          services: bookingData.services || [],
          payment_method: bookingData.payment_method || 'card',
          notes: bookingData.notes || '',
          user_id: firebaseUserId,
          status: 'confirmed',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Booking insert error:', insertError);
        throw insertError;
      }

      // Update charger status
      await supabase
        .from('chargers')
        .update({ status: 'occupied' })
        .eq('id', bookingData.charger_id);

      await fetchBookings();

      // Success toast with booking details
      const startTime = new Date(bookingData.start_time).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });

      toast.success('🎉 Booking confirmed!', {
        description: `Your charging slot at ${startTime} is ready`,
        duration: 5000,
      });

      return { data, error: null };
    } catch (err) {
      console.error('Create booking error:', err);
      toast.error('Booking failed', {
        description: 'Please try again or contact support',
      });
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

// Hook to get all bookings for a specific station (for checking availability)
export function useStationBookings(stationId: string, chargerId?: string) {
  const [stationBookings, setStationBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStationBookings = useCallback(async () => {
    if (!supabase || !stationId) {
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('station_id', stationId)
        .in('status', ['confirmed', 'held'])
        .gte('end_time', new Date().toISOString());

      if (chargerId) {
        query = query.eq('charger_id', chargerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStationBookings(data || []);
    } catch (err) {
      console.error('Fetch station bookings error:', err);
    } finally {
      setLoading(false);
    }
  }, [stationId, chargerId]);

  useEffect(() => {
    fetchStationBookings();
  }, [fetchStationBookings]);

  // Check if a time slot is available
  const isTimeSlotAvailable = useCallback((startTime: Date, duration: number) => {
    const endTime = new Date(startTime.getTime() + duration * 60000);

    return !stationBookings.some(booking => {
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);

      // Check if there's any overlap
      return (startTime < bookingEnd && endTime > bookingStart);
    });
  }, [stationBookings]);

  return { stationBookings, loading, isTimeSlotAvailable, refetch: fetchStationBookings };
}
