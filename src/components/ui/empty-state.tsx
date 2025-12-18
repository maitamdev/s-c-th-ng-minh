import { cn } from '@/lib/utils';
import { SearchX, MapPin, Zap, Calendar } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon: Icon = SearchX, 
  title, 
  description,
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

export function NoStationsFound() {
  return (
    <EmptyState
      icon={MapPin}
      title="Không tìm thấy trạm sạc"
      description="Thử thay đổi bộ lọc hoặc mở rộng phạm vi tìm kiếm"
    />
  );
}

export function NoChargersAvailable() {
  return (
    <EmptyState
      icon={Zap}
      title="Không có cổng sạc trống"
      description="Tất cả cổng sạc đang được sử dụng. Hãy thử lại sau hoặc đặt trước."
    />
  );
}

export function NoBookings() {
  return (
    <EmptyState
      icon={Calendar}
      title="Chưa có lịch đặt chỗ"
      description="Bạn chưa đặt chỗ sạc nào. Khám phá các trạm sạc gần bạn ngay!"
    />
  );
}
