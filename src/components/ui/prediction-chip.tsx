import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CrowdLevel } from '@/types';

interface PredictionChipProps {
  level: CrowdLevel;
  confidence?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const levelConfig: Record<CrowdLevel, { 
  label: string; 
  bgClass: string; 
  textClass: string;
  icon: React.ElementType;
}> = {
  low: {
    label: 'Ít đông',
    bgClass: 'bg-success/10 border-success/30',
    textClass: 'text-success',
    icon: TrendingDown,
  },
  medium: {
    label: 'Bình thường',
    bgClass: 'bg-warning/10 border-warning/30',
    textClass: 'text-warning',
    icon: Minus,
  },
  high: {
    label: 'Đông đúc',
    bgClass: 'bg-destructive/10 border-destructive/30',
    textClass: 'text-destructive',
    icon: TrendingUp,
  },
};

export function PredictionChip({ 
  level, 
  confidence, 
  showIcon = true,
  size = 'md',
  className 
}: PredictionChipProps) {
  const config = levelConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.bgClass,
        config.textClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      <span>{config.label}</span>
      {confidence !== undefined && (
        <span className="opacity-70">({confidence}%)</span>
      )}
    </div>
  );
}
