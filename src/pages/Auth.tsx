import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  Zap,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';
type UserType = 'user' | 'operator';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Get the page user was trying to access before being redirected to login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const initialType = searchParams.get('type') === 'operator' ? 'operator' : 'user';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [userType, setUserType] = useState<UserType>(initialType);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    businessName: '',
    phone: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      // Check user role and redirect accordingly
      if (user.profile?.role === 'operator') {
        navigate('/operator', { replace: true });
      } else if (user.profile?.onboarding_completed) {
        navigate(from, { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: t('common.error'),
            description: error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('common.success'),
            description: t('auth.welcome'),
          });
          // Will redirect via useEffect
        }
      } else {
        // Register
        const { data, error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          toast({
            title: t('common.error'),
            description: error,
            variant: 'destructive',
          });
        } else {
          // If operator, update profile with role and business info
          if (userType === 'operator' && data?.user) {
            await supabase.from('profiles').update({
              role: 'operator',
              business_name: formData.businessName,
              phone: formData.phone,
            }).eq('id', data.user.id);
          }

          toast({
            title: t('common.success'),
            description: userType === 'operator'
              ? t('auth.operatorRegistered')
              : t('auth.welcome'),
          });

          if (userType === 'operator') {
            navigate('/operator');
          } else {
            navigate('/onboarding');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast({
        title: t('common.error'),
        description: error,
        variant: 'destructive',
      });
      setLoading(false);
    }
    // Will redirect via useEffect after auth state changes
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
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-primary/30">
              <img src="/logo.jpg" alt="SCS GO" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold gradient-text">SCS GO</span>
          </Link>

          {/* User Type Tabs */}
          <div className="flex gap-2 p-1 bg-secondary rounded-xl mb-6">
            <button
              onClick={() => setUserType('user')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all',
                userType === 'user'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="w-4 h-4" />
              {t('auth.userAccount')}
            </button>
            <button
              onClick={() => setUserType('operator')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all',
                userType === 'operator'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Building2 className="w-4 h-4" />
              {t('auth.operatorAccount')}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {mode === 'login'
              ? (userType === 'operator' ? t('auth.operatorLogin') : t('auth.login'))
              : (userType === 'operator' ? t('auth.operatorRegister') : t('auth.createAccount'))}
          </h1>
          <p className="text-muted-foreground mb-6">
            {mode === 'login'
              ? (userType === 'operator' ? t('auth.operatorLoginDesc') : t('auth.welcomeDesc'))
              : (userType === 'operator' ? t('auth.operatorRegisterDesc') : t('auth.createAccountDesc'))}
          </p>

          {/* Google Sign In Button - only for users */}
          {userType === 'user' && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4"
                size="lg"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('auth.loginWithGoogle')}
              </Button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.fullName')}</Label>
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

                {userType === 'operator' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="businessName">{t('auth.businessName')}</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="businessName"
                          placeholder="Công ty TNHH ABC"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('auth.phone')}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+84</span>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="912345678"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-12"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
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
                <Label htmlFor="password">{t('auth.password')}</Label>
                {mode === 'login' && (
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    {t('auth.forgotPassword')}
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
                <span className="animate-pulse">{t('common.loading')}</span>
              ) : (
                <>
                  {mode === 'login' ? t('auth.login') : t('auth.register')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary font-medium hover:underline"
              >
                {mode === 'login' ? t('auth.register') : t('auth.login')}
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
          key={userType}
        >
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg shadow-primary/30">
            <img src="/logo.jpg" alt="SCS GO" className="w-full h-full object-cover" />
          </div>

          {userType === 'user' ? (
            <>
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
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4">
                Quản lý trạm sạc với <span className="gradient-text">SCS GO</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Nền tảng quản lý trạm sạc chuyên nghiệp, tăng doanh thu và tiếp cận khách hàng.
              </p>

              <div className="space-y-3 text-left">
                {[
                  'Quản lý nhiều trạm sạc dễ dàng',
                  'Theo dõi đặt chỗ real-time',
                  'Thống kê doanh thu chi tiết',
                  'Rút tiền nhanh chóng, an toàn',
                  'Tiếp cận hàng nghìn khách hàng',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
