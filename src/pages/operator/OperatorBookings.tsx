import { useState } from 'react';
import { motion } from 'framer-motion';
import { OperatorLayout } from '@/components/layout/OperatorLayout';
import { Button } from '@/components/ui/button';
import { useOperator } from '@/hooks/useOperator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Phone,
  Zap,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'confirmed' | 'completed' | 'cancelled';

export default function OperatorBookings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { bookings, stations, loading, updateBookingStatus } = useOperator();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user?.phone?.includes(searchQuery) ||
      booking.id.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesStation = stationFilter === 'all' || booking.station_id === stationFilter;
    return matchesSearch && matchesStatus && matchesStation;
  });

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    const { error } = await updateBookingStatus(bookingId, newStatus);
    if (error) {
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
    } else {
      toast({ title: t('common.success'), description: t('operator.bookingUpdated') });
    }
    setUpdatingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <CheckCircle2 className="w-3 h-3" />
            {t('bookings.status.confirmed')}
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <CheckCircle2 className="w-3 h-3" />
            {t('bookings.status.completed')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            {t('bookings.status.cancelled')}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </OperatorLayout>
    );
  }

  return (
    <OperatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('operator.bookings.title')}
          </h1>
          <p className="text-muted-foreground">{t('operator.bookings.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-premium p-4">
            <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
            <p className="text-sm text-muted-foreground">{t('operator.totalBookings')}</p>
          </div>
          <div className="card-premium p-4">
            <p className="text-2xl font-bold text-success">
              {bookings.filter(b => b.status === 'confirmed').length}
            </p>
            <p className="text-sm text-muted-foreground">{t('bookings.status.confirmed')}</p>
          </div>
          <div className="card-premium p-4">
            <p className="text-2xl font-bold text-primary">
              {bookings.filter(b => b.status === 'completed').length}
            </p>
            <p className="text-sm text-muted-foreground">{t('bookings.status.completed')}</p>
          </div>
          <div className="card-premium p-4">
            <p className="text-2xl font-bold text-foreground">
              {bookings.reduce((sum, b) => sum + (b.total_price || 0), 0).toLocaleString()}đ
            </p>
            <p className="text-sm text-muted-foreground">{t('operator.totalRevenue')}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('operator.searchBookings')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="px-4 py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">{t('operator.allStations')}</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>{station.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap',
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {status === 'all' ? t('common.all') : t(`bookings.status.${status}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('operator.noBookings')}</h3>
            <p className="text-muted-foreground">{t('operator.noBookingsDesc')}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-premium overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-border bg-secondary/50">
                    <th className="p-4 font-medium">{t('operator.table.bookingId')}</th>
                    <th className="p-4 font-medium">{t('operator.table.customer')}</th>
                    <th className="p-4 font-medium">{t('operator.table.station')}</th>
                    <th className="p-4 font-medium">{t('operator.table.charger')}</th>
                    <th className="p-4 font-medium">{t('operator.table.time')}</th>
                    <th className="p-4 font-medium">{t('operator.table.amount')}</th>
                    <th className="p-4 font-medium">{t('operator.table.status')}</th>
                    <th className="p-4 font-medium">{t('operator.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm text-foreground">
                          #{booking.id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {booking.user?.full_name || 'Khách hàng'}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {booking.user?.phone || '---'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground">{booking.station?.name}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-foreground">
                            {booking.charger?.connector_type} • {booking.charger?.power_kw}kW
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="text-foreground">
                            {new Date(booking.start_time).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-muted-foreground">
                            {new Date(booking.start_time).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {new Date(booking.end_time).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-foreground">
                          {booking.total_price?.toLocaleString()}đ
                        </span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="p-4">
                        {booking.status === 'confirmed' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success hover:text-success hover:bg-success/10"
                              onClick={() => handleStatusChange(booking.id, 'completed')}
                              disabled={updatingId === booking.id}
                            >
                              {updatingId === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              disabled={updatingId === booking.id}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </OperatorLayout>
  );
}
