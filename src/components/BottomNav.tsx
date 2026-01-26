import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
    path: string;
    icon: React.ElementType;
    label: string;
    authRequired?: boolean;
}

const navItems: NavItem[] = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: MapPin, label: 'Explore' },
    { path: '/dashboard/bookings', icon: Calendar, label: 'Bookings', authRequired: true },
    { path: '/dashboard', icon: User, label: 'Profile', authRequired: true },
];

export function BottomNav() {
    const location = useLocation();
    const { user } = useAuth();

    // Don't show on auth pages
    if (location.pathname.startsWith('/auth')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom md:hidden">
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
                        >
                            <item.icon className={cn('w-6 h-6', isActive && 'stroke-[2.5]')} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
