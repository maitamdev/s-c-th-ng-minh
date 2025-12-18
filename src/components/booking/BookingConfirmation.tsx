import { motion } from 'framer-motion';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Zap,
  Calendar,
  Copy,
  Navigation,
  X,
} from 'lucide-react';
import { BOOKING_HOLD_MINUTES } from '@/lib/constants';

interface BookingConfirmationProps {
  booking: Partial<Booking>;
  stationName: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export function BookingConfirmation({
  booking,
  stationName,
  onConfirm,
  onCancel,
  onClose,
}: BookingConfirmationProps) {
  const holdExpiresAt = booking.hold_expires_at 
    ? new Date(booking.hold_expires_at) 
    : new Date(Date.now() + BOOKING_HOLD_MINUTES * 60 * 1000);
  
  const timeRemaining = Math.max(0, Math.floor((holdExpiresAt.getTime() - Date.now()) / 1000));
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <div className="card-premium p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Đã giữ chỗ thành công</h3>
              <p className="text-sm text-muted-foreground">Mã: {booking.id?.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Timer */}
        <div className="p-4 bg-warning/10 rounded-xl mb-6 text-center">
          <p className="text-sm text-foreground mb-2">Thời gian còn lại để xác nhận</p>
          <p className="text-3xl font-bold text-warning">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Booking Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Trạm sạc</p>
              <p className="font-medium text-foreground">{stationName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Thời gian</p>
              <p className="font-medium text-foreground">
                {booking.start_time && new Date(booking.start_time).toLocaleString('vi-VN', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="hero" className="w-full" size="lg" onClick={onConfirm}>
            <CheckCircle2 className="w-5 h-5" />
            Xác nhận đặt chỗ
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => {}}>
              <Navigation className="w-4 h-4" />
              Chỉ đường
            </Button>
            <Button variant="outline" onClick={() => {}}>
              <Copy className="w-4 h-4" />
              Sao chép mã
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full text-destructive hover:text-destructive"
            onClick={onCancel}
          >
            Hủy đặt chỗ
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
