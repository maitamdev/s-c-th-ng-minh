import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    X,
    ImagePlus,
    Loader2,
    Sparkles,
    CheckCircle2,
    Camera
} from 'lucide-react';
import { RatingStars } from './RatingStars';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Review } from '@/types';

const reviewSchema = z.object({
    rating: z.number().min(1, 'Vui lòng chọn số sao').max(5),
    title: z.string().max(100, 'Tiêu đề tối đa 100 ký tự').optional(),
    comment: z.string().max(1000, 'Nội dung tối đa 1000 ký tự').optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stationName: string;
    hasVerifiedBooking?: boolean;
    existingReview?: Review;
    onSubmit: (data: ReviewFormData, images: File[]) => Promise<void>;
    isSubmitting?: boolean;
}

export function ReviewForm({
    open,
    onOpenChange,
    stationName,
    hasVerifiedBooking = false,
    existingReview,
    onSubmit,
    isSubmitting = false,
}: ReviewFormProps) {
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ReviewFormData>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: existingReview?.rating || 0,
            title: existingReview?.title || '',
            comment: existingReview?.comment || '',
        },
    });

    const rating = form.watch('rating');

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) return false;
            if (file.size > 5 * 1024 * 1024) return false; // 5MB limit
            return true;
        });

        if (images.length + validFiles.length > 5) {
            alert('Tối đa 5 ảnh');
            return;
        }

        setImages(prev => [...prev, ...validFiles]);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImagePreviews(prev => [...prev, e.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (data: ReviewFormData) => {
        await onSubmit(data, images);
        form.reset();
        setImages([]);
        setImagePreviews([]);
        onOpenChange(false);
    };

    const getRatingText = (rating: number) => {
        switch (rating) {
            case 1: return 'Rất tệ';
            case 2: return 'Tệ';
            case 3: return 'Bình thường';
            case 4: return 'Tốt';
            case 5: return 'Xuất sắc';
            default: return 'Chọn đánh giá';
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4) return 'text-emerald-500';
        if (rating === 3) return 'text-amber-500';
        if (rating > 0) return 'text-red-500';
        return 'text-muted-foreground';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-r from-primary/5 to-cyan-500/5">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {stationName}
                    </p>
                    {hasVerifiedBooking && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit mt-2">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Bạn đã sạc tại trạm này
                        </div>
                    )}
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-5">
                    {/* Rating */}
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                            Bạn đánh giá trạm sạc này thế nào?
                        </p>
                        <RatingStars
                            rating={rating}
                            size="xl"
                            interactive
                            onChange={(value) => form.setValue('rating', value)}
                            className="justify-center"
                        />
                        <motion.p
                            key={rating}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                'text-sm font-medium mt-2',
                                getRatingColor(rating)
                            )}
                        >
                            {getRatingText(rating)}
                        </motion.p>
                        {form.formState.errors.rating && (
                            <p className="text-xs text-destructive mt-1">
                                {form.formState.errors.rating.message}
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <Input
                            placeholder="Tiêu đề (tùy chọn)"
                            {...form.register('title')}
                            className="bg-secondary border-0"
                        />
                        {form.formState.errors.title && (
                            <p className="text-xs text-destructive mt-1">
                                {form.formState.errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <Textarea
                            placeholder="Chia sẻ trải nghiệm của bạn... (tùy chọn)"
                            {...form.register('comment')}
                            rows={4}
                            className="bg-secondary border-0 resize-none"
                        />
                        {form.formState.errors.comment && (
                            <p className="text-xs text-destructive mt-1">
                                {form.formState.errors.comment.message}
                            </p>
                        )}
                    </div>

                    {/* Image upload */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                        />

                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence mode="popLayout">
                                {imagePreviews.map((preview, index) => (
                                    <motion.div
                                        key={preview}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative w-16 h-16 rounded-lg overflow-hidden group"
                                    >
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {images.length < 5 && (
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors"
                                >
                                    <Camera className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">
                                        +{5 - images.length}
                                    </span>
                                </motion.button>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                            Thêm ảnh (tối đa 5 ảnh, mỗi ảnh tối đa 5MB)
                        </p>
                    </div>

                    {/* Submit button */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="flex-1 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                existingReview ? 'Cập nhật' : 'Gửi đánh giá'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
