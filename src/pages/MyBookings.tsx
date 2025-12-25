import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useBookings, Booking } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { sendBookingCancelledEmail } from '@/lib/email';
import { 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  MapPin,
  Loader2,
  X,
  Navigation,
  QrCode,
  CreditCard,
  Phone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BookingTab = 'upcoming' | 'past';

export default function MyBookings() {
  const [tab, setTab] = useState<BookingTab>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { bookings, loading, cancelBooking } = useBookings();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
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
    const bookingToCancel = bookings.find(b => b.id === bookingId);
    const { error } = await cancelBooking(bookingId);
    
    if (error) {
      toast({
        title: t('common.error'),
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('common.success'),
        description: t('bookings.cancelSuccess'),
      });
      setSelectedBooking(null);
      
      // Send cancellation email
      if (user?.email && bookingToCancel) {
        sendBookingCancelledEmail({
          userEmail: user.email,
          userName: user.profile?.full_name || 'Khách hàng',
          stationName: bookingToCancel.station?.name || 'Trạm sạc',
          stationAddress: bookingToCancel.station?.address || '',
          chargerName: bookingToCancel.charger ? `${bookingToCancel.charger.connector_type} - ${bookingToCancel.charger.power_kw}kW` : '',
          bookingDate: new Date(bookingToCancel.start_time).toLocaleDateString('vi-VN'),
          bookingTime: new Date(bookingToCancel.start_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          duration: Math.round((new Date(bookingToCancel.end_time).getTime() - new Date(bookingToCancel.start_time).getTime()) / 60000),
          totalAmount: bookingToCancel.total_price,
          bookingCode: bookingToCancel.id.slice(-8).toUpperCase(),
        });
      }
    }
    setCancellingId(null);
  };

  const openNavigation = (address: string) => {
    const destination = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank');
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

    if (date.toDateString() === today.toDateString()) return t('booking.today');
    if (date.toDateString() === tomorrow.toDateString()) return t('booking.tomorrow');
    return date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status: string, endTime?: string) => {
    // Check if booking is expired (past end time but not cancelled/completed)
    if (endTime && (status === 'confirmed' || status === 'held') && new Date(endTime) < now) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">{t('bookings.status.expired')}</span>;
    }
    
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">{t('bookings.status.confirmed')}</span>;
      case 'held':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">{t('bookings.status.confirmed')}</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{t('bookings.status.completed')}</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">{t('bookings.status.cancelled')}</span>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('bookings.title')}</h1>
            <p className="text-foreground/60">{t('bookings.subtitle')}</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/explore">
              <Calendar className="w-4 h-4" />
              {t('station.bookNow')}
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
            {t('bookings.upcoming')} ({upcomingBookings.length})
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
            {t('bookings.past')} ({pastBookings.length})
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
            <h3 className="text-lg font-semibold mb-2">{t('bookings.noBookings')}</h3>
            <p className="text-muted-foreground mb-4">{t('bookings.noBookingsDesc')}</p>
            {tab === 'upcoming' && (
              <Button variant="hero" asChild>
                <Link to="/explore">{t('dashboard.findStation')}</Link>
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
              <motion.button
                key={booking.id}
                className="card-premium p-4 w-full text-left hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                      {booking.station?.image_url ? (
                        <img src={booking.station.image_url} alt={booking.station.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{booking.station?.name || 'Trạm sạc'}</h3>
                        {getStatusBadge(booking.status, booking.end_time)}
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
                          <span>Cổng {booking.charger.charger_number} • {booking.charger.connector_type} • {booking.charger.power_kw}kW</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {(booking.status === 'confirmed' || booking.status === 'held') && (
                    <span className="text-xs text-primary">{t('bookings.viewDetails')} →</span>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />
            
            {/* Modal */}
            <motion.div
              className="relative bg-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border/40 p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{t('bookings.viewDetails')}</h2>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* QR Code */}
                <div className="text-center p-6 bg-white rounded-2xl">
                  <div className="w-40 h-40 mx-auto bg-secondary rounded-xl flex items-center justify-center mb-3">
                    <QrCode className="w-24 h-24 text-foreground" />
                  </div>
                  <p className="text-xl font-mono font-bold text-foreground">
                    SCS{selectedBooking.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-foreground/60 mt-1">{t('booking.success.scanQR')}</p>
                </div>

                {/* Station Info */}
                <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {selectedBooking.station?.image_url ? (
                      <img src={selectedBooking.station.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Zap className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{selectedBooking.station?.name}</h3>
                    <p className="text-sm text-foreground/60 truncate">{selectedBooking.station?.address}</p>
                    <p className="text-sm text-primary">{selectedBooking.station?.provider}</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="text-sm text-foreground/60">{t('booking.confirm.time')}</p>
                    </div>
                    <p className="font-semibold text-foreground">{formatFullDate(selectedBooking.start_time)}</p>
                    <p className="text-sm text-primary">
                      {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <p className="text-sm text-foreground/60">{t('booking.confirm.charger')}</p>
                    </div>
                    <p className="font-semibold text-foreground">{selectedBooking.charger?.connector_type}</p>
                    <p className="text-sm text-primary">{selectedBooking.charger?.power_kw} kW</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <p className="text-sm text-foreground/60">{t('booking.total')}</p>
                    </div>
                    <p className="font-semibold text-foreground text-lg">{selectedBooking.total_price?.toLocaleString() || 0}đ</p>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <p className="text-sm text-foreground/60">{t('bookings.status.confirmed')}</p>
                    </div>
                    {getStatusBadge(selectedBooking.status, selectedBooking.end_time)}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl">
                  <p className="font-semibold text-foreground">{t('booking.success.paid')}</p>
                  <p className="text-2xl font-bold text-primary">{selectedBooking.total_price?.toLocaleString() || 0}đ</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    onClick={() => openNavigation(selectedBooking.station?.address || '')}
                  >
                    <Navigation className="w-4 h-4" />
                    {t('station.directions')}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="w-4 h-4" />
                    {t('station.contact')}
                  </Button>
                </div>

                {/* Cancel button */}
                {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'held') && (
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleCancel(selectedBooking.id)}
                    disabled={cancellingId === selectedBooking.id}
                  >
                    {cancellingId === selectedBooking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        {t('bookings.cancelBooking')}
                      </>
                    )}
                  </Button>
                )}

                {/* Tips */}
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                  <p className="text-sm text-foreground">
                    <strong>{t('booking.success.note')}</strong> {t('booking.success.noteText')}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
