import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Menu, 
  X,
  MapPin,
  LogIn,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/explore', label: 'Khám phá' },
  { href: '/pricing', label: 'Bảng giá' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

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
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Zap className="w-5 h-5 text-primary-foreground" fill="currentColor" />
          </motion.div>
          <span className="text-xl font-bold gradient-text">SCS GO</span>
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
                    'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/explore">
              <MapPin className="w-4 h-4" />
              Tìm trạm sạc
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
                    'block py-3 px-4 rounded-xl text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-border/40 space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </Link>
              </Button>
              <Button variant="hero" className="w-full" asChild>
                <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>
                  <MapPin className="w-4 h-4" />
                  Tìm trạm sạc
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
