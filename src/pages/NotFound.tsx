import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Search, ArrowLeft, Zap } from 'lucide-react';

export default function NotFound() {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Animated 404 */}
        <motion.div 
          className="relative mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="text-[150px] font-bold leading-none gradient-text opacity-20">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Zap className="w-12 h-12 text-primary" />
            </motion.div>
          </div>
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          {language === 'vi' ? 'Trang không tồn tại' : 'Page Not Found'}
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {language === 'vi' 
            ? 'Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.'
            : 'Sorry, the page you are looking for does not exist or has been moved.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="hero" asChild>
            <Link to="/">
              <Home className="w-4 h-4" />
              {language === 'vi' ? 'Về trang chủ' : 'Go Home'}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/explore">
              <Search className="w-4 h-4" />
              {language === 'vi' ? 'Tìm trạm sạc' : 'Find Stations'}
            </Link>
          </Button>
        </div>

        <button 
          onClick={() => window.history.back()}
          className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'vi' ? 'Quay lại trang trước' : 'Go back'}
        </button>
      </motion.div>
    </div>
  );
}
