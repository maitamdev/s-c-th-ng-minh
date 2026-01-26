import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    transparent?: boolean;
    className?: string;
}

export function MobileHeader({
    title,
    showBack = true,
    onBack,
    rightAction,
    transparent = false,
    className,
}: MobileHeaderProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 md:hidden safe-area-top',
                transparent
                    ? 'bg-transparent'
                    : 'bg-background/95 backdrop-blur-lg border-b border-border',
                className
            )}
        >
            {/* Left: Back button */}
            <div className="w-10">
                {showBack && (
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors touch-manipulation active:scale-95"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Center: Title */}
            {title && (
                <h1 className="flex-1 text-center font-semibold text-base truncate">
                    {title}
                </h1>
            )}

            {/* Right: Action */}
            <div className="w-10 flex justify-end">
                {rightAction}
            </div>
        </header>
    );
}
