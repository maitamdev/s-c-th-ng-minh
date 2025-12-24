import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Star, X, Loader2, Camera, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId: string;
  stationName: string;
  onSuccess?: () => void;
}

const ratingLabels = {
  vi: ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'],
  en: ['', 'Very Bad', 'Bad', 'Average', 'Good', 'Excellent'],
};

export function ReviewModal({ isOpen, onClose, stationId, stationName, onSuccess }: ReviewModalProps) {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        station_id: stationId,
        user_id: user.uid,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast({
        title: language === 'vi' ? 'Đánh giá thành công!' : 'Review submitted!',
        description: language === 'vi' 
          ? 'Cảm ơn bạn đã đánh giá trạm sạc' 
          : 'Thank you for your review',
      });

      onSuccess?.();
      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: language === 'vi' 
          ? 'Không thể gửi đánh giá. Vui lòng thử lại.' 
          : 'Could not submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;
  const labels = ratingLabels[language] || ratingLabels.vi;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">{t('station.writeReview')}</h3>
                <p className="text-sm text-muted-foreground">{stationName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Rating Stars */}
            <div className="text-center mb-6">
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        'w-10 h-10 transition-colors',
                        star <= displayRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className={cn(
                'text-sm font-medium h-5',
                displayRating > 0 ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {displayRating > 0 ? labels[displayRating] : (language === 'vi' ? 'Chọn số sao' : 'Select rating')}
              </p>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <Textarea
                placeholder={language === 'vi' 
                  ? 'Chia sẻ trải nghiệm của bạn (không bắt buộc)...' 
                  : 'Share your experience (optional)...'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant="hero" 
                className="flex-1" 
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'vi' ? 'Đang gửi...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {language === 'vi' ? 'Gửi đánh giá' : 'Submit Review'}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
