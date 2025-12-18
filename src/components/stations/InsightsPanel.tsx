import { Station, HourlyPrediction, GoldenHour } from '@/types';
import { getHourlyPredictions, getGoldenHours, getCurrentPrediction } from '@/ai/prediction';
import { PredictionChip } from '@/components/ui/prediction-chip';
import { LockBadge, LockedOverlay } from '@/components/ui/lock-badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Clock, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  station: Station;
  planLevel?: 0 | 1 | 2; // 0 = free, 1 = plus, 2 = pro
  onUpgrade?: () => void;
}

export function InsightsPanel({ station, planLevel = 0, onUpgrade }: InsightsPanelProps) {
  const predictions = getHourlyPredictions({ station });
  const goldenHours = getGoldenHours(predictions);
  const currentPrediction = getCurrentPrediction(predictions);
  const currentHour = new Date().getHours();

  // Chart data
  const chartData = predictions.map((p) => ({
    hour: p.hour,
    label: `${p.hour}:00`,
    value: p.level === 'low' ? 30 : p.level === 'medium' ? 60 : 90,
    level: p.level,
    confidence: p.confidence,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{data.label}</p>
          <div className="flex items-center gap-2">
            <PredictionChip level={data.level} size="sm" />
            <span className="text-xs text-muted-foreground">
              Độ tin cậy: {data.confidence}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-premium p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Dự đoán AI</h3>
        </div>
        {planLevel < 2 && <LockBadge label="Pro" />}
      </div>

      {/* Current prediction */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Hiện tại ({currentHour}:00)</p>
          <PredictionChip 
            level={currentPrediction.level} 
            confidence={planLevel >= 1 ? currentPrediction.confidence : undefined}
          />
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1">Thời gian chờ ước tính</p>
          <p className="text-lg font-semibold">
            {currentPrediction.estimated_wait_min === 0 
              ? 'Ngay lập tức' 
              : `~${currentPrediction.estimated_wait_min} phút`
            }
          </p>
        </div>
      </div>

      {/* Chart - locked for free tier */}
      <div className="relative">
        {planLevel === 0 && <LockedOverlay planName="Plus" onUpgrade={onUpgrade} />}
        
        <div className={cn(planLevel === 0 && 'blur-sm pointer-events-none')}>
          <p className="text-sm text-muted-foreground mb-2">Dự đoán theo giờ</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  interval={3}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  x={`${currentHour}:00`} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="3 3" 
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Golden hours */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-success" />
          <p className="text-sm font-medium">Giờ vàng để sạc</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {goldenHours.length > 0 ? (
            goldenHours.map((gh, i) => (
              <div 
                key={i}
                className="px-3 py-1.5 bg-success/10 text-success border border-success/20 rounded-lg text-sm"
              >
                {gh.start}:00 - {gh.end + 1}:00
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Không có giờ vàng hôm nay</p>
          )}
        </div>
      </div>
    </div>
  );
}
