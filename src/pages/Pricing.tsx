import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  Users, 
  Building2,
  Crown,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PlanAudience = 'driver' | 'operator';

interface Plan {
  code: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  highlighted?: boolean;
  cta: string;
}

const driverPlans: Plan[] = [
  {
    code: 'driver_free',
    name: 'Free',
    price: '0đ',
    period: 'mãi mãi',
    description: 'Cho người dùng mới bắt đầu',
    cta: 'Bắt đầu miễn phí',
    features: [
      { text: 'Xem bản đồ và tìm trạm', included: true },
      { text: 'Bộ lọc cơ bản', included: true },
      { text: 'AI gợi ý Top 3 trạm', included: true },
      { text: '20 lượt AI/ngày', included: true },
      { text: '2 booking/tháng', included: true },
      { text: 'Dự đoán tổng quan', included: true },
      { text: '5 trạm yêu thích', included: true },
      { text: 'Chart dự đoán theo giờ', included: false },
      { text: 'Gợi ý giờ vàng', included: false },
      { text: 'AI giải thích chi tiết', included: false },
    ],
  },
  {
    code: 'driver_plus',
    name: 'Plus',
    price: '99.000đ',
    period: '/tháng',
    description: 'Cho người dùng thường xuyên',
    cta: 'Nâng cấp Plus',
    highlighted: true,
    features: [
      { text: 'Tất cả tính năng Free', included: true },
      { text: 'AI gợi ý Top 10 trạm', included: true },
      { text: '200 lượt AI/ngày', included: true },
      { text: '20 booking/tháng', included: true },
      { text: 'Chart dự đoán theo giờ', included: true },
      { text: 'Gợi ý giờ vàng', included: true },
      { text: 'Yêu thích không giới hạn', included: true },
      { text: 'Ưu tiên giữ chỗ', included: true },
      { text: 'AI giải thích chi tiết', included: false },
      { text: 'Analytics cá nhân', included: false },
    ],
  },
  {
    code: 'driver_pro',
    name: 'Pro',
    price: '249.000đ',
    period: '/tháng',
    description: 'Cho người dùng chuyên nghiệp',
    cta: 'Nâng cấp Pro',
    features: [
      { text: 'Tất cả tính năng Plus', included: true },
      { text: 'AI không giới hạn', included: true },
      { text: 'Booking không giới hạn', included: true },
      { text: 'AI giải thích tất cả factors', included: true },
      { text: 'Heatmap giờ cao điểm', included: true },
      { text: 'Analytics lịch sử sạc', included: true },
      { text: 'Export dữ liệu', included: true },
      { text: 'Hỗ trợ ưu tiên', included: true },
      { text: 'Early access tính năng mới', included: true },
      { text: 'Badge Pro trên hồ sơ', included: true },
    ],
  },
];

const operatorPlans: Plan[] = [
  {
    code: 'operator_free',
    name: 'Free',
    price: '0đ',
    period: 'mãi mãi',
    description: 'Cho chủ trạm nhỏ',
    cta: 'Bắt đầu miễn phí',
    features: [
      { text: 'Tạo 1 trạm sạc', included: true },
      { text: 'Tối đa 4 cổng sạc', included: true },
      { text: 'Quản lý booking cơ bản', included: true },
      { text: 'Thông báo booking mới', included: true },
      { text: 'Báo cáo nâng cao', included: false },
      { text: 'Export dữ liệu', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    code: 'operator_business',
    name: 'Business',
    price: '999.000đ',
    period: '/tháng',
    description: 'Cho doanh nghiệp vừa',
    cta: 'Nâng cấp Business',
    highlighted: true,
    features: [
      { text: 'Tạo 10 trạm sạc', included: true },
      { text: 'Tối đa 100 cổng sạc', included: true },
      { text: 'Quản lý booking nâng cao', included: true },
      { text: 'Báo cáo doanh thu', included: true },
      { text: 'Thống kê peak hours', included: true },
      { text: 'Export CSV', included: true },
      { text: 'Hỗ trợ email ưu tiên', included: true },
      { text: 'API access', included: false },
    ],
  },
  {
    code: 'operator_enterprise',
    name: 'Enterprise',
    price: 'Liên hệ',
    period: '',
    description: 'Cho doanh nghiệp lớn',
    cta: 'Liên hệ sales',
    features: [
      { text: 'Trạm & cổng không giới hạn', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Audit logs', included: true },
      { text: 'API access đầy đủ', included: true },
      { text: 'Webhook integrations', included: true },
      { text: 'White-label option', included: true },
      { text: 'SLA 99.9%', included: true },
      { text: 'Account manager riêng', included: true },
    ],
  },
];

export default function Pricing() {
  const [audience, setAudience] = useState<PlanAudience>('driver');
  const plans = audience === 'driver' ? driverPlans : operatorPlans;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Gói dịch vụ <span className="gradient-text">linh hoạt</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Chọn gói phù hợp với nhu cầu của bạn. Nâng cấp hoặc hạ cấp bất cứ lúc nào.
            </p>

            {/* Audience Toggle */}
            <div className="inline-flex items-center p-1 bg-secondary rounded-xl">
              <button
                onClick={() => setAudience('driver')}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all',
                  audience === 'driver' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Users className="w-4 h-4" />
                Cho tài xế
              </button>
              <button
                onClick={() => setAudience('operator')}
                className={cn(
                  'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all',
                  audience === 'operator' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Building2 className="w-4 h-4" />
                Cho chủ trạm
              </button>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.code}
                className={cn(
                  'card-premium p-6 relative',
                  plan.highlighted && 'border-primary glow-sm'
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Phổ biến nhất
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    {plan.code.includes('pro') || plan.code.includes('enterprise') ? (
                      <Crown className="w-6 h-6 text-primary" />
                    ) : plan.code.includes('plus') || plan.code.includes('business') ? (
                      <Zap className="w-6 h-6 text-primary" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-foreground">{plan.name}</h3>
                  <p className="text-sm text-foreground/60 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && (
                      <span className="text-foreground/60">{plan.period}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <div 
                      key={j}
                      className={cn(
                        'flex items-center gap-2 text-sm',
                        !feature.included && 'text-muted-foreground'
                      )}
                    >
                      {feature.included ? (
                        <Check className="w-4 h-4 text-success flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-foreground' : ''}>{feature.text}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={plan.highlighted ? 'hero' : 'outline'} 
                  className="w-full"
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div 
            className="mt-20 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-center mb-8">Câu hỏi thường gặp</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Tôi có thể hủy gói bất cứ lúc nào không?',
                  a: 'Có, bạn có thể hủy gói bất cứ lúc nào. Gói sẽ còn hiệu lực đến hết kỳ thanh toán hiện tại.',
                },
                {
                  q: 'Có thể nâng/hạ cấp gói không?',
                  a: 'Có, bạn có thể thay đổi gói bất cứ lúc nào. Phần chênh lệch sẽ được tính theo ngày sử dụng.',
                },
                {
                  q: 'Thanh toán bằng hình thức nào?',
                  a: 'Chúng tôi hỗ trợ thanh toán qua thẻ Visa/Mastercard, chuyển khoản ngân hàng, và các ví điện tử phổ biến.',
                },
                {
                  q: 'Gói Free có giới hạn thời gian không?',
                  a: 'Không, gói Free hoàn toàn miễn phí và không giới hạn thời gian sử dụng.',
                },
              ].map((faq, i) => (
                <div key={i} className="card-premium p-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">{faq.q}</p>
                      <p className="text-sm text-foreground/70">{faq.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground mb-4">
              Cần tư vấn thêm? Liên hệ với chúng tôi
            </p>
            <Button variant="outline" size="lg">
              Liên hệ hỗ trợ
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
