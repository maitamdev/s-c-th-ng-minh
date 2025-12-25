import { useState } from 'react';
import { motion } from 'framer-motion';
import { OperatorLayout } from '@/components/layout/OperatorLayout';
import { useOperator } from '@/hooks/useOperator';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Calendar,
  DollarSign,
  Loader2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OperatorAnalytics() {
  const { t } = useLanguage();
  const { stations, bookings, revenue, stats, loading } = useOperator();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Calculate analytics
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const avgBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;
  
  // Group bookings by station
  const bookingsByStation = stations.map(station => ({
    station,
    bookings: bookings.filter(b => b.station_id === station.id).length,
    revenue: bookings
      .filter(b => b.station_id === station.id && b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0),
  })).sort((a, b) => b.revenue - a.revenue);

  // Group bookings by day of week
  const bookingsByDay = [0, 1, 2, 3, 4, 5, 6].map(day => {
    const dayBookings = bookings.filter(b => new Date(b.start_time).getDay() === day);
    return {
      day: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day],
      count: dayBookings.length,
    };
  });
  const maxDayBookings = Math.max(...bookingsByDay.map(d => d.count), 1);

  // Group bookings by hour
  const bookingsByHour = Array.from({ length: 24 }, (_, hour) => {
    const hourBookings = bookings.filter(b => new Date(b.start_time).getHours() === hour);
    return {
      hour: `${hour}:00`,
      count: hourBookings.length,
    };
  });
  const maxHourBookings = Math.max(...bookingsByHour.map(h => h.count), 1);

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('operator.analytics.title')}
            </h1>
            <p className="text-muted-foreground">{t('operator.analytics.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  period === p
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {p === '7d' ? '7 ngày' : p === '30d' ? '30 ngày' : '90 ngày'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-500">
                <ArrowUp className="w-3 h-3" />
                12%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {(totalRevenue / 1000000).toFixed(1)}M đ
            </p>
            <p className="text-sm text-muted-foreground">{t('operator.analytics.totalRevenue')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-500">
                <ArrowUp className="w-3 h-3" />
                8%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalBookings}</p>
            <p className="text-sm text-muted-foreground">{t('operator.analytics.totalBookings')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-500">
                <ArrowUp className="w-3 h-3" />
                15%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {new Set(bookings.map(b => b.user_id)).size}
            </p>
            <p className="text-sm text-muted-foreground">{t('operator.analytics.uniqueCustomers')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-premium p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {avgBookingValue.toLocaleString()}đ
            </p>
            <p className="text-sm text-muted-foreground">{t('operator.analytics.avgBookingValue')}</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bookings by Day of Week */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-premium p-6"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t('operator.analytics.bookingsByDay')}
            </h3>
            <div className="flex items-end justify-between gap-2 h-40">
              {bookingsByDay.map((day, idx) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30"
                    style={{ height: `${(day.count / maxDayBookings) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                  <span className="text-xs font-medium text-foreground">{day.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bookings by Hour */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-premium p-6"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {t('operator.analytics.bookingsByHour')}
            </h3>
            <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
              {bookingsByHour.map((hour, idx) => (
                <div key={hour.hour} className="flex flex-col items-center gap-1 min-w-[20px]">
                  <div
                    className="w-4 bg-cyan-500/30 rounded-t transition-all hover:bg-cyan-500/50"
                    style={{ height: `${(hour.count / maxHourBookings) * 100}%`, minHeight: '2px' }}
                  />
                  {idx % 4 === 0 && (
                    <span className="text-[10px] text-muted-foreground">{idx}h</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Stations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-6 lg:col-span-2"
          >
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {t('operator.analytics.topStations')}
            </h3>
            <div className="space-y-4">
              {bookingsByStation.slice(0, 5).map((item, idx) => (
                <div key={item.station.id} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{item.station.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.bookings} {t('operator.bookings')}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full"
                        style={{
                          width: `${(item.revenue / (bookingsByStation[0]?.revenue || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-foreground min-w-[100px] text-right">
                    {item.revenue.toLocaleString()}đ
                  </span>
                </div>
              ))}
              {bookingsByStation.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {t('operator.noData')}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </OperatorLayout>
  );
}
