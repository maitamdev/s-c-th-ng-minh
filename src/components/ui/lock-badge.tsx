import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface LockBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function LockBadge({ 
  label = 'Pro', 
  size = 'sm',
  className 
}: LockBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-0.5',
    md: 'px-2 py-1 text-sm gap-1',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 font-medium',
        sizeClasses[size],
        className
      )}
    >
      <Lock className={iconSizes[size]} />
      <span>{label}</span>
    </div>
  );
}

interface LockedOverlayProps {
  planName?: string;
  onUpgrade?: () => void;
  className?: string;
}

export function LockedOverlay({ 
  planName = 'Plus',
  onUpgrade,
  className 
}: LockedOverlayProps) {
  return (
    <div 
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-10',
        className
      )}
    >
      <Lock className="w-8 h-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground mb-3">
        Nâng cấp lên <span className="font-semibold text-foreground">{planName}</span>
      </p>
      {onUpgrade && (
        <button 
          onClick={onUpgrade}
          className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Nâng cấp ngay
        </button>
      )}
    </div>
  );
}
