import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useFavorites } from '@/hooks/useFavorites';
import { 
  Crown,
  Zap,
  Sparkles,
  Check,
  ArrowRight,
  Calendar,
  Brain,
  Heart,
  TrendingUp,
  Loader2,
  Gift,
} from 'lucide-react';

// Plan definitions
const PLANS = {
  free: {
    name: 'Miễn phí',
    price: '0đ',
    period: '/tháng',
    limits: { aiCalls: 10, bookings: 5, favorites: 10 },
    features: [
      'AI gợi ý Top 3',
      '10 lượt AI/ngày',
      '5 booking/tháng',
      '10 yêu thích',
    ],
  },
  plus: {
    name: 'Plus',
    price: '99.000đ',
    period: '/tháng',
    limits: { aiCalls: 200, bookings: 20, favorites: -1 },
    features: [
      'AI gợi ý Top 10',
      '200 lượt AI/ngày',
      '20 booking/tháng',
      'Chart dự đoán',
      'Yêu thích không giới hạn',
      'Ưu tiên giữ chỗ',
    ],
  },
  pro: {
    name: 'Pro',
    price: '199.000đ',
    period: '/tháng',
    limits: { aiCalls: -1, bookings: -1, favorites: -1 },
    features: [
      'AI không giới hạn',
      'Booking không giới hạn',
      'Analytics nâng cao',
      'Hỗ trợ ưu tiên',
      'API access',
      'Tất cả tính năng Plus',
    ],
  },
};

export default function Subscription() {
  const { user } = useAuth();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { favorites, loading: favoritesLoading } = useFavorites();
  
  // Get current plan from user data (default to free)
  const planCode = user?.profile?.subscription_plan || 'free';
  const currentPlan = PLANS[planCode as keyof typeof PLANS] || PLANS.free;
  
  // Calculate usage from real data
  const currentMonth = new Date().toISOString().slice(0, 7); // "2024-12"
  const monthlyBookings = bookings.filter(b => 
    b.created_at.startsWith(currentMonth) && b.status !== 'cancelled'
  ).length;
  
  const usage = {
    aiCalls: { used: user?.profile?.ai_calls_today || 0, limit: currentPlan.limits.aiCalls },
    bookings: { used: monthlyBookings, limit: currentPlan.limits.bookings },
    favorites: { used: favorites.length, limit: currentPlan.limits.favorites },
  };

  // Calculate renewal date (30 days from subscription start or current date)
  const subscriptionStart = user?.profile?.subscription_start || new Date().toISOString();
  const renewDate = new Date(subscriptionStart);
  renewDate.setMonth(renewDate.getMonth() + 1);
  const renewDateStr = renewDate.toLocaleDateString('vi-VN');

  const loading = bookingsLoading || favoritesLoading;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gói dịch vụ</h1>
          <p className="text-muted-foreground">Quản lý gói đăng ký của bạn</p>
        </div>

        {/* Current Plan */}
        <motion.div 
          className="card-premium p-6 border-primary glow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                planCode === 'free' 
                  ? 'bg-muted' 
                  : 'bg-gradient-to-br from-primary to-cyan-400'
              }`}>
                {planCode === 'free' ? (
                  <Gift className="w-7 h-7 text-muted-foreground" />
                ) : (
                  <Crown className="w-7 h-7 text-primary-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Gói {currentPlan.name}</h2>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    planCode === 'free'
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {planCode === 'free' ? 'Cơ bản' : 'Đang hoạt động'}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {currentPlan.price}{currentPlan.period}
                </p>
              </div>
            </div>
            {planCode !== 'pro' && (
              <Button variant="outline" asChild>
                <Link to="/pricing">
                  Nâng cấp
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {currentPlan.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {planCode !== 'free' && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Gia hạn tiếp theo: <span className="text-foreground font-medium">{renewDateStr}</span>
              </p>
            </div>
          )}
        </motion.div>

        {/* Usage */}
        <motion.div 
          className="card-premium p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-foreground mb-4">Sử dụng tháng này</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Lượt AI gợi ý (hôm nay)
                </span>
                <span className="text-sm font-medium text-foreground">
                  {usage.aiCalls.used} / {usage.aiCalls.limit === -1 ? '∞' : usage.aiCalls.limit}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ 
                    width: usage.aiCalls.limit === -1 
                      ? '100%' 
                      : `${Math.min((usage.aiCalls.used / usage.aiCalls.limit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Booking
                </span>
                <span className="text-sm font-medium text-foreground">
                  {usage.bookings.used} / {usage.bookings.limit === -1 ? '∞' : usage.bookings.limit}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ 
                    width: usage.bookings.limit === -1 
                      ? '100%' 
                      : `${Math.min((usage.bookings.used / usage.bookings.limit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Yêu thích
                </span>
                <span className="text-sm font-medium text-foreground">
                  {usage.favorites.used} / {usage.favorites.limit === -1 ? '∞' : usage.favorites.limit}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    usage.favorites.limit === -1 ? 'bg-success w-full' : 'bg-primary'
                  }`}
                  style={{ 
                    width: usage.favorites.limit === -1 
                      ? '100%' 
                      : `${Math.min((usage.favorites.used / usage.favorites.limit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upgrade CTA */}
        {planCode !== 'pro' && (
          <motion.div 
            className="card-premium p-6 bg-gradient-to-r from-primary/10 to-cyan-500/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Cần thêm tính năng?</h3>
                <p className="text-sm text-muted-foreground">
                  {planCode === 'free' 
                    ? 'Nâng cấp lên Plus để có thêm AI gợi ý và booking'
                    : 'Nâng cấp lên Pro để có AI không giới hạn và analytics nâng cao'
                  }
                </p>
              </div>
              <Button variant="hero" asChild>
                <Link to="/pricing">
                  Xem gói {planCode === 'free' ? 'Plus' : 'Pro'}
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
