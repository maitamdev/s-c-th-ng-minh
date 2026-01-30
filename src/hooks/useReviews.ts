import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getStationReviews,
    getStationReviewStats,
    getUserReviews,
    createReview,
    updateReview,
    deleteReview,
    toggleHelpful,
    uploadReviewImages,
    canUserReview
} from '@/services/reviewService';
import { CreateReviewInput, UpdateReviewInput, Review, ReviewStats } from '@/types';
import { toast } from 'sonner';

// ============================================
// FETCH HOOKS
// ============================================

export function useStationReviews(
    stationId: string,
    options?: {
        sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
        limit?: number;
        offset?: number;
    }
) {
    return useQuery({
        queryKey: ['reviews', stationId, options],
        queryFn: () => getStationReviews(stationId, options),
        enabled: !!stationId,
    });
}

export function useStationReviewStats(stationId: string) {
    return useQuery({
        queryKey: ['review-stats', stationId],
        queryFn: () => getStationReviewStats(stationId),
        enabled: !!stationId,
    });
}

export function useUserReviews(userId?: string) {
    return useQuery({
        queryKey: ['user-reviews', userId],
        queryFn: () => getUserReviews(userId),
    });
}

export function useCanReview(stationId: string) {
    return useQuery({
        queryKey: ['can-review', stationId],
        queryFn: () => canUserReview(stationId),
        enabled: !!stationId,
    });
}

// ============================================
// MUTATION HOOKS
// ============================================

export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            input,
            images
        }: {
            input: CreateReviewInput;
            images?: File[]
        }) => {
            const review = await createReview(input);

            // Upload images if provided
            if (images && images.length > 0) {
                await uploadReviewImages(review.id, images);
            }

            return review;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reviews', variables.input.station_id] });
            queryClient.invalidateQueries({ queryKey: ['review-stats', variables.input.station_id] });
            queryClient.invalidateQueries({ queryKey: ['can-review', variables.input.station_id] });
            queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
            toast.success('Cảm ơn bạn đã đánh giá!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi gửi đánh giá');
        },
    });
}

export function useUpdateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reviewId,
            input
        }: {
            reviewId: string;
            input: UpdateReviewInput;
            stationId: string;
        }) => updateReview(reviewId, input),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reviews', variables.stationId] });
            queryClient.invalidateQueries({ queryKey: ['review-stats', variables.stationId] });
            queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
            toast.success('Đã cập nhật đánh giá');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật');
        },
    });
}

export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reviewId,
            stationId
        }: {
            reviewId: string;
            stationId: string
        }) => deleteReview(reviewId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['reviews', variables.stationId] });
            queryClient.invalidateQueries({ queryKey: ['review-stats', variables.stationId] });
            queryClient.invalidateQueries({ queryKey: ['can-review', variables.stationId] });
            queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
            toast.success('Đã xóa đánh giá');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Có lỗi xảy ra khi xóa');
        },
    });
}

export function useToggleHelpful() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reviewId
        }: {
            reviewId: string;
            stationId: string
        }) => toggleHelpful(reviewId),
        onSuccess: (result, variables) => {
            // Optimistically update the review in cache
            queryClient.setQueryData<{ reviews: Review[]; total: number }>(
                ['reviews', variables.stationId, undefined],
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        reviews: old.reviews.map(review =>
                            review.id === variables.reviewId
                                ? { ...review, is_helpful: result.isHelpful, helpful_count: result.count }
                                : review
                        )
                    };
                }
            );
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Có lỗi xảy ra');
        },
    });
}
