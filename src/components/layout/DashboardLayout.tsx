import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Zap,
  User,
  Car,
  Heart,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TranslationKey } from '@/lib/translations';

const sidebarLinks: { href: string; labelKey: TranslationKey; icon: typeof User }[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: User },
  { href: '/dashboard/vehicle', labelKey: 'nav.vehicle', icon: Car },
  { href: '/dashboard/favorites', labelKey: 'nav.favorites', icon: Heart },
  { href: '/dashboard/bookings', labelKey: 'nav.bookings', icon: Calendar },
  { href: '/dashboard/history', labelKey: 'nav.history', icon: History },
  { href: '/dashboard/subscription', labelKey: 'nav.subscription', icon: CreditCard },
  { href: '/dashboard/settings', labelKey: 'nav.settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-xl border-b border-border/60 z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src="/logo.png" alt="SCS GO" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold gradient-text">SCS GO</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-secondary"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 bottom-0 w-64 bg-card/95 backdrop-blur-xl border-r border-border/60 z-50 transition-transform duration-300',
        'lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2 px-4 border-b border-border/60">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src="/logo.png" alt="SCS GO" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold gradient-text">SCS GO</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user?.profile?.avatar_url ? (
                  <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{user?.profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{t('subscription.basic')}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
