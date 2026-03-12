// Pricing - Subscription plan comparison and selection
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
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

interface PlanFeature {
  key: string;
  included: boolean;
}

interface Plan {
  code: string;
  name: string;
  price: string;
  periodKey: string;
  descKey: string;
  features: PlanFeature[];
  highlighted?: boolean;
  ctaKey: string;
}

const driverPlans: Plan[] = [
  {
    code: 'driver_free',
    name: 'Free',
    price: '0đ',
    periodKey: 'pricing.forever',
    descKey: 'pricing.driver.free.desc',
    ctaKey: 'pricing.driver.free.cta',
    features: [
      { key: 'pricing.feature.viewMap', included: true },
      { key: 'pricing.feature.basicFilter', included: true },
      { key: 'pricing.feature.aiTop3', included: true },
      { key: 'pricing.feature.ai20', included: true },
      { key: 'pricing.feature.booking2', included: true },
      { key: 'pricing.feature.overviewPrediction', included: true },
      { key: 'pricing.feature.fav5', included: true },
      { key: 'pricing.feature.hourlyChart', included: false },
      { key: 'pricing.feature.goldenHour', included: false },
      { key: 'pricing.feature.aiExplain', included: false },
    ],
  },
  {
    code: 'driver_plus',
    name: 'Plus',
    price: '99.000đ',
    periodKey: 'pricing.perMonth',
    descKey: 'pricing.driver.plus.desc',
    ctaKey: 'pricing.driver.plus.cta',
    highlighted: true,
    features: [
      { key: 'pricing.feature.allFree', included: true },
      { key: 'pricing.feature.aiTop10', included: true },
      { key: 'pricing.feature.ai200', included: true },
      { key: 'pricing.feature.booking20', included: true },
      { key: 'pricing.feature.hourlyChart', included: true },
      { key: 'pricing.feature.goldenHour', included: true },
      { key: 'pricing.feature.unlimitedFav', included: true },
      { key: 'pricing.feature.priorityBooking', included: true },
      { key: 'pricing.feature.aiExplain', included: false },
      { key: 'pricing.feature.personalAnalytics', included: false },
    ],
  },
  {
    code: 'driver_pro',
    name: 'Pro',
    price: '249.000đ',
    periodKey: 'pricing.perMonth',
    descKey: 'pricing.driver.pro.desc',
    ctaKey: 'pricing.driver.pro.cta',
    features: [
      { key: 'pricing.feature.allPlus', included: true },
      { key: 'pricing.feature.unlimitedAI', included: true },
      { key: 'pricing.feature.unlimitedBooking', included: true },
      { key: 'pricing.feature.aiAllFactors', included: true },
      { key: 'pricing.feature.heatmap', included: true },
      { key: 'pricing.feature.historyAnalytics', included: true },
      { key: 'pricing.feature.exportData', included: true },
      { key: 'pricing.feature.prioritySupport', included: true },
      { key: 'pricing.feature.earlyAccess', included: true },
      { key: 'pricing.feature.proBadge', included: true },
    ],
  },
];

const operatorPlans: Plan[] = [
  {
    code: 'operator_free',
    name: 'Free',
    price: '0đ',
    periodKey: 'pricing.forever',
    descKey: 'pricing.operator.free.desc',
    ctaKey: 'pricing.operator.free.cta',
    features: [
      { key: 'pricing.feature.create1Station', included: true },
      { key: 'pricing.feature.max4Chargers', included: true },
      { key: 'pricing.feature.basicBookingMgmt', included: true },
      { key: 'pricing.feature.newBookingNotif', included: true },
      { key: 'pricing.feature.advancedReport', included: false },
      { key: 'pricing.feature.exportData', included: false },
      { key: 'pricing.feature.apiAccess', included: false },
    ],
  },
  {
    code: 'operator_business',
    name: 'Business',
    price: '999.000đ',
    periodKey: 'pricing.perMonth',
    descKey: 'pricing.operator.business.desc',
    ctaKey: 'pricing.operator.business.cta',
    highlighted: true,
    features: [
      { key: 'pricing.feature.create10Stations', included: true },
      { key: 'pricing.feature.max100Chargers', included: true },
      { key: 'pricing.feature.advancedBookingMgmt', included: true },
      { key: 'pricing.feature.revenueReport', included: true },
      { key: 'pricing.feature.peakHoursStats', included: true },
      { key: 'pricing.feature.exportCSV', included: true },
      { key: 'pricing.feature.priorityEmail', included: true },
      { key: 'pricing.feature.apiAccess', included: false },
    ],
  },
  {
    code: 'operator_enterprise',
    name: 'Enterprise',
    price: '',
    periodKey: 'pricing.contact',
    descKey: 'pricing.operator.enterprise.desc',
    ctaKey: 'pricing.operator.enterprise.cta',
    features: [
      { key: 'pricing.feature.unlimitedStations', included: true },
      { key: 'pricing.feature.advancedAnalytics', included: true },
      { key: 'pricing.feature.auditLogs', included: true },
      { key: 'pricing.feature.fullApiAccess', included: true },
      { key: 'pricing.feature.webhooks', included: true },
      { key: 'pricing.feature.whiteLabel', included: true },
      { key: 'pricing.feature.sla', included: true },
      { key: 'pricing.feature.accountManager', included: true },
    ],
  },
];

const faqKeys = [
  { qKey: 'pricing.faq.cancel.q', aKey: 'pricing.faq.cancel.a' },
  { qKey: 'pricing.faq.upgrade.q', aKey: 'pricing.faq.upgrade.a' },
  { qKey: 'pricing.faq.payment.q', aKey: 'pricing.faq.payment.a' },
  { qKey: 'pricing.faq.freeLimit.q', aKey: 'pricing.faq.freeLimit.a' },
];

export default function Pricing() {
  const [audience, setAudience] = useState<PlanAudience>('driver');
  const { t } = useLanguage();
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
              {t('pricing.title')} <span className="gradient-text">{t('common.free')}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('pricing.subtitle')}
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
                {t('pricing.forDrivers')}
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
                {t('pricing.forOperators')}
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
                    {t('pricing.popular')}
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
                  <p className="text-sm text-foreground/60 mb-4">{t(plan.descKey as keyof typeof t)}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price || t(plan.periodKey as keyof typeof t)}</span>
                    {plan.price && (
                      <span className="text-foreground/60">{t(plan.periodKey as keyof typeof t)}</span>
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
                      <span className={feature.included ? 'text-foreground' : ''}>{t(feature.key as keyof typeof t)}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={plan.highlighted ? 'hero' : 'outline'} 
                  className="w-full"
                >
                  {t(plan.ctaKey as keyof typeof t)}
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
            <h2 className="text-2xl font-bold text-center mb-8">{t('pricing.faq')}</h2>
            <div className="space-y-4">
              {faqKeys.map((faq, i) => (
                <div key={i} className="card-premium p-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">{t(faq.qKey as keyof typeof t)}</p>
                      <p className="text-sm text-foreground/70">{t(faq.aKey as keyof typeof t)}</p>
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
              {t('pricing.needHelp')}
            </p>
            <Button variant="outline" size="lg">
              {t('pricing.contactSupport')}
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
