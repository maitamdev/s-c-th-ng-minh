// BottomNav - Mobile bottom navigation bar with auth-aware tab visibility
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, User, Users, Route } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavItem {
    path: string;
    icon: React.ElementType;
    label: string;
    authRequired?: boolean;
}

export function BottomNav() {
    const location = useLocation();
    const { user } = useAuth();
    const { language } = useLanguage();

    // Nav items defined inside component to access language context
    const navItems: NavItem[] = [
        { path: '/', icon: Home, label: language === 'vi' ? 'Trang ch\u1ee7' : 'Home' },
        { path: '/explore', icon: MapPin, label: language === 'vi' ? 'Kh\u00e1m ph\u00e1' : 'Explore' },
        { path: '/community', icon: Users, label: language === 'vi' ? 'C\u1ed9ng \u0111\u1ed3ng' : 'Community' },
        { path: '/trip-planner', icon: Route, label: language === 'vi' ? 'H\u00e0nh tr\u00ecnh' : 'Trip' },
        { path: '/dashboard', icon: User, label: language === 'vi' ? 'C\u00e1 nh\u00e2n' : 'Profile', authRequired: true },
    ];

    // Don't show on auth pages or operator pages
    if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/operator')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden" role="navigation" aria-label="Main navigation">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    // Skip auth-required items if not logged in
                    if (item.authRequired && !user) return null;

                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                'active:scale-95 touch-manipulation',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
                            <span className="text-[10px] font-medium leading-none">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}