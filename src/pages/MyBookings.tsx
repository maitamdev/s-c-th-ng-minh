import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useBookings } from '@/hooks/useBookings';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  MapPin,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BookingTab = 'upcoming' | 'past';

export default function MyBookings() {
  const [tab, setTab] = useState<BookingTab>('upcoming');
  const { bookings, loading, cancelBooking } = useBookings();
  const { toast } = useToast();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const now = new Date();
  
  const upcomingBookings = bookings.filter(
    b => (b.status === 'held' || b.status === 'confirmed') && new Date(b.start_time) >= now
  );
  
  const pastBookings = bookings.filter(
    b => b.status === 'completed' || b.status === 'cancelled' || new Date(b.end_time) < now
  );
  
  const displayBookings = tab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    const { error } = await cancelBooking(bookingId);
    
    if (error) {
      toast({
        title: 'Lỗi',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Đã hủy',
        description: 'Đặt chỗ đã được hủy thành công',
      });
    }
    setCancellingId(null);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
    return date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Đã xác nhận</span>;
      case 'held':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">Đang giữ</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">Hoàn thành</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">Đã hủy</span>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Lịch đặt chỗ</h1>
            <p className="text-foreground/60">Quản lý các lượt đặt chỗ sạc xe</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/explore">
              <Calendar className="w-4 h-4" />
              Đặt chỗ mới
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-secondary rounded-xl w-fit">
          <button
            onClick={() => setTab('upcoming')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === 'upcoming' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock className="w-4 h-4" />
            Sắp tới ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === 'past' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            Đã qua ({pastBookings.length})
          </button>
        </div>

        {/* Bookings list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {tab === 'upcoming' ? 'Chưa có lịch đặt chỗ' : 'Chưa có lịch sử'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {tab === 'upcoming' 
                ? 'Tìm trạm sạc và đặt chỗ ngay!' 
                : 'Các lượt sạc đã hoàn thành sẽ hiển thị ở đây'}
            </p>
            {tab === 'upcoming' && (
              <Button variant="hero" asChild>
                <Link to="/explore">Tìm trạm sạc</Link>
              </Button>
            )}
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {displayBookings.map((booking) => (
              <motion.div
                key={booking.id}
                className="card-premium p-4"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Station Image */}
                    <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                      {booking.station?.image_url ? (
                        <img 
                          src={booking.station.image_url} 
                          alt={booking.station.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {booking.station?.name || 'Trạm sạc'}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{booking.station?.address || 'Địa chỉ'}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{formatDate(booking.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                        </div>
                      </div>

                      {booking.charger && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Zap className="w-3.5 h-3.5" />
                          <span>
                            Cổng {booking.charger.charger_number} • {booking.charger.connector_type} • {booking.charger.power_kw}kW
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {(booking.status === 'confirmed' || booking.status === 'held') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {cancellingId === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Hủy
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
