import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import { ReviewStats as ReviewStatsType } from '@/types';
import { cn } from '@/lib/utils';

interface ReviewStatsProps {
    stats: ReviewStatsType;
    className?: string;
}

export function ReviewStats({ stats, className }: ReviewStatsProps) {
    const totalReviews = stats.total_reviews;
    const avgRating = stats.average_rating;

    const getRatingLabel = (rating: number) => {
        if (rating >= 4.5) return 'Xuất sắc';
        if (rating >= 4) return 'Rất tốt';
        if (rating >= 3.5) return 'Tốt';
        if (rating >= 3) return 'Bình thường';
        if (rating >= 2) return 'Tạm được';
        return 'Cần cải thiện';
    };

    if (totalReviews === 0) {
        return (
            <div className={cn(
                'bg-card border border-border rounded-2xl p-6 text-center',
                className
            )}>
                <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">
                    Chưa có đánh giá
                </h3>
                <p className="text-sm text-muted-foreground">
                    Hãy là người đầu tiên đánh giá trạm sạc này!
                </p>
            </div>
        );
    }

    return (
        <div className={cn(
            'bg-card border border-border rounded-2xl p-6',
            className
        )}>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Average rating */}
                <div className="flex flex-col items-center justify-center md:min-w-[140px]">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="text-5xl font-bold text-foreground mb-1"
                    >
                        {avgRating.toFixed(1)}
                    </motion.div>

                    <div className="flex items-center gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={cn(
                                    'w-5 h-5',
                                    star <= Math.round(avgRating)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-muted-foreground/30 fill-muted-foreground/30'
                                )}
                            />
                        ))}
                    </div>

                    <span className="text-sm font-medium text-primary">
                        {getRatingLabel(avgRating)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                        {totalReviews} đánh giá
                    </span>
                </div>

                {/* Right: Rating distribution */}
                <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.rating_distribution[rating as keyof typeof stats.rating_distribution];
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                        return (
                            <div key={rating} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-12">
                                    <span className="text-sm font-medium text-foreground">{rating}</span>
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                </div>

                                <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.5, delay: (5 - rating) * 0.1 }}
                                        className={cn(
                                            'h-full rounded-full',
                                            rating >= 4 && 'bg-gradient-to-r from-emerald-500 to-emerald-400',
                                            rating === 3 && 'bg-gradient-to-r from-amber-500 to-amber-400',
                                            rating <= 2 && 'bg-gradient-to-r from-red-500 to-red-400'
                                        )}
                                    />
                                </div>

                                <span className="text-xs text-muted-foreground w-10 text-right">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
