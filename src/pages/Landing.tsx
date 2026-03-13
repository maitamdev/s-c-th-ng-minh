// Landing - Premium marketing homepage for SCS GO EV charging platform
import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { InstallPWA } from '@/components/InstallPWA';
import { SEO } from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Zap,
  MapPin,
  Brain,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Shield,
  Search,
  Battery,
  Timer,
  TrendingDown,
  Star,
  ChevronDown,
  Wallet,
  RefreshCw,
  Crosshair,
  Users,
  Globe,
  Smartphone,
  BarChart3,
  Award,
  Play,
  ArrowUpRight,
  Quote,
  BadgeCheck,
  Bolt,
  Navigation,
  CreditCard,
  HeadphonesIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animated counter hook
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return { count, ref };
}

// Stats counter component
function StatCounter({ value, suffix = '', label, icon: Icon }: {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
}) {
  const { count, ref } = useCounter(value);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative group"
    >
      <div className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        <p className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          {count}{suffix}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const handleSearch = () => {
    navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        setSearchQuery(t('landing.search.myLocation'));
        navigate('/explore?nearby=true');
      });
    }
  };

  // Feature data for bento grid
  const features = [
    {
      icon: Brain,
      title: t('landing.steps.step2.title'),
      desc: t('landing.steps.step2.desc'),
      gradient: 'from-violet-500/20 to-purple-500/20',
      iconColor: 'text-violet-500',
      span: 'md:col-span-2',
    },
    {
      icon: MapPin,
      title: t('landing.map.title'),
      desc: t('landing.map.subtitle'),
      gradient: 'from-primary/20 to-cyan-500/20',
      iconColor: 'text-primary',
      span: '',
    },
    {
      icon: Clock,
      title: t('landing.steps.step3.title'),
      desc: t('landing.steps.step3.desc'),
      gradient: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-500',
      span: '',
    },
    {
      icon: Wallet,
      title: t('landing.pricing.title'),
      desc: t('landing.pricing.subtitle'),
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-500',
      span: 'md:col-span-2',
    },
  ];

  const whyDifferent = [
    {
      icon: Battery,
      title: t('landing.why.battery.title'),
      desc: t('landing.why.battery.desc'),
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      stat: '150kW',
      statLabel: 'DC Fast',
    },
    {
      icon: RefreshCw,
      title: t('landing.why.realtime.title'),
      desc: t('landing.why.realtime.desc'),
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
      stat: '99.2%',
      statLabel: 'Uptime',
    },
    {
      icon: TrendingDown,
      title: t('landing.why.compare.title'),
      desc: t('landing.why.compare.desc'),
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
      stat: '30%',
      statLabel: t('landing.impact.saved'),
    },
  ];

  const testimonials = [
    {
      name: 'Minh Tuấn',
      role: 'VinFast VF8 Owner',
      text: t('landing.testimonials.t1'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      rating: 5,
    },
    {
      name: 'Hà Linh',
      role: 'Tesla Model 3 Owner',
      text: t('landing.testimonials.t2'),
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      rating: 5,
    },
    {
      name: 'Đức Anh',
      role: 'Hyundai Ioniq 5 Owner',
      text: t('landing.testimonials.t3'),
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      rating: 5,
    },
  ];

  const trustedBy = [
    { icon: Zap, label: 'DC Fast Charging' },
    { icon: Battery, label: 'AC Level 2' },
    { icon: RefreshCw, label: 'CCS / CHAdeMO' },
    { icon: Smartphone, label: 'Type 2 / J1772' },
  ];

  return (
    <div className="min-h-screen bg-background pb-mobile-nav">
      <SEO />
      <Header />
      <InstallPWA />

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Parallax + Minimal Search
      ═══════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] animate-pulse animation-delay-500" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzgwODA4MCIgc3Ryb2tlLXdpZHRoPSIwLjMiIG9wYWNpdHk9IjAuMTUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        </div>

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="container mx-auto px-4 relative z-10 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">{t('landing.badge')}</span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-[1.1] tracking-tight">
                {t('landing.hero.title')}{' '}
                <span className="relative">
                  <span className="gradient-text">{t('landing.hero.highlight')}</span>
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                {t('landing.hero.subtitle')}
              </p>

              {/* Search Bar — Simplified */}
              <div className="bg-card/80 backdrop-blur-xl rounded-2xl p-4 border border-border/60 shadow-2xl shadow-black/5 mb-6">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="VD: Quận 1, TP.HCM / Hà Nội..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full pl-12 pr-12 py-4 bg-secondary/50 border border-border/40 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    />
                    <button
                      onClick={useMyLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/10 rounded-lg transition-colors group"
                      title={t('landing.search.useLocation')}
                    >
                      <Crosshair className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="px-8 py-4 h-auto bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {t('landing.search.button')}
                  </Button>
                </div>

                {/* Quick tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Bình Dương'].map((city) => (
                    <button
                      key={city}
                      onClick={() => { setSearchQuery(city); navigate(`/explore?q=${city}`); }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-secondary/60 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/40 hover:border-primary/30 transition-all"
                    >
                      {city}
                    </button>
                  ))}
                  <button
                    onClick={() => navigate('/explore?ai=true')}
                    className="px-3 py-1.5 text-xs rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {t('landing.filters.aiRecommend')}
                  </button>
                </div>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
                  ].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-9 h-9 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                    <span className="text-sm font-medium text-foreground ml-1">4.9</span>
                  </div>
                  <p className="text-xs text-muted-foreground">25,000+ {t('landing.stats.searches')}</p>
                </div>
              </div>
            </motion.div>

            {/* Right — Animated Logo + Floating Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex items-center justify-center"
            >
              {/* Glow */}
              <motion.div
                className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-primary/20 to-cyan-500/20 blur-[80px]"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Rotating orbit ring */}
              <motion.div
                className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border border-dashed border-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />

              {/* Logo */}
              <motion.div
                className="relative z-10"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl transform scale-110" />
                  <img
                    src="/logo.jpg"
                    alt="SCS Go Logo"
                    className="relative w-44 h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain rounded-3xl shadow-2xl shadow-primary/25"
                  />
                  {/* Shine */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/15 to-transparent"
                    animate={{ opacity: [0, 0.4, 0], x: [-80, 80] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                  />
                </div>

                {/* Floating badge — top right */}
                <motion.div
                  className="absolute -top-3 -right-6 bg-card/90 backdrop-blur-sm border border-primary/30 rounded-xl px-3 py-2 shadow-lg"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">150kW</p>
                      <p className="text-[10px] text-muted-foreground">DC Fast</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating badge — bottom left */}
                <motion.div
                  className="absolute -bottom-2 -left-6 bg-card/90 backdrop-blur-sm border border-emerald-500/30 rounded-xl px-3 py-2 shadow-lg"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{t('landing.trust.verified')}</p>
                      <p className="text-[10px] text-muted-foreground">99.2% uptime</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          <span className="text-muted-foreground text-xs font-medium">{t('landing.scroll')}</span>
          <ChevronDown className="w-5 h-5 text-primary" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS — Single consolidated section
      ═══════════════════════════════════════════════ */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCounter value={150} suffix="+" label={t('landing.stats.stations')} icon={MapPin} />
            <StatCounter value={500} suffix="+" label={t('landing.stats.ports')} icon={Zap} />
            <StatCounter value={25} suffix="K+" label={t('landing.stats.searches')} icon={Search} />
            <StatCounter value={93} suffix="%" label={t('landing.impact.findRate')} icon={CheckCircle2} />
          </div>
          <p className="text-center text-muted-foreground/60 text-xs mt-6">{t('landing.stats.updated')}</p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TRUSTED BY — Connector types & trust signals
      ═══════════════════════════════════════════════ */}
      <section className="py-12 border-y border-border/40">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground/80 text-sm font-medium mb-8 uppercase tracking-wider">
            {t('landing.trust.title')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {trustedBy.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2.5 px-5 py-3 bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium text-sm">{item.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: Shield, text: t('landing.trust.secure') },
              { icon: Clock, text: t('landing.trust.support') },
              { icon: BadgeCheck, text: t('landing.trust.verified') },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-muted-foreground text-sm">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          HOW IT WORKS — 3 Steps with connected flow
      ═══════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Play className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('landing.steps.title')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('landing.steps.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('landing.steps.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-[4.5rem] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />

            {[
              { icon: MapPin, title: t('landing.steps.step1.title'), desc: t('landing.steps.step1.desc') },
              { icon: Brain, title: t('landing.steps.step2.title'), desc: t('landing.steps.step2.desc') },
              { icon: Wallet, title: t('landing.steps.step3.title'), desc: t('landing.steps.step3.desc') },
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative text-center group"
              >
                {/* Step number */}
                <div className="relative z-20 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
                  <step.icon className="w-9 h-9 text-white" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{idx + 1}</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES — Bento Grid Layout
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('landing.why.title')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('landing.why.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('landing.why.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "group relative bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500",
                  feature.span
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300",
                  feature.gradient
                )}>
                  <feature.icon className={cn("w-7 h-7", feature.iconColor)} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WHY DIFFERENT — Image Cards with Stats
      ═══════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('landing.why.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('landing.why.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {whyDifferent.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                {/* Image with overlay */}
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Floating stat badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{item.stat}</p>
                      <p className="text-white/70 text-xs">{item.statLabel}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          CHARGING GALLERY — Hover reveal cards
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Bolt className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Network</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('landing.map.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t('landing.map.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {[
              {
                image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
                title: 'DC Fast Charging',
                desc: '150kW+',
                icon: Zap,
              },
              {
                image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
                title: 'Smart Station',
                desc: 'IoT Connected',
                icon: Smartphone,
              },
              {
                image: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&q=80',
                title: 'Public Access',
                desc: '24/7',
                icon: Globe,
              },
              {
                image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&q=80',
                title: 'Premium',
                desc: 'VIP Service',
                icon: Award,
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/40 transition-all duration-500 cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                {/* Always visible info */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{item.title}</h3>
                      <p className="text-white/70 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Button
              onClick={() => navigate('/explore')}
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 px-6 rounded-xl"
            >
              {t('landing.map.cta')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS — Premium review cards
      ═══════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('landing.testimonials.title')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-muted-foreground text-lg">{t('landing.testimonials.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-border/50 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                {/* Quote icon */}
                <Quote className="w-10 h-10 text-primary/15 absolute top-6 right-6" />

                {/* Stars */}
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-foreground/90 mb-6 leading-relaxed text-[15px]">
                  &ldquo;{item.text}&rdquo;
                </p>

                {/* User */}
                <div className="flex items-center gap-4 pt-5 border-t border-border/40">
                  <div className="relative">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                      loading="lazy"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-card flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{item.name}</p>
                    <p className="text-muted-foreground text-sm">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PRICING — Polished tier cards
      ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t('landing.pricing.title')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t('landing.pricing.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('landing.pricing.free.name')}</h3>
              <p className="text-4xl font-bold text-foreground mb-1">
                0đ
              </p>
              <p className="text-muted-foreground text-sm mb-6">/{t('landing.pricing.month')}</p>
              <ul className="space-y-3 mb-8">
                {['search', 'basic', 'ads'].map(key => (
                  <li key={key} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t(`landing.pricing.free.${key}` as keyof typeof import('@/lib/translations').translations.vi)}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full border-border/60 text-foreground hover:bg-secondary rounded-xl h-12"
              >
                {t('landing.pricing.free.cta')}
              </Button>
            </motion.div>

            {/* Pro — Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative bg-gradient-to-b from-primary/15 to-card/80 backdrop-blur-sm rounded-2xl p-7 border-2 border-primary/50 shadow-xl shadow-primary/10 md:-mt-4 md:mb-[-1rem]"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary to-cyan-500 rounded-full text-white text-xs font-semibold shadow-lg">
                ⭐ {t('landing.pricing.popular')}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 mt-2">{t('landing.pricing.pro.name')}</h3>
              <p className="text-4xl font-bold text-foreground mb-1">
                49K
              </p>
              <p className="text-muted-foreground text-sm mb-6">/{t('landing.pricing.month')}</p>
              <ul className="space-y-3 mb-8">
                {['unlimited', 'ai', 'booking', 'noads'].map(key => (
                  <li key={key} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t(`landing.pricing.pro.${key}` as keyof typeof import('@/lib/translations').translations.vi)}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-white rounded-xl h-12 shadow-lg shadow-primary/25">
                {t('landing.pricing.pro.cta')}
              </Button>
            </motion.div>

            {/* Business */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('landing.pricing.business.name')}</h3>
              <p className="text-4xl font-bold text-foreground mb-1">
                {t('landing.pricing.business.price')}
              </p>
              <p className="text-muted-foreground text-sm mb-6">&nbsp;</p>
              <ul className="space-y-3 mb-8">
                {['fleet', 'api', 'support', 'custom'].map(key => (
                  <li key={key} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{t(`landing.pricing.business.${key}` as keyof typeof import('@/lib/translations').translations.vi)}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                className="w-full border-border/60 text-foreground hover:bg-secondary rounded-xl h-12"
              >
                {t('landing.pricing.business.cta')}
              </Button>
            </motion.div>
          </div>

          <div className="text-center mt-10">
            <Link to="/pricing" className="text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium">
              {t('landing.pricing.viewAll')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINAL CTA — Conversion section
      ═══════════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1920&q=80"
            alt="EV Charging Background"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/75 to-black/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-transparent" />
        </div>

        {/* Subtle particles */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-primary/40 rounded-full"
              style={{
                top: `${15 + Math.random() * 70}%`,
                left: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                y: [0, -25, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-white font-medium">100% {t('landing.pricing.free.name')}</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              {t('landing.finalCta.title')}
            </h2>
            <p className="text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('landing.finalCta.subtitle')}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Button
                onClick={() => navigate('/explore')}
                className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-white px-10 py-6 h-auto rounded-xl font-semibold text-lg shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all hover:scale-105 active:scale-100"
              >
                <Zap className="w-5 h-5 mr-2" />
                {t('landing.finalCta.primary')}
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="border-2 border-white/25 bg-white/5 backdrop-blur-sm hover:bg-white/15 text-white px-10 py-6 h-auto rounded-xl font-semibold text-lg"
              >
                {t('landing.pricing.free.cta')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Bottom stats */}
            <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
              {[
                { value: '150+', label: t('landing.stats.stations') },
                { value: '500+', label: t('landing.stats.ports') },
                { value: '25K+', label: t('landing.stats.searches') },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
