import { useState } from 'react';
import { motion } from 'framer-motion';
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
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Landing() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<'5' | '10' | '20'>('10');
  const [powerFilter, setPowerFilter] = useState<'60' | '120' | 'all'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = () => {
    navigate(`/explore?q=${encodeURIComponent(searchQuery)}&distance=${distanceFilter}&power=${powerFilter}`);
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

  const stats = [
    { value: '150+', label: t('landing.stats.stations'), icon: MapPin },
    { value: '500+', label: t('landing.stats.ports'), icon: Zap },
    { value: '25K+', label: t('landing.stats.searches'), icon: Search },
    { value: '99.2%', label: 'Uptime', icon: RefreshCw },
  ];

  const impactStats = [
    { icon: Timer, value: '12 ' + t('landing.impact.minutes'), label: t('landing.impact.saved') },
    { icon: CheckCircle2, value: '93%', label: t('landing.impact.findRate') },
  ];

  const steps = [
    { icon: MapPin, title: t('landing.steps.step1.title'), desc: t('landing.steps.step1.desc') },
    { icon: Brain, title: t('landing.steps.step2.title'), desc: t('landing.steps.step2.desc') },
    { icon: Wallet, title: t('landing.steps.step3.title'), desc: t('landing.steps.step3.desc') },
  ];

  const whyDifferent = [
    { icon: Battery, title: t('landing.why.battery.title'), desc: t('landing.why.battery.desc') },
    { icon: RefreshCw, title: t('landing.why.realtime.title'), desc: t('landing.why.realtime.desc') },
    { icon: TrendingDown, title: t('landing.why.compare.title'), desc: t('landing.why.compare.desc') },
  ];

  const testimonials = [
    { name: 'Minh Tuấn', role: 'VinFast VF8', text: t('landing.testimonials.t1') },
    { name: 'Hà Linh', role: 'Tesla Model 3', text: t('landing.testimonials.t2') },
    { name: 'Đức Anh', role: 'Hyundai Ioniq 5', text: t('landing.testimonials.t3') },
  ];


  return (
    <div className="min-h-screen bg-background pb-mobile-nav">
      <SEO />
      <Header />
      <InstallPWA />

      {/* HERO SECTION with Quick Search */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content + Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary">{t('landing.badge')}</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight whitespace-nowrap">
                {t('landing.hero.title')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                  {t('landing.hero.highlight')}
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-6 max-w-xl">
                {t('landing.hero.subtitle')}
              </p>

              {/* Quick Search Bar - IMPROVED */}
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border mb-4 shadow-xl">
                {/* Search input with location button */}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="VD: Quận 1, TP.HCM / Hà Nội / Bình Dương..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-12 py-4 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base"
                    />
                    <button
                      onClick={useMyLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-lg transition-colors group"
                      title={t('landing.search.useLocation')}
                    >
                      <Crosshair className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="px-8 py-4 h-auto bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {t('landing.search.button')}
                  </Button>
                </div>

                {/* Segmented filters - cleaner */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Distance filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">{t('landing.filters.distance')}:</span>
                    <div className="flex bg-secondary rounded-lg p-1">
                      {(['5', '10', '20'] as const).map(d => (
                        <button
                          key={d}
                          onClick={() => setDistanceFilter(d)}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            distanceFilter === d
                              ? "bg-primary text-white"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {d}km
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Power filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">{t('landing.filters.power')}:</span>
                    <div className="flex bg-secondary rounded-lg p-1">
                      {([
                        { value: 'all', label: t('landing.filters.all') },
                        { value: '60', label: '≥60kW' },
                        { value: '120', label: '≥120kW' },
                      ] as const).map(p => (
                        <button
                          key={p.value}
                          onClick={() => setPowerFilter(p.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            powerFilter === p.value
                              ? "bg-primary text-white"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced filters button */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    {t('landing.filters.advanced')}
                  </button>
                </div>

                {/* Advanced filters drawer */}
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3"
                  >
                    {[
                      { id: 'available', label: t('landing.filters.available') },
                      { id: 'cheap', label: t('landing.filters.cheap') },
                      { id: 'vinfast', label: 'VinFast' },
                      { id: 'evn', label: 'EVN' },
                    ].map(filter => (
                      <button
                        key={filter.id}
                        className="px-3 py-1.5 rounded-full text-sm bg-secondary text-muted-foreground hover:bg-primary hover:text-white transition-all"
                      >
                        {filter.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Single primary CTA */}
              <Button
                onClick={() => navigate('/explore')}
                size="lg"
                className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-white px-8 py-4 h-auto rounded-xl font-semibold shadow-lg shadow-primary/25"
              >
                <MapPin className="w-5 h-5 mr-2" />
                {t('landing.cta.explore')}
              </Button>
            </motion.div>

            {/* Right: Animated Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              {/* Glow effect behind logo */}
              <motion.div
                className="absolute w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-primary/30 to-cyan-500/30 blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Rotating ring */}
              <motion.div
                className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border-2 border-dashed border-primary/30"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Second rotating ring (opposite direction) */}
              <motion.div
                className="absolute w-64 h-64 md:w-72 md:h-72 rounded-full border border-cyan-500/20"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}

              {/* Main logo container */}
              <motion.div
                className="relative z-10"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Logo shadow/glow */}
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl transform scale-110" />

                  {/* Logo image */}
                  <motion.img
                    src="/logo.jpg"
                    alt="SCS Go Logo"
                    className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain rounded-3xl shadow-2xl shadow-primary/30"
                    initial={{ rotateY: 0 }}
                    animate={{
                      rotateY: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                    animate={{
                      opacity: [0, 0.5, 0],
                      x: [-100, 100],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>

                {/* Zap icons floating around */}
                <motion.div
                  className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Zap className="w-5 h-5 text-white" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg"
                  animate={{
                    scale: [1, 1.15, 1],
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <MapPin className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator - more visible */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-muted-foreground text-xs">{t('landing.scroll')}</span>
          <ChevronDown className="w-6 h-6 text-primary" />
        </motion.div>
      </section>


      {/* STATS BAR */}
      <section className="py-8 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
                </div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-muted-foreground/70 text-xs mt-4">{t('landing.stats.updated')}</p>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="py-8 bg-gradient-to-r from-primary/10 to-cyan-500/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-12">
            {impactStats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR - neutral logos */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground text-sm mb-6">{t('landing.trust.title')}</p>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {[
              { icon: Zap, label: 'DC Fast' },
              { icon: Battery, label: 'AC Level 2' },
              { icon: RefreshCw, label: 'CCS/CHAdeMO' },
              { icon: MapPin, label: 'Type 2' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 px-5 py-2.5 bg-secondary/50 rounded-lg border border-border">
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium text-sm">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { icon: Shield, text: t('landing.trust.secure') },
              { icon: Clock, text: t('landing.trust.support') },
              { icon: CheckCircle2, text: t('landing.trust.verified') },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-muted-foreground text-sm">
                <item.icon className="w-4 h-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 STEPS SECTION */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('landing.steps.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('landing.steps.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                <div className="bg-card/50 rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY DIFFERENT SECTION */}
      <section className="py-20 bg-gradient-to-b from-secondary/30 to-secondary/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('landing.why.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('landing.why.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {whyDifferent.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card/50 rounded-2xl p-6 border border-border hover:border-primary/30 transition-all hover:bg-card/80"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* MAP PREVIEW SECTION */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('landing.map.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('landing.map.subtitle')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="bg-card/50 rounded-3xl overflow-hidden border border-border">
              <div className="aspect-video bg-gradient-to-br from-secondary to-secondary/80 relative">
                <div className="absolute inset-0 opacity-30">
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMyIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />
                </div>

                {[
                  { top: '30%', left: '25%' },
                  { top: '45%', left: '55%' },
                  { top: '60%', left: '35%' },
                  { top: '25%', left: '70%' },
                  { top: '70%', left: '65%' },
                ].map((pos, idx) => (
                  <motion.div
                    key={idx}
                    className="absolute"
                    style={{ top: pos.top, left: pos.left }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                    </div>
                  </motion.div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => navigate('/explore')}
                    className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-medium shadow-lg shadow-primary/20"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    {t('landing.map.cta')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-gradient-to-b from-secondary/50 to-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('landing.testimonials.title')}</h2>
            <p className="text-muted-foreground">{t('landing.testimonials.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card/50 rounded-2xl p-6 border border-border"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{item.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="text-foreground font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-sm">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('landing.pricing.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('landing.pricing.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card/50 rounded-2xl p-6 border border-border"
            >
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('landing.pricing.free.name')}</h3>
              <p className="text-3xl font-bold text-foreground mb-4">0đ<span className="text-muted-foreground text-base font-normal">/{t('landing.pricing.month')}</span></p>
              <ul className="space-y-3 mb-6">
                {['search', 'basic', 'ads'].map(key => (
                  <li key={key} className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t(`landing.pricing.free.${key}` as keyof typeof import('@/lib/translations').translations.vi)}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
                {t('landing.pricing.free.cta')}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-b from-primary/20 to-card/50 rounded-2xl p-6 border border-primary/50 relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary rounded-full text-white text-xs font-medium">
                {t('landing.pricing.popular')}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('landing.pricing.pro.name')}</h3>
              <p className="text-3xl font-bold text-foreground mb-4">49K<span className="text-muted-foreground text-base font-normal">/{t('landing.pricing.month')}</span></p>
              <ul className="space-y-3 mb-6">
                {['unlimited', 'ai', 'booking', 'noads'].map(key => (
                  <li key={key} className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t(`landing.pricing.pro.${key}` as keyof typeof import('@/lib/translations').translations.vi)}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-white">
                {t('landing.pricing.pro.cta')}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card/50 rounded-2xl p-6 border border-border"
            >
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('landing.pricing.business.name')}</h3>
              <p className="text-3xl font-bold text-foreground mb-4">{t('landing.pricing.business.price')}</p>
              <ul className="space-y-3 mb-6">
                {['fleet', 'api', 'support', 'custom'].map(key => (
                  <li key={key} className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {t(`landing.pricing.business.${key}` as keyof typeof import('@/lib/translations').translations.vi)}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary">
                {t('landing.pricing.business.cta')}
              </Button>
            </motion.div>
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing" className="text-primary hover:text-primary/80 inline-flex items-center gap-1">
              {t('landing.pricing.viewAll')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/20 to-cyan-500/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('landing.finalCta.title')}</h2>
            <p className="text-muted-foreground mb-8">{t('landing.finalCta.subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => navigate('/explore')}
                className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-white px-8 py-4 h-auto rounded-xl font-semibold text-lg shadow-lg shadow-primary/25"
              >
                {t('landing.finalCta.primary')}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
