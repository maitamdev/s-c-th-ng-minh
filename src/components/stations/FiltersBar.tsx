import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { StationFilters, SortOption, ConnectorType } from '@/types';
import { CONNECTOR_TYPES, PROVIDERS } from '@/lib/constants';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  MapPin, 
  Zap,
  Coins,
  Star,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FiltersBarProps {
  filters: StationFilters;
  onFiltersChange: (filters: StationFilters) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const sortOptions: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: 'ai_recommended', label: 'AI đề xuất', icon: Sparkles },
  { value: 'distance', label: 'Gần nhất', icon: MapPin },
  { value: 'price', label: 'Rẻ nhất', icon: Coins },
  { value: 'power', label: 'Công suất cao', icon: Zap },
  { value: 'rating', label: 'Đánh giá cao', icon: Star },
];

export function FiltersBar({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: FiltersBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleConnector = (connector: ConnectorType) => {
    const newConnectors = filters.connectors.includes(connector)
      ? filters.connectors.filter((c) => c !== connector)
      : [...filters.connectors, connector];
    onFiltersChange({ ...filters, connectors: newConnectors });
  };

  const activeFiltersCount = 
    filters.connectors.length +
    (filters.minPower ? 1 : 0) +
    (filters.maxDistance ? 1 : 0) +
    (filters.openNow ? 1 : 0) +
    (filters.availableNow ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Search and Sort Row */}
      <div className="flex gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm trạm sạc..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle */}
        <Button 
          variant={showFilters ? 'default' : 'outline'}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="w-4 h-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Extended Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="card-premium p-4 space-y-4">
              {/* Connectors */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Loại cổng sạc</Label>
                <div className="flex flex-wrap gap-2">
                  {CONNECTOR_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleConnector(type)}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        filters.connectors.includes(type)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary border-border hover:border-primary/50'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Power and Distance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Công suất tối thiểu: {filters.minPower || 0} kW
                  </Label>
                  <Slider
                    value={[filters.minPower || 0]}
                    max={350}
                    step={10}
                    onValueChange={([v]) => onFiltersChange({ ...filters, minPower: v || null })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Khoảng cách tối đa: {filters.maxDistance || 50} km
                  </Label>
                  <Slider
                    value={[filters.maxDistance || 50]}
                    max={100}
                    step={5}
                    onValueChange={([v]) => onFiltersChange({ ...filters, maxDistance: v || null })}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.openNow}
                    onCheckedChange={(v) => onFiltersChange({ ...filters, openNow: v })}
                  />
                  <Label className="text-sm">Đang mở cửa</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.availableNow}
                    onCheckedChange={(v) => onFiltersChange({ ...filters, availableNow: v })}
                  />
                  <Label className="text-sm">Còn cổng trống</Label>
                </div>
              </div>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({
                    connectors: [],
                    minPower: null,
                    maxDistance: null,
                    priceRange: null,
                    providers: [],
                    openNow: false,
                    availableNow: false,
                  })}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
