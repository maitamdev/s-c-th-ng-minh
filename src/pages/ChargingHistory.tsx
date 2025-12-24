import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useBookings } from '@/hooks/useBookings';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Zap,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Battery,
  Coins,
  Download,
  Filter,
  ChevronRight,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TimeFilter = 'week' | 'month' | 'year' | 'all';

export default function ChargingHistory() {
  const { bookings, loading } = useBookings();
  const { t, language } = useLanguage();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  // Filter completed bookings
  const completedBookings = useMemo(() => {
    const now = new Date();
    let filtered = bookings.filter(b => b.status === 'completed');

    switch (timeFilter) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(b => new Date(b.created_at) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filtered = filtered.filter(b => new Date(b.created_at) >= monthAgo);
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        filtered = filtered.filter(b => new Date(b.created_at) >= yearAgo);
        break;
    }

    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [bookings, timeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSessions = completedBookings.length;
    const totalEnergy = completedBookings.reduce((sum, b) => sum + (b.total_kwh || 0), 0);
    const totalCost = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
    const totalTime = completedBookings.reduce((sum, b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);

    const avgCostPerKwh = totalEnergy > 0 ? totalCost / totalEnergy : 0;
    const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;

    return {
      totalSessions,
      totalEnergy: totalEnergy.toFixed(1),
      totalCost,
      totalTime: Math.round(totalTime),
      avgCostPerKwh: Math.round(avgCostPerKwh),
      avgSessionTime: Math.round(avgSessionTime),
    };
  }, [completedBookings]);

  const timeFilters: { value: TimeFilter; label: string }[] = [
    { value: 'week', label: language === 'vi' ? '7 ngày' : '7 days' },
    { value: 'month', label: language === 'vi' ? '30 ngày' : '30 days' },
    { value: 'year', label: language === 'vi' ? '1 năm' : '1 year' },
    { value: 'all', label: language === 'vi' ? 'Tất cả' : 'All time' },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const mins = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hours}h ${remainMins}m`;
    }
    return `${mins}m`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {language === 'vi' ? 'Lịch sử sạc' : 'Charging History'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'vi' ? 'Theo dõi và phân tích hoạt động sạc xe' : 'Track and analyze your charging activity'}
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4" />
            {language === 'vi' ? 'Xuất báo cáo' : 'Export'}
          </Button>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-2">
            {timeFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimeFilter(filter.value)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                  timeFilter === filter.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary border-border hover:border-primary/50'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            className="card-premium p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' ? 'Lần sạc' : 'Sessions'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card-premium p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Battery className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalEnergy}</p>
                <p className="text-xs text-muted-foreground">kWh</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card-premium p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalCost.toLocaleString()}đ
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' ? 'Tổng chi phí' : 'Total cost'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card-premium p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.avgSessionTime}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' ? 'Phút TB/lần' : 'Avg min/session'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Insights */}
        <div className="card-premium p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">{language === 'vi' ? 'Thống kê' : 'Insights'}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
              <span className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Giá TB/kWh' : 'Avg price/kWh'}
              </span>
              <span className="font-semibold">{stats.avgCostPerKwh.toLocaleString()}đ</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
              <span className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Tổng thời gian sạc' : 'Total charging time'}
              </span>
              <span className="font-semibold">
                {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
              </span>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="card-premium p-6">
          <h3 className="font-semibold mb-4">
            {language === 'vi' ? 'Chi tiết lịch sử' : 'History Details'}
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : completedBookings.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                {language === 'vi' ? 'Chưa có lịch sử sạc' : 'No charging history'}
              </p>
              <Button variant="outline" asChild>
                <Link to="/explore">{t('dashboard.findStation')}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {completedBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {booking.station?.name || 'Trạm sạc'}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(booking.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {getDuration(booking.start_time, booking.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {(booking.total_kwh || 0).toFixed(1)} kWh
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(booking.total_price || 0).toLocaleString()}đ
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
