import { Booking, Station } from '@/types';
import { Button } from '@/components/ui/button';
import { CONNECTOR_LABELS, BOOKING_CANCEL_BEFORE_MINUTES } from '@/lib/constants';
import { 
  Calendar,
  Clock,
  MapPin,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface BookingCardProps {
  booking: Booking;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const statusConfig = {
  held: {
    label: 'Đang giữ chỗ',
    icon: Clock,
    className: 'text-warning bg-warning/10 border-warning/30',
  },
  confirmed: {
    label: 'Đã xác nhận',
    icon: CheckCircle2,
    className: 'text-success bg-success/10 border-success/30',
  },
  cancelled: {
    label: 'Đã hủy',
    icon: XCircle,
    className: 'text-destructive bg-destructive/10 border-destructive/30',
  },
  completed: {
    label: 'Hoàn thành',
    icon: CheckCircle2,
    className: 'text-primary bg-primary/10 border-primary/30',
  },
};

export function BookingCard({ booking, onCancel, onConfirm }: BookingCardProps) {
  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;
  
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);
  const now = new Date();
  
  const canCancel = 
    (booking.status === 'held' || booking.status === 'confirmed') &&
    (startTime.getTime() - now.getTime()) > BOOKING_CANCEL_BEFORE_MINUTES * 60 * 1000;
  
  const isExpired = 
    booking.status === 'held' && 
    booking.hold_expires_at && 
    new Date(booking.hold_expires_at) < now;

  return (
    <div className="card-premium p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link 
            to={`/station/${booking.station_id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            {booking.station?.name || 'Trạm sạc'}
          </Link>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {booking.station?.address || 'Địa chỉ'}
          </p>
        </div>
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-sm font-medium',
          status.className
        )}>
          <StatusIcon className="w-4 h-4" />
          {isExpired ? 'Hết hạn' : status.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{startTime.toLocaleDateString('vi-VN')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">
            {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            {' - '}
            {endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">
            {booking.charger && CONNECTOR_LABELS[booking.charger.connector_type]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-foreground font-medium text-primary">
            {booking.charger?.power_kw} kW
          </span>
        </div>
      </div>

      {/* Actions */}
      {(booking.status === 'held' || (booking.status === 'confirmed' && canCancel)) && (
        <div className="flex gap-2 pt-3 border-t border-border">
          {booking.status === 'held' && !isExpired && onConfirm && (
            <Button size="sm" className="flex-1" onClick={onConfirm}>
              <CheckCircle2 className="w-4 h-4" />
              Xác nhận
            </Button>
          )}
          {canCancel && onCancel && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-destructive hover:text-destructive"
              onClick={onCancel}
            >
              <XCircle className="w-4 h-4" />
              Hủy
            </Button>
          )}
        </div>
      )}

      {isExpired && (
        <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          Đặt chỗ đã hết hạn
        </div>
      )}
    </div>
  );
}
