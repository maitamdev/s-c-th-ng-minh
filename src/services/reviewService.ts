import { supabase } from '@/lib/supabase';
import { Review, ReviewStats, CreateReviewInput, UpdateReviewInput, ReviewImage } from '@/types';

// ============================================
// REVIEW CRUD OPERATIONS
// ============================================

export async function createReview(input: CreateReviewInput): Promise<Review> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Bạn cần đăng nhập để đánh giá');

    // Check if user already reviewed this station
    const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('station_id', input.station_id)
        .single();

    if (existingReview) {
        throw new Error('Bạn đã đánh giá trạm này rồi');
    }

    // Check if user has a completed booking for this station (for verified badge)
    const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('station_id', input.station_id)
        .eq('status', 'completed')
        .limit(1)
        .single();

    const { data, error } = await supabase
        .from('reviews')
        .insert({
            user_id: user.id,
            station_id: input.station_id,
            booking_id: input.booking_id || booking?.id,
            rating: input.rating,
            title: input.title,
            comment: input.comment,
            is_verified: !!booking,
        })
        .select(`
      *,
      profile:profiles(id, full_name, avatar_url)
    `)
        .single();

    if (error) throw error;
    return data;
}

export async function updateReview(reviewId: string, input: UpdateReviewInput): Promise<Review> {
    const { data, error } = await supabase
        .from('reviews')
        .update({
            rating: input.rating,
            title: input.title,
            comment: input.comment,
        })
        .eq('id', reviewId)
        .select(`
      *,
      profile:profiles(id, full_name, avatar_url),
      images:review_images(*)
    `)
        .single();

    if (error) throw error;
    return data;
}

export async function deleteReview(reviewId: string): Promise<void> {
    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

    if (error) throw error;
}

// ============================================
// FETCH REVIEWS
// ============================================

export async function getStationReviews(
    stationId: string,
    options?: {
        sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
        limit?: number;
        offset?: number;
    }
): Promise<{ reviews: Review[]; total: number }> {
    const { sortBy = 'newest', limit = 10, offset = 0 } = options || {};

    // Get current user for is_helpful check
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from('reviews')
        .select(`
      *,
      profile:profiles(id, full_name, avatar_url),
      images:review_images(*)
    `, { count: 'exact' })
        .eq('station_id', stationId)
        .eq('status', 'active');

    // Apply sorting
    switch (sortBy) {
        case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
        case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
        case 'highest':
            query = query.order('rating', { ascending: false });
            break;
        case 'lowest':
            query = query.order('rating', { ascending: true });
            break;
        case 'helpful':
            query = query.order('helpful_count', { ascending: false });
            break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Check if current user has voted helpful for each review
    let reviews = data || [];
    if (user && reviews.length > 0) {
        const reviewIds = reviews.map(r => r.id);
        const { data: helpfulVotes } = await supabase
            .from('review_helpful')
            .select('review_id')
            .eq('user_id', user.id)
            .in('review_id', reviewIds);

        const helpfulSet = new Set(helpfulVotes?.map(v => v.review_id) || []);
        reviews = reviews.map(r => ({
            ...r,
            is_helpful: helpfulSet.has(r.id)
        }));
    }

    return { reviews, total: count || 0 };
}

export async function getUserReviews(userId?: string): Promise<Review[]> {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;
    if (!targetUserId) throw new Error('User not found');

    const { data, error } = await supabase
        .from('reviews')
        .select(`
      *,
      profile:profiles(id, full_name, avatar_url),
      images:review_images(*)
    `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getReviewById(reviewId: string): Promise<Review | null> {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
      *,
      profile:profiles(id, full_name, avatar_url),
      images:review_images(*)
    `)
        .eq('id', reviewId)
        .single();

    if (error) return null;
    return data;
}

// ============================================
// REVIEW STATS
// ============================================

export async function getStationReviewStats(stationId: string): Promise<ReviewStats> {
    const { data, error } = await supabase
        .rpc('get_station_review_stats', { p_station_id: stationId });

    if (error || !data || data.length === 0) {
        return {
            average_rating: 0,
            total_reviews: 0,
            rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }

    const stats = data[0];
    return {
        average_rating: parseFloat(stats.average_rating) || 0,
        total_reviews: parseInt(stats.total_reviews) || 0,
        rating_distribution: {
            1: parseInt(stats.rating_1) || 0,
            2: parseInt(stats.rating_2) || 0,
            3: parseInt(stats.rating_3) || 0,
            4: parseInt(stats.rating_4) || 0,
            5: parseInt(stats.rating_5) || 0,
        }
    };
}

// ============================================
// HELPFUL VOTES
// ============================================

export async function toggleHelpful(reviewId: string): Promise<{ isHelpful: boolean; count: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Bạn cần đăng nhập');

    // Check if already voted
    const { data: existingVote } = await supabase
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

    if (existingVote) {
        // Remove vote
        await supabase
            .from('review_helpful')
            .delete()
            .eq('id', existingVote.id);

        const { data: review } = await supabase
            .from('reviews')
            .select('helpful_count')
            .eq('id', reviewId)
            .single();

        return { isHelpful: false, count: review?.helpful_count || 0 };
    } else {
        // Add vote
        await supabase
            .from('review_helpful')
            .insert({ review_id: reviewId, user_id: user.id });

        const { data: review } = await supabase
            .from('reviews')
            .select('helpful_count')
            .eq('id', reviewId)
            .single();

        return { isHelpful: true, count: review?.helpful_count || 0 };
    }
}

// ============================================
// IMAGE UPLOAD
// ============================================

export async function uploadReviewImages(reviewId: string, files: File[]): Promise<ReviewImage[]> {
    const uploadedImages: ReviewImage[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${reviewId}/${Date.now()}_${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('review-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('review-images')
            .getPublicUrl(fileName);

        // Save to database
        const { data, error } = await supabase
            .from('review_images')
            .insert({
                review_id: reviewId,
                image_url: publicUrl,
                sort_order: i
            })
            .select()
            .single();

        if (!error && data) {
            uploadedImages.push(data);
        }
    }

    return uploadedImages;
}

export async function deleteReviewImage(imageId: string): Promise<void> {
    const { data: image } = await supabase
        .from('review_images')
        .select('image_url')
        .eq('id', imageId)
        .single();

    if (image?.image_url) {
        // Extract file path from URL and delete from storage
        const urlParts = image.image_url.split('review-images/');
        if (urlParts[1]) {
            await supabase.storage.from('review-images').remove([urlParts[1]]);
        }
    }

    await supabase.from('review_images').delete().eq('id', imageId);
}

// ============================================
// CHECK USER CAN REVIEW
// ============================================

export async function canUserReview(stationId: string): Promise<{
    canReview: boolean;
    reason?: string;
    hasBooking: boolean;
    existingReviewId?: string;
}> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { canReview: false, reason: 'Bạn cần đăng nhập để đánh giá', hasBooking: false };
    }

    // Check existing review
    const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('station_id', stationId)
        .single();

    if (existingReview) {
        return {
            canReview: false,
            reason: 'Bạn đã đánh giá trạm này rồi',
            hasBooking: false,
            existingReviewId: existingReview.id
        };
    }

    // Check if has completed booking
    const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('station_id', stationId)
        .eq('status', 'completed')
        .limit(1)
        .single();

    return {
        canReview: true,
        hasBooking: !!booking
    };
}
