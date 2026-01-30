import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-7 h-7',
};

const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1',
    xl: 'gap-1.5',
};

export function RatingStars({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onChange,
    showValue = false,
    className,
}: RatingStarsProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

    const handleClick = (value: number) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    return (
        <div className={cn('flex items-center', gapClasses[size], className)}>
            {Array.from({ length: maxRating }, (_, index) => {
                const value = index + 1;
                const isFilled = value <= displayRating;
                const isHalf = !isFilled && value - 0.5 <= displayRating;

                return (
                    <motion.button
                        key={index}
                        type="button"
                        onClick={() => handleClick(value)}
                        onMouseEnter={() => handleMouseEnter(value)}
                        onMouseLeave={handleMouseLeave}
                        disabled={!interactive}
                        whileHover={interactive ? { scale: 1.15 } : undefined}
                        whileTap={interactive ? { scale: 0.95 } : undefined}
                        className={cn(
                            'relative transition-colors focus:outline-none',
                            interactive && 'cursor-pointer'
                        )}
                    >
                        {/* Background star */}
                        <Star
                            className={cn(
                                sizeClasses[size],
                                'text-muted-foreground/30'
                            )}
                            fill="currentColor"
                        />

                        {/* Filled star overlay */}
                        <motion.div
                            className="absolute inset-0 overflow-hidden"
                            initial={false}
                            animate={{
                                width: isFilled ? '100%' : isHalf ? '50%' : '0%'
                            }}
                            transition={{ duration: 0.15 }}
                        >
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    'text-amber-400 drop-shadow-sm',
                                    interactive && hoverRating > 0 && 'text-amber-500'
                                )}
                                fill="currentColor"
                            />
                        </motion.div>
                    </motion.button>
                );
            })}

            {showValue && (
                <span className={cn(
                    'font-semibold text-foreground ml-1',
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base',
                    size === 'xl' && 'text-lg'
                )}>
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

// Simple display-only version
export function RatingDisplay({
    rating,
    reviewCount,
    size = 'sm',
    className
}: {
    rating: number;
    reviewCount?: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    return (
        <div className={cn('flex items-center gap-1', className)}>
            <Star className={cn(
                'text-amber-400 fill-amber-400',
                size === 'sm' && 'w-3.5 h-3.5',
                size === 'md' && 'w-4 h-4',
                size === 'lg' && 'w-5 h-5',
            )} />
            <span className={cn(
                'font-medium text-foreground',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
            )}>
                {rating.toFixed(1)}
            </span>
            {typeof reviewCount === 'number' && (
                <span className={cn(
                    'text-muted-foreground',
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-sm',
                )}>
                    ({reviewCount})
                </span>
            )}
        </div>
    );
}
