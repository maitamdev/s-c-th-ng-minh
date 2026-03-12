// AIRecommendation - AI-powered station suggestion card with match percentage
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Station, Vehicle, OptimizationMode, AIRecommendation } from '@/types';
import { getTopRecommendations } from '@/ai/recommendation';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  MapPin,
  Zap,
  Clock,
  Star,
  Navigation,
  ChevronRight,
  Coins,
  CheckCircle2,
  Plug,
  Brain,
  RefreshCw,
  Target,
  Timer,
} from 'lucide-react';

interface AIRecommendationPanelProps {
  stations: Station[];
  userLocation: { lat: number; lng: number } | null;
  vehicle: Vehicle;
  className?: string;
}

const modeOptions: { id: OptimizationMode; icon: React.ElementType; labelKey: string }[] = [
  { id: 'balanced', icon: Target, labelKey: 'ai.mode.balanced' },
  { id: 'fastest', icon: Zap, labelKey: 'ai.mode.fastest' },
  { id: 'cheapest', icon: Coins, labelKey: 'ai.mode.cheapest' },
  { id: 'least_wait', icon: Timer, labelKey: 'ai.mode.leastWait' },
];

const reasonIcons: Record<string, React.ElementType> = {
  'map-pin': MapPin,
  'coins': Coins,
  'zap': Zap,
  'check-circle': CheckCircle2,
  'plug': Plug,
  'star': Star,
  'navigation': Navigation,
};

export function AIRecommendationPanel({ 
  stations, 
  userLocation, 
  vehicle,
  className 
}: AIRecommendationPanelProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<OptimizationMode>('balanced');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!userLocation || stations.length === 0) return;

    setIsCalculating(true);
    
    // Simulate AI processing delay for better UX
    const timer = setTimeout(() => {
      const results = getTopRecommendations({
        userLat: userLocation.lat,
        userLng: userLocation.lng,
        vehicle,
        mode,
        stations,
      }, 3);
      
      setRecommendations(results);
      setIsCalculating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userLocation, stations, vehicle, mode]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-orange-400 bg-orange-500/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return t('ai.score.excellent');
    if (score >= 80) return t('ai.score.veryGood');
    if (score >= 70) return t('ai.score.good');
    if (score >= 60) return t('ai.score.fair');
    return t('ai.score.ok');
  };

  if (!userLocation) {
    return (
      <div className={cn("card-premium p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('ai.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('ai.needLocation')}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={() => {
          navigator.geolocation?.getCurrentPosition(() => {});
        }}>
          <MapPin className="w-4 h-4 mr-2" />
          {t('ai.enableLocation')}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("card-premium overflow-hidden", className)}>
      {/* Header */}
      <div 
        className="p-4 bg-gradient-to-r from-primary/10 to-cyan-500/10 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {t('ai.title')}
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">AI</span>
              </h3>
              <p className="text-sm text-muted-foreground">{t('ai.subtitle')}</p>
            </div>
          </div>
          <ChevronRight className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            expanded && "rotate-90"
          )} />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Mode selector */}
            <div className="p-4 border-b border-border/50">
              <p className="text-xs text-muted-foreground mb-2">{t('ai.optimizeFor')}</p>
              <div className="grid grid-cols-4 gap-2">
                {modeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setMode(option.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                      mode === option.id
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="text-[10px] sm:text-xs font-medium leading-tight text-center">{t(option.labelKey as keyof typeof import('@/lib/translations').translations.vi)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 space-y-3">
              {isCalculating ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="relative">
                    <Brain className="w-10 h-10 text-primary" />
                    <RefreshCw className="w-4 h-4 text-primary absolute -bottom-1 -right-1 animate-spin" />
                  </div>
                  <p className="text-sm text-muted-foreground">{t('ai.calculating')}</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('ai.noResults')}</p>
                </div>
              ) : (
                recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.station.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/station/${rec.station.id}`}>
                      <div className={cn(
                        "p-4 rounded-xl border transition-all hover:shadow-lg",
                        index === 0 
                          ? "bg-gradient-to-r from-primary/10 to-cyan-500/10 border-primary/30 hover:border-primary/50" 
                          : "bg-secondary/30 border-border/50 hover:border-primary/30"
                      )}>
                        {/* Top row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {index === 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-white font-medium">
                                  #{index + 1} {t('ai.bestMatch')}
                                </span>
                              )}
                              {index > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                  #{index + 1}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-foreground line-clamp-1">
                              {rec.station.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {rec.station.address}
                            </p>
                          </div>
                          
                          {/* Score badge */}
                          <div className={cn(
                            "flex flex-col items-center px-3 py-2 rounded-xl",
                            getScoreColor(rec.match_percent)
                          )}>
                            <span className="text-2xl font-bold">{rec.match_percent}</span>
                            <span className="text-xs">{getScoreLabel(rec.match_percent)}</span>
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{rec.travel_time_min} {t('common.min')}</span>
                          </div>
                          {rec.station.max_power && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Zap className="w-4 h-4" />
                              <span>{rec.station.max_power} kW</span>
                            </div>
                          )}
                          {rec.station.min_price && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Coins className="w-4 h-4" />
                              <span>{rec.station.min_price.toLocaleString()}đ</span>
                            </div>
                          )}
                          {rec.station.available_chargers !== undefined && (
                            <div className="flex items-center gap-1 text-emerald-500">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{rec.station.available_chargers} {t('ai.available')}</span>
                            </div>
                          )}
                        </div>

                        {/* AI Reasons */}
                        <div className="flex flex-wrap gap-2">
                          {rec.reasons.map((reason, i) => {
                            const Icon = reasonIcons[reason.icon] || CheckCircle2;
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 text-xs"
                              >
                                <Icon className="w-3 h-3 text-primary" />
                                <span className="text-muted-foreground">{reason.text}</span>
                                {reason.value && (
                                  <span className="font-medium text-foreground">{reason.value}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {recommendations.length > 0 && (
              <div className="p-4 pt-0">
                <p className="text-xs text-center text-muted-foreground">
                  <Brain className="w-3 h-3 inline mr-1" />
                  {t('ai.poweredBy')}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
