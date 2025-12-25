import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { OperatorLayout } from '@/components/layout/OperatorLayout';
import { Button } from '@/components/ui/button';
import { useOperator } from '@/hooks/useOperator';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  MapPin,
  Zap,
  Calendar,
  TrendingUp,
  DollarSign,
  Star,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OperatorDashboard() {
  const { t } = useLanguage();
  const { stations, bookings, stats, loading } = useOperator();

  const statCards = [
    {
      icon: MapPin,
      label: t('operator.stats.stations'),
      value: stats.totalStations,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Zap,
      label: t('operator.stats.chargers'),
      value: stats.totalChargers,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Calendar,
      label: t('operator.stats.bookings'),
      value: stats.totalBookings,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: DollarSign,
      label: t('operator.stats.revenue'),
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  const recentBookings = bookings.slice(0, 5);
  const pendingBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.start_time) > new Date()
  ).slice(0, 5);

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
              {t('operator.dashboard.title')}
            </h1>
            <p className="text-muted-foreground">{t('operator.dashboard.subtitle')}</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/operator/stations/new">
              <Plus className="w-4 h-4" />
              {t('operator.addStation')}
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card-premium p-5"
            >
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3', stat.bgColor)}>
                <stat.icon className={cn('w-6 h-6', stat.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        {stations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {t('operator.noStations.title')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('operator.noStations.desc')}
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/operator/stations/new">
                <Plus className="w-5 h-5" />
                {t('operator.addFirstStation')}
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Main Content Grid */}
        {stations.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pending Bookings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-premium"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <h3 className="font-semibold text-foreground">{t('operator.pendingBookings')}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                  {stats.pendingBookings}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {pendingBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('operator.noPendingBookings')}</p>
                  </div>
                ) : (
                  pendingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {booking.user?.full_name || 'Khách hàng'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(booking.start_time).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {booking.total_price?.toLocaleString()}đ
                      </span>
                    </div>
                  ))
                )}
                {pendingBookings.length > 0 && (
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/operator/bookings">
                      {t('common.viewAll')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>

            {/* My Stations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-premium"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{t('operator.myStations')}</h3>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/operator/stations">
                    {t('common.viewAll')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="p-4 space-y-3">
                {stations.slice(0, 3).map((station) => (
                  <Link
                    key={station.id}
                    to={`/operator/stations/${station.id}`}
                    className="flex items-center gap-4 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 overflow-hidden flex-shrink-0">
                      {station.image_url ? (
                        <img src={station.image_url} alt={station.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground truncate">{station.name}</h4>
                        {station.status === 'approved' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-success/10 text-success">
                            {t('operator.status.approved')}
                          </span>
                        ) : station.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-warning/10 text-warning">
                            {t('operator.status.pending')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">
                            {t('operator.status.rejected')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{station.address}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {station.chargers?.length || 0} {t('operator.chargers')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          4.5
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-premium lg:col-span-2"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{t('operator.recentActivity')}</h3>
                </div>
              </div>
              <div className="p-4">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('operator.noRecentActivity')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border">
                          <th className="pb-3 font-medium">{t('operator.table.customer')}</th>
                          <th className="pb-3 font-medium">{t('operator.table.station')}</th>
                          <th className="pb-3 font-medium">{t('operator.table.time')}</th>
                          <th className="pb-3 font-medium">{t('operator.table.amount')}</th>
                          <th className="pb-3 font-medium">{t('operator.table.status')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {recentBookings.map((booking) => (
                          <tr key={booking.id} className="text-sm">
                            <td className="py-3">
                              <p className="font-medium text-foreground">
                                {booking.user?.full_name || 'Khách hàng'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {booking.user?.phone || '---'}
                              </p>
                            </td>
                            <td className="py-3 text-foreground">{booking.station?.name}</td>
                            <td className="py-3 text-muted-foreground">
                              {new Date(booking.start_time).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3 font-medium text-foreground">
                              {booking.total_price?.toLocaleString()}đ
                            </td>
                            <td className="py-3">
                              {booking.status === 'confirmed' && (
                                <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                                  {t('bookings.status.confirmed')}
                                </span>
                              )}
                              {booking.status === 'completed' && (
                                <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                                  {t('bookings.status.completed')}
                                </span>
                              )}
                              {booking.status === 'cancelled' && (
                                <span className="px-2 py-1 rounded-full text-xs bg-destructive/10 text-destructive">
                                  {t('bookings.status.cancelled')}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </OperatorLayout>
  );
}
