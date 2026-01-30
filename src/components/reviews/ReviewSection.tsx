import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenLine, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewStats } from './ReviewStats';
import { ReviewList } from './ReviewList';
import { ReviewForm } from './ReviewForm';
import {
    useStationReviews,
    useStationReviewStats,
    useCanReview,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
    useToggleHelpful
} from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Review, CreateReviewInput, UpdateReviewInput } from '@/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ReviewSectionProps {
    stationId: string;
    stationName: string;
    className?: string;
}

export function ReviewSection({ stationId, stationName, className }: ReviewSectionProps) {
    const { user } = useAuth();
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [deletingId, setDeletingId] = useState<string | undefined>();

    // Queries
    const { data: reviewsData, isLoading: isLoadingReviews } = useStationReviews(stationId, { sortBy });
    const { data: stats, isLoading: isLoadingStats } = useStationReviewStats(stationId);
    const { data: canReviewData } = useCanReview(stationId);

    // Mutations
    const createReview = useCreateReview();
    const updateReview = useUpdateReview();
    const deleteReview = useDeleteReview();
    const toggleHelpful = useToggleHelpful();

    const handleSubmitReview = async (
        data: { rating: number; title?: string; comment?: string },
        images: File[]
    ) => {
        if (editingReview) {
            await updateReview.mutateAsync({
                reviewId: editingReview.id,
                input: data as UpdateReviewInput,
                stationId,
            });
        } else {
            await createReview.mutateAsync({
                input: {
                    station_id: stationId,
                    ...data,
                } as CreateReviewInput,
                images,
            });
        }
        setEditingReview(null);
    };

    const handleDeleteReview = async (reviewId: string) => {
        setDeletingId(reviewId);
        await deleteReview.mutateAsync({ reviewId, stationId });
        setDeletingId(undefined);
    };

    const handleToggleHelpful = (reviewId: string) => {
        if (!user) return;
        toggleHelpful.mutate({ reviewId, stationId });
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    return (
        <section className={cn('space-y-6', className)} id="reviews">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Đánh giá</h2>

                {user ? (
                    canReviewData?.canReview ? (
                        <Button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600"
                        >
                            <PenLine className="w-4 h-4 mr-2" />
                            Viết đánh giá
                        </Button>
                    ) : canReviewData?.existingReviewId ? (
                        <Button
                            variant="outline"
                            onClick={() => {
                                const existingReview = reviewsData?.reviews.find(
                                    r => r.id === canReviewData.existingReviewId
                                );
                                if (existingReview) handleEditReview(existingReview);
                            }}
                        >
                            <PenLine className="w-4 h-4 mr-2" />
                            Sửa đánh giá
                        </Button>
                    ) : null
                ) : (
                    <Link to="/auth">
                        <Button variant="outline">
                            <LogIn className="w-4 h-4 mr-2" />
                            Đăng nhập để đánh giá
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats */}
            {!isLoadingStats && stats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <ReviewStats stats={stats} />
                </motion.div>
            )}

            {/* Reviews list */}
            <ReviewList
                reviews={reviewsData?.reviews || []}
                total={reviewsData?.total || 0}
                isLoading={isLoadingReviews}
                sortBy={sortBy}
                onSortChange={setSortBy}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                onHelpful={handleToggleHelpful}
                deletingId={deletingId}
            />

            {/* Review form dialog */}
            <ReviewForm
                open={showReviewForm}
                onOpenChange={(open) => {
                    setShowReviewForm(open);
                    if (!open) setEditingReview(null);
                }}
                stationName={stationName}
                hasVerifiedBooking={canReviewData?.hasBooking}
                existingReview={editingReview || undefined}
                onSubmit={handleSubmitReview}
                isSubmitting={createReview.isPending || updateReview.isPending}
            />
        </section>
    );
}
