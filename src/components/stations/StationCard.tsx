import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Station } from '@/types';
import { AIScoreBadge } from '@/components/ui/ai-score-badge';
import { PredictionChip } from '@/components/ui/prediction-chip';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Zap, 
  Star,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { CONNECTOR_LABELS } from '@/lib/constants';
import { getSimplePrediction } from '@/ai/prediction';
import { cn } from '@/lib/utils';

interface StationCardProps {
  station: Station;
  aiScore?: number;
  aiReasons?: { icon: string; text: string; value?: string }[];
  className?: string;
}

export function StationCard({ station, aiScore, aiReasons, className }: StationCardProps) {
  const prediction = getSimplePrediction(station);
  const connectorTypes = [...new Set(station.chargers?.map(c => c.connector_type) || [])];

  return (
    <motion.div
      className={cn('card-premium p-4 group', className)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{station.name}</h3>
            {station.hours_json?.is_24h && (
              <span className="px-1.5 py-0.5 text-xs bg-success/10 text-success rounded-full whitespace-nowrap">
                24h
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{station.address}</span>
          </div>
        </div>
        
        {aiScore !== undefined && (
          <AIScoreBadge score={aiScore} size="sm" />
        )}
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Connectors */}
        {connectorTypes.slice(0, 2).map((type) => (
          <span 
            key={type}
            className="px-2 py-0.5 text-xs bg-secondary rounded-full text-secondary-foreground"
          >
            {type}
          </span>
        ))}
        {connectorTypes.length > 2 && (
          <span className="px-2 py-0.5 text-xs bg-secondary rounded-full text-muted-foreground">
            +{connectorTypes.length - 2}
          </span>
        )}
        
        {/* Prediction */}
        <PredictionChip level={prediction.level} size="sm" showIcon={false} />
      </div>

      {/* Details row */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span>{station.max_power || 0} kW</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>{station.avg_rating?.toFixed(1) || '-'}</span>
        </div>
        {station.distance_km !== undefined && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{station.distance_km.toFixed(1)} km</span>
          </div>
        )}
      </div>

      {/* AI Reasons (if available) */}
      {aiReasons && aiReasons.length > 0 && (
        <div className="p-2 bg-primary/5 rounded-lg mb-3 space-y-1">
          {aiReasons.slice(0, 2).map((reason, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-primary">•</span>
              <span className="text-muted-foreground">{reason.text}</span>
              {reason.value && <span className="text-foreground font-medium">{reason.value}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <div>
          <span className="text-lg font-bold text-primary">
            {station.min_price?.toLocaleString() || '-'}đ
          </span>
          <span className="text-sm text-muted-foreground">/kWh</span>
        </div>
        
        <Button size="sm" variant="default" asChild>
          <Link to={`/station/${station.id}`}>
            Chi tiết
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
