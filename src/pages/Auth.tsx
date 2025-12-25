import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import {
  Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2,
  Building2, Zap, Users, MapPin, Wifi, Coffee, Car, ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';
type UserType = 'user' | 'operator';
type OperatorStep = 1 | 2;

const AMENITIES = [
  { id: 'wifi', icon: Wifi, label: 'WiFi' },
  { id: 'cafe', icon: Coffee, label: 'Cafe' },
  { id: 'parking', icon: Car, label: 'Bãi đỗ xe' },
  { id: 'shopping', icon: ShoppingBag, label: 'Mua sắm' },
];

const CONNECTOR_TYPES = ['CCS2', 'Type2', 'CHAdeMO', 'GBT'];
const POWER_OPTIONS = [22, 50, 60, 100, 120, 150, 250];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const initialType = searchParams.get('type') === 'operator' ? 'operator' : 'user';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [userType, setUserType] = useState<UserType>(initialType);
  const [operatorStep, setOperatorStep] = useState<OperatorStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', businessName: '', phone: '',
  });

  const [stationData, setStationData] = useState({
    name: '', address: '', lat: 21.0285, lng: 105.8542, provider: '',
    description: '', is_24h: true, hours_open: '06:00', hours_close: '23:00',
    amenities: [] as string[],
    chargers: [{ connector_type: 'CCS2', power_kw: 150, price_per_kwh: 3500 }],
  });

  useEffect(() => {
    if (user && !authLoading) {
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
    if (mode === 'register' && userType === 'operator' && operatorStep === 1) {
      setOperatorStep(2);
      return;
    }
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({ title: t('common.error'), description: error, variant: 'destructive' });
        } else {
          toast({ title: t('common.success'), description: t('auth.welcome') });
        }
      } else {
        const { data, error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
          toast({ title: t('common.error'), description: error, variant: 'destructive' });
        } else if (data?.user) {
          if (userType === 'operator') {
            // Update profile
            await supabase.from('profiles').update({
              role: 'operator', business_name: formData.businessName, phone: formData.phone,
            }).eq('id', data.user.id);

            // Create station
            const { data: station } = await supabase.from('stations').insert({
              operator_id: data.user.id,
              name: stationData.name,
              address: stationData.address,
              lat: stationData.lat,
              lng: stationData.lng,
              provider: stationData.provider || formData.businessName,
              description: stationData.description,
              is_24h: stationData.is_24h,
              hours_open: stationData.hours_open,
              hours_close: stationData.hours_close,
              amenities: stationData.amenities,
              status: 'approved',
            }).select().single();

            // Create chargers
            if (station) {
              for (let i = 0; i < stationData.chargers.length; i++) {
                const charger = stationData.chargers[i];
                await supabase.from('chargers').insert({
                  station_id: station.id,
                  connector_type: charger.connector_type,
                  power_kw: charger.power_kw,
                  price_per_kwh: charger.price_per_kwh,
                  charger_number: i + 1,
                  status: 'available',
                });
              }
            }
            toast({ title: t('common.success'), description: t('auth.operatorRegistered') });
            navigate('/operator');
          } else {
            toast({ title: t('common.success'), description: t('auth.welcome') });
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
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
      setLoading(false);
    }
  };

  const toggleAmenity = (id: string) => {
    setStationData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id],
    }));
  };

  const addCharger = () => {
    setStationData(prev => ({
      ...prev,
      chargers: [...prev.chargers, { connector_type: 'CCS2', power_kw: 150, price_per_kwh: 3500 }],
    }));
  };

  const updateCharger = (index: number, field: string, value: any) => {
    setStationData(prev => ({
      ...prev,
      chargers: prev.chargers.map((c, i) => i === index ? { ...c, [field]: value } : c),
    }));
  };

  const removeCharger = (index: number) => {
    if (stationData.chargers.length > 1) {
      setStationData(prev => ({
        ...prev,
        chargers: prev.chargers.filter((_, i) => i !== index),
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/" className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-primary/30">
              <img src="/logo.jpg" alt="SCS GO" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold gradient-text">SCS GO</span>
          </Link>

          {/* User Type Tabs */}
          <div className="flex gap-2 p-1 bg-secondary rounded-xl mb-6">
            <button onClick={() => { setUserType('user'); setOperatorStep(1); }}
              className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all',
                userType === 'user' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              <Users className="w-4 h-4" />{t('auth.userAccount')}
            </button>
            <button onClick={() => setUserType('operator')}
              className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all',
                userType === 'operator' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              <Building2 className="w-4 h-4" />{t('auth.operatorAccount')}
            </button>
          </div>

          {/* Step indicator for operator registration */}
          {userType === 'operator' && mode === 'register' && (
            <div className="flex items-center gap-2 mb-6">
              <div className={cn('flex-1 h-1 rounded-full', operatorStep >= 1 ? 'bg-primary' : 'bg-secondary')} />
              <div className={cn('flex-1 h-1 rounded-full', operatorStep >= 2 ? 'bg-primary' : 'bg-secondary')} />
              <span className="text-xs text-muted-foreground ml-2">{operatorStep}/2</span>
            </div>
          )}

          <h1 className="text-2xl font-bold mb-2">
            {mode === 'login' ? (userType === 'operator' ? t('auth.operatorLogin') : t('auth.login'))
              : userType === 'operator' ? (operatorStep === 1 ? t('auth.operatorRegister') : t('auth.stationInfo'))
              : t('auth.createAccount')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {mode === 'login' ? (userType === 'operator' ? t('auth.operatorLoginDesc') : t('auth.welcomeDesc'))
              : userType === 'operator' ? (operatorStep === 1 ? t('auth.operatorRegisterDesc') : t('auth.stationInfoDesc'))
              : t('auth.createAccountDesc')}
          </p>

          {/* Google Sign In - only for users */}
          {userType === 'user' && (
            <>
              <Button type="button" variant="outline" className="w-full mb-4" size="lg" onClick={handleGoogleSignIn} disabled={loading}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('auth.loginWithGoogle')}
              </Button>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {/* Step 1: Account Info */}
              {(userType === 'user' || operatorStep === 1) && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  {mode === 'register' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('auth.fullName')}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="name" placeholder="Nguyễn Văn A" value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="pl-10" required />
                        </div>
                      </div>
                      {userType === 'operator' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="businessName">{t('auth.businessName')}</Label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input id="businessName" placeholder="Công ty TNHH ABC" value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className="pl-10" required />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">{t('auth.phone')}</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+84</span>
                              <Input id="phone" type="tel" placeholder="912345678" value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="pl-12" required />
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
                      <Input id="email" type="email" placeholder="email@example.com" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t('auth.password')}</Label>
                      {mode === 'login' && <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t('auth.forgotPassword')}</Link>}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-10 pr-10" required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Station Info (Operator only) */}
              {userType === 'operator' && mode === 'register' && operatorStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('auth.stationName')}</Label>
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Trạm sạc ABC" value={stationData.name}
                        onChange={(e) => setStationData({ ...stationData, name: e.target.value })} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('auth.stationAddress')}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="123 Nguyễn Trãi, Hà Nội" value={stationData.address}
                        onChange={(e) => setStationData({ ...stationData, address: e.target.value })} className="pl-10" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{t('operator.form.latitude')}</Label>
                      <Input type="number" step="any" value={stationData.lat}
                        onChange={(e) => setStationData({ ...stationData, lat: parseFloat(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('operator.form.longitude')}</Label>
                      <Input type="number" step="any" value={stationData.lng}
                        onChange={(e) => setStationData({ ...stationData, lng: parseFloat(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="is24h" checked={stationData.is_24h}
                      onChange={(e) => setStationData({ ...stationData, is_24h: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-primary" />
                    <Label htmlFor="is24h" className="cursor-pointer">{t('operator.form.is24h')}</Label>
                  </div>
                  {!stationData.is_24h && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>{t('operator.form.openTime')}</Label>
                        <Input type="time" value={stationData.hours_open}
                          onChange={(e) => setStationData({ ...stationData, hours_open: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('operator.form.closeTime')}</Label>
                        <Input type="time" value={stationData.hours_close}
                          onChange={(e) => setStationData({ ...stationData, hours_close: e.target.value })} />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{t('operator.form.amenities')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map((a) => (
                        <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
                          className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all',
                            stationData.amenities.includes(a.id) ? 'bg-primary text-white border-primary' : 'bg-secondary border-border')}>
                          <a.icon className="w-3.5 h-3.5" />{a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chargers */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>{t('operator.form.chargers')}</Label>
                      <button type="button" onClick={addCharger} className="text-xs text-primary hover:underline">+ {t('operator.form.addCharger')}</button>
                    </div>
                    {stationData.chargers.map((charger, idx) => (
                      <div key={idx} className="p-3 bg-secondary/50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t('operator.form.charger')} #{idx + 1}</span>
                          {stationData.chargers.length > 1 && (
                            <button type="button" onClick={() => removeCharger(idx)} className="text-xs text-destructive">Xóa</button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <select value={charger.connector_type} onChange={(e) => updateCharger(idx, 'connector_type', e.target.value)}
                            className="px-2 py-1.5 bg-background border border-border rounded-lg text-sm">
                            {CONNECTOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <select value={charger.power_kw} onChange={(e) => updateCharger(idx, 'power_kw', parseInt(e.target.value))}
                            className="px-2 py-1.5 bg-background border border-border rounded-lg text-sm">
                            {POWER_OPTIONS.map(p => <option key={p} value={p}>{p} kW</option>)}
                          </select>
                          <Input type="number" value={charger.price_per_kwh} onChange={(e) => updateCharger(idx, 'price_per_kwh', parseInt(e.target.value))}
                            placeholder="đ/kWh" className="text-sm h-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              {userType === 'operator' && mode === 'register' && operatorStep === 2 && (
                <Button type="button" variant="outline" onClick={() => setOperatorStep(1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-1" />{t('common.back')}
                </Button>
              )}
              <Button variant="hero" className="flex-1" size="lg" disabled={loading}>
                {loading ? <span className="animate-pulse">{t('common.loading')}</span> : (
                  <>
                    {mode === 'login' ? t('auth.login') : (userType === 'operator' && operatorStep === 1 ? t('common.next') : t('auth.register'))}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setOperatorStep(1); }}
                className="text-primary font-medium hover:underline">
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

        <motion.div className="relative text-center max-w-md" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} key={userType}>
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg shadow-primary/30">
            <img src="/logo.jpg" alt="SCS GO" className="w-full h-full object-cover" />
          </div>

          {userType === 'user' ? (
            <>
              <h2 className="text-3xl font-bold mb-4">Sạc xe thông minh với <span className="gradient-text">SCS GO</span></h2>
              <p className="text-muted-foreground mb-8">Tìm trạm sạc tối ưu, đặt chỗ trước và không bao giờ phải chờ đợi.</p>
              <div className="space-y-3 text-left">
                {['AI gợi ý trạm phù hợp nhất', 'Dự đoán độ đông theo giờ', 'Đặt chỗ trước, hủy miễn phí', 'Hơn 150 trạm trên toàn quốc'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4">Quản lý trạm sạc với <span className="gradient-text">SCS GO</span></h2>
              <p className="text-muted-foreground mb-8">Nền tảng quản lý trạm sạc chuyên nghiệp, tăng doanh thu và tiếp cận khách hàng.</p>
              <div className="space-y-3 text-left">
                {['Đăng ký trạm sạc dễ dàng', 'Theo dõi đặt chỗ real-time', 'Thống kê doanh thu chi tiết', 'Rút tiền nhanh chóng, an toàn', 'Tiếp cận hàng nghìn khách hàng'].map((item, i) => (
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
