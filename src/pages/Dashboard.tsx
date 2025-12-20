import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Zap,
  MapPin,
  Calendar,
  Heart,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';

// Mock data
const recentBookings = [
  { id: '1', station: 'VinFast Hà Nội 1', time: '14:00 - 15:00', date: 'Hôm nay', status: 'confirmed' },
  { id: '2', station: 'EVN Cầu Giấy', time: '10:00 - 11:00', date: 'Ngày mai', status: 'held' },
];

const stats = [
  { label: 'Lượt sạc tháng này', value: '12', icon: Zap, change: '+3' },
  { label: 'Trạm yêu thích', value: '5', icon: Heart },
  { label: 'AI gợi ý còn lại', value: '180/200', icon: Sparkles },
  { label: 'Booking còn lại', value: '18/20', icon: Calendar },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Xin chào, Nguyễn Văn A</h1>
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
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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

          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div 
                key={booking.id}
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{booking.station}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {booking.time} • {booking.date}
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
