import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock subscription data
const currentPlan = {
  code: 'driver_plus',
  name: 'Plus',
  price: '99.000đ',
  period: '/tháng',
  renewDate: '15/02/2024',
};

const usage = {
  aiCalls: { used: 45, limit: 200 },
  bookings: { used: 8, limit: 20 },
  favorites: { used: 5, limit: -1 }, // -1 = unlimited
};

const features = [
  { icon: Sparkles, label: 'AI gợi ý Top 10', included: true },
  { icon: Brain, label: '200 lượt AI/ngày', included: true },
  { icon: Calendar, label: '20 booking/tháng', included: true },
  { icon: TrendingUp, label: 'Chart dự đoán', included: true },
  { icon: Heart, label: 'Yêu thích không giới hạn', included: true },
  { icon: Zap, label: 'Ưu tiên giữ chỗ', included: true },
];

export default function Subscription() {
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Crown className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Gói {currentPlan.name}</h2>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    Đang hoạt động
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {currentPlan.price}{currentPlan.period}
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/pricing">
                Nâng cấp
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-success flex-shrink-0" />
                <span className="text-foreground">{feature.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Gia hạn tiếp theo: <span className="text-foreground font-medium">{currentPlan.renewDate}</span>
            </p>
          </div>
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
                <span className="text-sm text-foreground">Lượt AI gợi ý</span>
                <span className="text-sm font-medium text-foreground">
                  {usage.aiCalls.used} / {usage.aiCalls.limit}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(usage.aiCalls.used / usage.aiCalls.limit) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">Booking</span>
                <span className="text-sm font-medium text-foreground">
                  {usage.bookings.used} / {usage.bookings.limit}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(usage.bookings.used / usage.bookings.limit) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">Yêu thích</span>
                <span className="text-sm font-medium text-foreground">
                  {usage.favorites.used} / Không giới hạn
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full w-full" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upgrade CTA */}
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
                Nâng cấp lên Pro để có AI không giới hạn và analytics nâng cao
              </p>
            </div>
            <Button variant="hero" asChild>
              <Link to="/pricing">
                Xem gói Pro
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
