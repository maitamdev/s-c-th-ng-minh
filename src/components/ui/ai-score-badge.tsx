import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface AIScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function AIScoreBadge({ 
  score, 
  size = 'md', 
  showLabel = true,
  className 
}: AIScoreBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-1.5 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500/20 to-cyan-500/20 border-emerald-500/40 text-emerald-400';
    if (score >= 60) return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400';
    if (score >= 40) return 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400';
    return 'from-slate-500/20 to-slate-600/20 border-slate-500/40 text-slate-400';
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full border bg-gradient-to-r font-medium',
        sizeClasses[size],
        getScoreColor(score),
        className
      )}
    >
      <Sparkles className={iconSizes[size]} />
      {showLabel && <span>AI</span>}
      <span className="font-bold">{score}%</span>
    </div>
  );
}
