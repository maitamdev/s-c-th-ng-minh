import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
  Bell,
  User,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OperatorLayoutProps {
  children: React.ReactNode;
}

export function OperatorLayout({ children }: OperatorLayoutProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: t('operator.nav.dashboard'), path: '/operator' },
    { icon: MapPin, label: t('operator.nav.stations'), path: '/operator/stations' },
    { icon: Calendar, label: t('operator.nav.bookings'), path: '/operator/bookings' },
    { icon: BarChart3, label: t('operator.nav.analytics'), path: '/operator/analytics' },
    { icon: Wallet, label: t('operator.nav.revenue'), path: '/operator/revenue' },
    { icon: Settings, label: t('operator.nav.settings'), path: '/operator/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/operator" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="SCS GO" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-foreground">Operator</span>
          </Link>

          <button className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <Link to="/operator" className="flex items-center gap-3">
                    <img src="/logo.jpg" alt="SCS GO" className="w-10 h-10 rounded-xl" />
                    <div>
                      <span className="font-bold text-foreground block">SCS GO</span>
                      <span className="text-xs text-primary">Operator Portal</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-secondary/50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {user?.profile?.business_name || user?.profile?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('auth.logout')}
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex-col z-40">
        <div className="p-6 border-b border-border">
          <Link to="/operator" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="SCS GO" className="w-12 h-12 rounded-xl shadow-lg" />
            <div>
              <span className="font-bold text-xl text-foreground block">SCS GO</span>
              <span className="text-sm text-primary font-medium">Operator Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="p-4 border-t border-border">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-cyan-500/10 rounded-xl mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t('operator.quickStats')}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">0đ</p>
            <p className="text-xs text-muted-foreground">{t('operator.todayRevenue')}</p>
          </div>

          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">
                {user?.profile?.business_name || user?.profile?.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate('/dashboard')}
            >
              <User className="w-4 h-4 mr-1" />
              User
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
