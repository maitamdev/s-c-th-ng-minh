import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { TranslationKey } from '@/lib/translations';
import {
  Menu,
  X,
  MapPin,
  LogIn,
  LayoutDashboard,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navLinks: { href: string; labelKey: TranslationKey }[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/explore', labelKey: 'nav.explore' },
  { href: '/team', labelKey: 'nav.team' },
  { href: '/pricing', labelKey: 'nav.pricing' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const isHomePage = location.pathname === '/';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || !isHomePage
          ? 'bg-card/95 backdrop-blur-xl border-b border-border/40 shadow-lg shadow-black/5'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-primary/25"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img src="/logo.jpg" alt="SCS GO" className="w-full h-full object-cover" />
          </motion.div>
          <span className="text-2xl font-bold gradient-text">SCS GO</span>
        </Link>

        {/* Desktop Navigation - Center */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center bg-secondary/50 rounded-full p-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 uppercase',
                    isActive
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-1"
            title={language === 'vi' ? 'English' : 'Tiếng Việt'}
          >
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase">{language}</span>
          </button>

          {user ? (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <LayoutDashboard className="w-4 h-4" />
                {t('nav.dashboard')}
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">
                <LogIn className="w-4 h-4" />
                {t('auth.login')}
              </Link>
            </Button>
          )}
          <Button variant="hero" size="sm" asChild>
            <Link to="/explore">
              <MapPin className="w-4 h-4" />
              {t('explore.title')}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary/80 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden bg-card/98 backdrop-blur-xl border-t border-border/40"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'block py-3 px-4 rounded-xl text-sm font-medium transition-colors uppercase',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}

            {/* Mobile Theme & Language toggles */}
            <div className="flex items-center gap-2 py-3 px-4">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              <button
                onClick={toggleLanguage}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm uppercase">{language === 'vi' ? 'EN' : 'VI'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-border/40 space-y-3">
              {user ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="w-4 h-4" />
                    {t('nav.dashboard')}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <LogIn className="w-4 h-4" />
                    {t('auth.login')}
                  </Link>
                </Button>
              )}
              <Button variant="hero" className="w-full" asChild>
                <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>
                  <MapPin className="w-4 h-4" />
                  {t('explore.title')}
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
