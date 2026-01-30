import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    ThumbsUp,
    MoreVertical,
    Edit2,
    Trash2,
    Flag,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import { Review } from '@/types';
import { RatingStars } from './RatingStars';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewCardProps {
    review: Review;
    onEdit?: () => void;
    onDelete?: () => void;
    onHelpful?: () => void;
    isDeleting?: boolean;
}

export function ReviewCard({
    review,
    onEdit,
    onDelete,
    onHelpful,
    isDeleting
}: ReviewCardProps) {
    const { user } = useAuth();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const isOwner = user?.id === review.user_id;
    const images = review.images || [];

    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
            return formatDistanceToNow(date, { addSuffix: true, locale: vi });
        }
        return format(date, 'dd/MM/yyyy', { locale: vi });
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card border border-border rounded-xl p-4 md:p-5"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-primary/20">
                            <AvatarImage src={review.profile?.avatar_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(review.profile?.full_name)}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                    {review.profile?.full_name || 'Ẩn danh'}
                                </span>
                                {review.is_verified && (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Đã sạc
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <RatingStars rating={review.rating} size="sm" />
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(review.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {isOwner && (
                                <>
                                    <DropdownMenuItem onClick={onEdit}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Xóa
                                    </DropdownMenuItem>
                                </>
                            )}
                            {!isOwner && (
                                <DropdownMenuItem>
                                    <Flag className="w-4 h-4 mr-2" />
                                    Báo cáo
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Review content */}
                {review.title && (
                    <h4 className="font-semibold text-foreground mb-1">{review.title}</h4>
                )}
                {review.comment && (
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {review.comment}
                    </p>
                )}

                {/* Images */}
                {images.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                            <motion.button
                                key={image.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedImageIndex(index)}
                                className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border"
                            >
                                <img
                                    src={image.image_url}
                                    alt={`Review image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onHelpful}
                        className={cn(
                            'gap-1.5 text-muted-foreground hover:text-foreground',
                            review.is_helpful && 'text-primary hover:text-primary'
                        )}
                    >
                        <ThumbsUp className={cn(
                            'w-4 h-4',
                            review.is_helpful && 'fill-current'
                        )} />
                        <span>Hữu ích</span>
                        {review.helpful_count > 0 && (
                            <span className="text-xs">({review.helpful_count})</span>
                        )}
                    </Button>

                    {review.updated_at && review.updated_at !== review.created_at && (
                        <span className="text-xs text-muted-foreground">
                            Đã chỉnh sửa
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Delete confirmation dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xóa đánh giá?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Image lightbox */}
            <AnimatePresence>
                {selectedImageIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setSelectedImageIndex(null)}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white hover:bg-white/10"
                            onClick={() => setSelectedImageIndex(null)}
                        >
                            <X className="w-6 h-6" />
                        </Button>

                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 text-white hover:bg-white/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImageIndex((prev) =>
                                            prev !== null && prev > 0 ? prev - 1 : images.length - 1
                                        );
                                    }}
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 text-white hover:bg-white/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImageIndex((prev) =>
                                            prev !== null && prev < images.length - 1 ? prev + 1 : 0
                                        );
                                    }}
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </Button>
                            </>
                        )}

                        <motion.img
                            key={selectedImageIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            src={images[selectedImageIndex]?.image_url}
                            alt="Review image"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <div className="absolute bottom-4 text-white text-sm">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
