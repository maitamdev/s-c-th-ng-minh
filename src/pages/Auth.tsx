import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  Mail, 
  Lock, 
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Demo: just show loading state
    setTimeout(() => {
      setLoading(false);
      // In real app, would redirect to dashboard
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="text-xl font-bold gradient-text">SCS GO</span>
          </Link>

          <h1 className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === 'login' 
              ? 'Chào mừng trở lại! Đăng nhập để tiếp tục.' 
              : 'Tạo tài khoản miễn phí để bắt đầu.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name">Họ tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                {mode === 'login' && (
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Quên mật khẩu?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              variant="hero" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Đang xử lý...</span>
              ) : (
                <>
                  {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              {' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary font-medium hover:underline"
              >
                {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 to-cyan-500/10 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
        
        <motion.div 
          className="relative text-center max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
            <Zap className="w-10 h-10 text-primary-foreground" fill="currentColor" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Sạc xe thông minh với <span className="gradient-text">SCS GO</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Tìm trạm sạc tối ưu, đặt chỗ trước và không bao giờ phải chờ đợi.
          </p>

          <div className="space-y-3 text-left">
            {[
              'AI gợi ý trạm phù hợp nhất',
              'Dự đoán độ đông theo giờ',
              'Đặt chỗ trước, hủy miễn phí',
              'Hơn 150 trạm trên toàn quốc',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
