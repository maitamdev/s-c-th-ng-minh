import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { Review } from '@/types';
import { ReviewCard } from './ReviewCard';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';

interface ReviewListProps {
    reviews: Review[];
    total: number;
    isLoading?: boolean;
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
    onEdit?: (review: Review) => void;
    onDelete?: (reviewId: string) => void;
    onHelpful?: (reviewId: string) => void;
    deletingId?: string;
    className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Điểm cao nhất' },
    { value: 'lowest', label: 'Điểm thấp nhất' },
    { value: 'helpful', label: 'Hữu ích nhất' },
];

export function ReviewList({
    reviews,
    total,
    isLoading = false,
    sortBy,
    onSortChange,
    onLoadMore,
    hasMore = false,
    isLoadingMore = false,
    onEdit,
    onDelete,
    onHelpful,
    deletingId,
    className,
}: ReviewListProps) {
    if (isLoading) {
        return (
            <div className={cn('space-y-4', className)}>
                {/* Skeleton loaders */}
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-card border border-border rounded-xl p-5 animate-pulse"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-muted" />
                            <div className="space-y-2">
                                <div className="w-24 h-4 bg-muted rounded" />
                                <div className="w-32 h-3 bg-muted rounded" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="w-full h-4 bg-muted rounded" />
                            <div className="w-3/4 h-4 bg-muted rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return null;
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header with sort */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">
                    {total} đánh giá
                </h3>

                <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
                    <SelectTrigger className="w-[160px] bg-secondary border-0">
                        <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {reviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            onEdit={() => onEdit?.(review)}
                            onDelete={() => onDelete?.(review.id)}
                            onHelpful={() => onHelpful?.(review.id)}
                            isDeleting={deletingId === review.id}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Load more button */}
            {hasMore && onLoadMore && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        className="min-w-[160px]"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang tải...
                            </>
                        ) : (
                            'Xem thêm đánh giá'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
