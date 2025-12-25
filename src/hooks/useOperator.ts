import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface OperatorStation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  provider: string;
  description: string;
  image_url: string;
  hours_open: string;
  hours_close: string;
  is_24h: boolean;
  amenities: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  chargers?: OperatorCharger[];
  stats?: {
    total_bookings: number;
    total_revenue: number;
    avg_rating: number;
  };
}

export interface OperatorCharger {
  id: string;
  station_id: string;
  connector_type: string;
  power_kw: number;
  price_per_kwh: number;
  status: 'available' | 'occupied' | 'out_of_service';
  charger_number: number;
}

export interface OperatorBooking {
  id: string;
  user_id: string;
  station_id: string;
  charger_id: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price: number;
  payment_method: string;
  created_at: string;
  user?: {
    full_name: string;
    phone: string;
    email: string;
  };
  charger?: OperatorCharger;
  station?: { name: string };
}

export interface RevenueData {
  date: string;
  total_bookings: number;
  total_revenue: number;
  total_kwh: number;
}

export interface OperatorPayout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bank_name: string;
  bank_account: string;
  payout_date: string;
  created_at: string;
}

export function useOperator() {
  const { user } = useAuth();
  const [stations, setStations] = useState<OperatorStation[]>([]);
  const [bookings, setBookings] = useState<OperatorBooking[]>([]);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [payouts, setPayouts] = useState<OperatorPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStations: 0,
    totalChargers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    avgRating: 0,
  });

  // Fetch operator's stations
  const fetchStations = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('stations')
      .select(`
        *,
        chargers (*)
      `)
      .eq('operator_id', user.uid)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setStations(data);
    }
  }, [user]);

  // Fetch bookings for operator's stations
  const fetchBookings = useCallback(async () => {
    if (!user || stations.length === 0) return;
    
    const stationIds = stations.map(s => s.id);
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        charger:chargers (*),
        station:stations (name)
      `)
      .in('station_id', stationIds)
      .order('start_time', { ascending: false })
      .limit(100);

    if (!error && data) {
      // Fetch user profiles for bookings
      const userIds = [...new Set(data.map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds);

      const bookingsWithUsers = data.map(booking => ({
        ...booking,
        user: profiles?.find(p => p.id === booking.user_id),
      }));

      setBookings(bookingsWithUsers);
    }
  }, [user, stations]);

  // Fetch revenue data
  const fetchRevenue = useCallback(async (days: number = 30) => {
    if (!user || stations.length === 0) return;
    
    const stationIds = stations.map(s => s.id);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('station_revenue')
      .select('*')
      .in('station_id', stationIds)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (!error && data) {
      // Aggregate by date
      const aggregated = data.reduce((acc: Record<string, RevenueData>, curr) => {
        if (!acc[curr.date]) {
          acc[curr.date] = {
            date: curr.date,
            total_bookings: 0,
            total_revenue: 0,
            total_kwh: 0,
          };
        }
        acc[curr.date].total_bookings += curr.total_bookings;
        acc[curr.date].total_revenue += curr.total_revenue;
        acc[curr.date].total_kwh += curr.total_kwh;
        return acc;
      }, {});

      setRevenue(Object.values(aggregated));
    }
  }, [user, stations]);

  // Fetch payouts
  const fetchPayouts = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('operator_payouts')
      .select('*')
      .eq('operator_id', user.uid)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPayouts(data);
    }
  }, [user]);

  // Calculate stats
  useEffect(() => {
    const totalChargers = stations.reduce((sum, s) => sum + (s.chargers?.length || 0), 0);
    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0);
    const pendingBookings = bookings.filter(b => 
      b.status === 'confirmed' && new Date(b.start_time) > new Date()
    ).length;

    setStats({
      totalStations: stations.length,
      totalChargers,
      totalBookings,
      totalRevenue,
      pendingBookings,
      avgRating: 4.5, // TODO: Calculate from reviews
    });
  }, [stations, bookings]);

  // Create new station
  const createStation = async (stationData: Partial<OperatorStation>) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('stations')
      .insert({
        ...stationData,
        operator_id: user.uid,
        status: 'pending',
      })
      .select()
      .single();

    if (!error) {
      await fetchStations();
    }

    return { data, error: error?.message };
  };

  // Update station
  const updateStation = async (stationId: string, updates: Partial<OperatorStation>) => {
    const { error } = await supabase
      .from('stations')
      .update(updates)
      .eq('id', stationId);

    if (!error) {
      await fetchStations();
    }

    return { error: error?.message };
  };

  // Delete station
  const deleteStation = async (stationId: string) => {
    const { error } = await supabase
      .from('stations')
      .delete()
      .eq('id', stationId);

    if (!error) {
      setStations(prev => prev.filter(s => s.id !== stationId));
    }

    return { error: error?.message };
  };

  // Create charger
  const createCharger = async (chargerData: Partial<OperatorCharger>) => {
    const { data, error } = await supabase
      .from('chargers')
      .insert(chargerData)
      .select()
      .single();

    if (!error) {
      await fetchStations();
    }

    return { data, error: error?.message };
  };

  // Update charger
  const updateCharger = async (chargerId: string, updates: Partial<OperatorCharger>) => {
    const { error } = await supabase
      .from('chargers')
      .update(updates)
      .eq('id', chargerId);

    if (!error) {
      await fetchStations();
    }

    return { error: error?.message };
  };

  // Delete charger
  const deleteCharger = async (chargerId: string) => {
    const { error } = await supabase
      .from('chargers')
      .delete()
      .eq('id', chargerId);

    if (!error) {
      await fetchStations();
    }

    return { error: error?.message };
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (!error) {
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status } : b
      ));
    }

    return { error: error?.message };
  };

  // Request payout
  const requestPayout = async (amount: number, bankName: string, bankAccount: string) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('operator_payouts')
      .insert({
        operator_id: user.uid,
        amount,
        bank_name: bankName,
        bank_account: bankAccount,
        status: 'pending',
      })
      .select()
      .single();

    if (!error) {
      await fetchPayouts();
    }

    return { data, error: error?.message };
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchStations().finally(() => setLoading(false));
    }
  }, [user, fetchStations]);

  // Fetch bookings when stations change
  useEffect(() => {
    if (stations.length > 0) {
      fetchBookings();
      fetchRevenue();
      fetchPayouts();
    }
  }, [stations, fetchBookings, fetchRevenue, fetchPayouts]);

  return {
    stations,
    bookings,
    revenue,
    payouts,
    stats,
    loading,
    createStation,
    updateStation,
    deleteStation,
    createCharger,
    updateCharger,
    deleteCharger,
    updateBookingStatus,
    requestPayout,
    refreshData: () => {
      fetchStations();
      fetchBookings();
      fetchRevenue();
      fetchPayouts();
    },
  };
}
