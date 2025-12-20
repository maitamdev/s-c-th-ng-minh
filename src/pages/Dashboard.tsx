import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useFavorites } from '@/hooks/useFavorites';
import { 
  Zap,
  MapPin,
  Calendar,
  Heart,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  Loader2,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { favorites, loading: favoritesLoading } = useFavorites();

  // Filter upcoming bookings
  const upcomingBookings = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'held')
    .filter(b => new Date(b.start_time) >= new Date())
    .slice(0, 3);

  // Calculate stats
  const thisMonthBookings = bookings.filter(b => {
    const bookingDate = new Date(b.created_at);
    const now = new Date();
    return bookingDate.getMonth() === now.getMonth() && 
           bookingDate.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: 'Lượt sạc tháng này', value: thisMonthBookings.toString(), icon: Zap, change: null },
    { label: 'Trạm yêu thích', value: favorites.length.toString(), icon: Heart, change: null },
    { label: 'AI gợi ý còn lại', value: '180/200', icon: Sparkles, change: null },
    { label: 'Booking còn lại', value: `${20 - bookings.filter(b => b.status === 'confirmed').length}/20`, icon: Calendar, change: null },
  ];

  const formatBookingTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatBookingDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const loading = bookingsLoading || favoritesLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Xin chào, {user?.profile?.full_name || 'Bạn'}
            </h1>
            <p className="text-muted-foreground">Quản lý hoạt động sạc xe của bạn</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/explore">
              <MapPin className="w-4 h-4" />
              Tìm trạm sạc
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="card-premium p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  )}
                  <p className="text-xs text-foreground/60">{stat.label}</p>
                </div>
              </div>
              {stat.change && (
                <div className="mt-2 flex items-center gap-1 text-success text-sm">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change} so với tháng trước
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Recent Bookings */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Lịch đặt chỗ sắp tới</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/bookings">
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Chưa có lịch đặt chỗ nào</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/explore">Tìm trạm sạc</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {booking.station?.name || 'Trạm sạc'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {formatBookingTime(booking.start_time, booking.end_time)} • {formatBookingDate(booking.start_time)}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Đang giữ'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/explore" className="card-premium p-6 group">
            <MapPin className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Tìm trạm sạc</h3>
            <p className="text-sm text-foreground/70">Khám phá trạm sạc gần bạn</p>
            <ArrowRight className="w-5 h-5 text-primary mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link to="/dashboard/vehicle" className="card-premium p-6 group">
            <Zap className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Cập nhật xe</h3>
            <p className="text-sm text-foreground/70">Thêm hoặc chỉnh sửa thông tin xe</p>
            <ArrowRight className="w-5 h-5 text-primary mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link to="/pricing" className="card-premium p-6 group">
            <Sparkles className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nâng cấp gói</h3>
            <p className="text-sm text-foreground/70">Mở khóa thêm tính năng AI</p>
            <ArrowRight className="w-5 h-5 text-primary mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
