import { useState } from 'react';
import { motion } from 'framer-motion';
import { Station, Charger, Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { CONNECTOR_LABELS, SLOT_DURATIONS, BOOKING_HOLD_MINUTES } from '@/lib/constants';
import { 
  Calendar,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingWizardProps {
  station: Station;
  selectedCharger: Charger | null;
  onSelectCharger: (charger: Charger | null) => void;
  onComplete: (booking: Partial<Booking>) => void;
  onClose: () => void;
}

type Step = 'charger' | 'time' | 'confirm';

// Generate time slots for the next 24 hours
function generateTimeSlots() {
  const slots = [];
  const now = new Date();
  const startHour = now.getHours() + 1;
  
  for (let i = 0; i < 24; i++) {
    const hour = (startHour + i) % 24;
    const date = new Date();
    if (startHour + i >= 24) {
      date.setDate(date.getDate() + 1);
    }
    date.setHours(hour, 0, 0, 0);
    
    slots.push({
      time: date,
      label: `${hour.toString().padStart(2, '0')}:00`,
      available: Math.random() > 0.3, // Mock availability
    });
  }
  
  return slots;
}

export function BookingWizard({ 
  station, 
  selectedCharger, 
  onSelectCharger,
  onComplete, 
  onClose 
}: BookingWizardProps) {
  const [step, setStep] = useState<Step>(selectedCharger ? 'time' : 'charger');
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const timeSlots = generateTimeSlots();
  const availableChargers = station.chargers?.filter(c => c.status === 'available') || [];

  const handleConfirm = () => {
    if (!selectedCharger || !selectedSlot) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const endTime = new Date(selectedSlot);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      onComplete({
        station_id: station.id,
        charger_id: selectedCharger.id,
        start_time: selectedSlot.toISOString(),
        end_time: endTime.toISOString(),
        status: 'held',
        hold_expires_at: new Date(Date.now() + BOOKING_HOLD_MINUTES * 60 * 1000).toISOString(),
      });
      
      setLoading(false);
    }, 1500);
  };

  const renderStep = () => {
    switch (step) {
      case 'charger':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Chọn cổng sạc</h3>
              <span className="text-sm text-muted-foreground">
                {availableChargers.length} cổng trống
              </span>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {station.chargers?.map((charger) => {
                const isAvailable = charger.status === 'available';
                const isSelected = selectedCharger?.id === charger.id;
                
                return (
                  <button
                    key={charger.id}
                    onClick={() => isAvailable && onSelectCharger(charger)}
                    disabled={!isAvailable}
                    className={cn(
                      'w-full p-4 rounded-xl border text-left transition-all',
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-card hover:border-primary/50',
                      !isAvailable && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          isAvailable ? 'bg-success/20' : 'bg-muted'
                        )}>
                          <Zap className={cn(
                            'w-5 h-5',
                            isAvailable ? 'text-success' : 'text-muted-foreground'
                          )} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {CONNECTOR_LABELS[charger.connector_type] || charger.connector_type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {charger.power_kw} kW
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {charger.price_per_kwh.toLocaleString()}đ
                        </p>
                        <p className="text-xs text-muted-foreground">/kWh</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <Button 
              className="w-full" 
              disabled={!selectedCharger}
              onClick={() => setStep('time')}
            >
              Tiếp tục
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        );
        
      case 'time':
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setStep('charger')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </button>
            
            <h3 className="text-lg font-semibold text-foreground">Chọn thời gian</h3>
            
            {/* Duration selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Thời lượng sạc</label>
              <div className="flex gap-2">
                {SLOT_DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors',
                      duration === d 
                        ? 'border-primary bg-primary text-primary-foreground' 
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    )}
                  >
                    {d} phút
                  </button>
                ))}
              </div>
            </div>
            
            {/* Time slots */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Chọn giờ bắt đầu</label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {timeSlots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => slot.available && setSelectedSlot(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                      'py-2 px-3 rounded-lg border text-sm transition-colors',
                      selectedSlot?.getTime() === slot.time.getTime()
                        ? 'border-primary bg-primary text-primary-foreground'
                        : slot.available 
                          ? 'border-border bg-card text-foreground hover:border-primary/50'
                          : 'border-border bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              className="w-full" 
              disabled={!selectedSlot}
              onClick={() => setStep('confirm')}
            >
              Tiếp tục
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        );
        
      case 'confirm': {
        const endTime = selectedSlot ? new Date(selectedSlot) : null;
        if (endTime) endTime.setMinutes(endTime.getMinutes() + duration);
        
        return (
          <div className="space-y-4">
            <button 
              onClick={() => setStep('time')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </button>
            
            <h3 className="text-lg font-semibold text-foreground">Xác nhận đặt chỗ</h3>
            
            <div className="space-y-3 p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạm sạc</span>
                <span className="font-medium text-foreground">{station.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cổng sạc</span>
                <span className="font-medium text-foreground">
                  {selectedCharger && CONNECTOR_LABELS[selectedCharger.connector_type]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Công suất</span>
                <span className="font-medium text-foreground">{selectedCharger?.power_kw} kW</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Thời gian</span>
                <span className="font-medium text-foreground">
                  {selectedSlot?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {endTime?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ngày</span>
                <span className="font-medium text-foreground">
                  {selectedSlot?.toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="font-medium text-foreground">Giá dự kiến</span>
                <span className="text-lg font-bold text-primary">
                  {((selectedCharger?.price_per_kwh || 0) * (selectedCharger?.power_kw || 0) * duration / 60).toLocaleString()}đ
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Bạn sẽ giữ chỗ trong <strong>{BOOKING_HOLD_MINUTES} phút</strong>. 
                Sau đó cần xác nhận hoặc chỗ sẽ tự động hủy.
              </p>
            </div>
            
            <Button 
              variant="hero"
              className="w-full" 
              size="lg"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Đang xử lý...</span>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  Giữ chỗ ngay
                </>
              )}
            </Button>
          </div>
        );
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-6"
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(['charger', 'time', 'confirm'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              step === s || (['charger', 'time', 'confirm'].indexOf(step) > i)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}>
              {i + 1}
            </div>
            {i < 2 && (
              <div className={cn(
                'flex-1 h-0.5 rounded',
                ['charger', 'time', 'confirm'].indexOf(step) > i
                  ? 'bg-primary'
                  : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>
      
      {renderStep()}
    </motion.div>
  );
}
