import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  X, 
  Copy, 
  Check, 
  Facebook, 
  MessageCircle,
  Mail,
  Link2,
  QrCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId: string;
  stationName: string;
  stationAddress: string;
}

export function ShareModal({ isOpen, onClose, stationId, stationName, stationAddress }: ShareModalProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/station/${stationId}`;
  const shareText = language === 'vi' 
    ? `Trạm sạc ${stationName} - ${stationAddress}` 
    : `Charging station ${stationName} - ${stationAddress}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: language === 'vi' ? 'Đã sao chép!' : 'Copied!',
        description: language === 'vi' ? 'Link đã được sao chép vào clipboard' : 'Link copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: language === 'vi' ? 'Không thể sao chép link' : 'Could not copy link',
        variant: 'destructive',
      });
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          '_blank',
          'width=600,height=400'
        );
      },
    },
    {
      name: 'Zalo',
      icon: MessageCircle,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => {
        window.open(
          `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
          '_blank'
        );
      },
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      onClick: () => {
        const subject = language === 'vi' ? `Trạm sạc: ${stationName}` : `Charging Station: ${stationName}`;
        const body = `${shareText}\n\n${shareUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      },
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: stationName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

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
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {language === 'vi' ? 'Chia sẻ trạm sạc' : 'Share Station'}
              </h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Station Info */}
            <div className="p-4 bg-secondary/50 rounded-xl mb-6">
              <p className="font-medium text-foreground">{stationName}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">{stationAddress}</p>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.onClick}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl text-white transition-colors',
                    option.color
                  )}
                >
                  <option.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{option.name}</span>
                </button>
              ))}
            </div>

            {/* Native Share (Mobile) */}
            {navigator.share && (
              <Button 
                variant="outline" 
                className="w-full mb-4"
                onClick={handleNativeShare}
              >
                <Link2 className="w-4 h-4" />
                {language === 'vi' ? 'Chia sẻ khác...' : 'More options...'}
              </Button>
            )}

            {/* Copy Link */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Hoặc sao chép link' : 'Or copy link'}
              </p>
              <div className="flex gap-2">
                <Input 
                  value={shareUrl} 
                  readOnly 
                  className="text-sm"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
