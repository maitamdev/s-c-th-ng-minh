import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useStation } from '@/hooks/useStations';
import { useBookings, useStationBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { Charger } from '@/types';
import { CONNECTOR_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Clock,
  Calendar,
  Coffee,
  Car,
  Check,
  MapPin,
  CreditCard,
  QrCode,
  Timer,
  Loader2,
  ShoppingBag,
  Wifi,
  Gift,
  Sparkles,
} from 'lucide-react';

type BookingStep = 'charger' | 'time' | 'services' | 'payment' | 'confirm';

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  
  const steps: { id: BookingStep; label: string; icon: React.ElementType }[] = [
    { id: 'charger', label: t('booking.selectPort'), icon: Zap },
    { id: 'time', label: t('booking.selectHour'), icon: Clock },
    { id: 'services', label: t('booking.services'), icon: Coffee },
    { id: 'payment', label: t('booking.payment'), icon: CreditCard },
    { id: 'confirm', label: t('booking.confirm'), icon: Check },
  ];

  // Additional services
  const additionalServices = useMemo(() => [
    {
      id: 'coffee',
      name: t('booking.service.coffee'),
      description: t('booking.service.coffeeDesc'),
      icon: Coffee,
      items: [
        { id: 'coffee-1', name: t('booking.service.coffeeBlack'), price: 25000 },
        { id: 'coffee-2', name: t('booking.service.coffeeMilk'), price: 30000 },
        { id: 'coffee-3', name: t('booking.service.peachTea'), price: 35000 },
        { id: 'coffee-4', name: t('booking.service.orangeJuice'), price: 40000 },
      ],
    },
    {
      id: 'snacks',
      name: t('booking.service.snacks'),
      description: t('booking.service.snacksDesc'),
      icon: ShoppingBag,
      items: [
        { id: 'snack-1', name: t('booking.service.croissant'), price: 35000 },
        { id: 'snack-2', name: t('booking.service.sandwich'), price: 45000 },
        { id: 'snack-3', name: t('booking.service.salad'), price: 55000 },
      ],
    },
    {
      id: 'carwash',
      name: t('booking.service.carwash'),
      description: t('booking.service.carwashDesc'),
      icon: Car,
      items: [
        { id: 'wash-1', name: t('booking.service.washBasic'), price: 50000 },
        { id: 'wash-2', name: t('booking.service.washVacuum'), price: 80000 },
        { id: 'wash-3', name: t('booking.service.washVIP'), price: 150000 },
      ],
    },
    {
      id: 'lounge',
      name: t('booking.service.lounge'),
      description: t('booking.service.loungeDesc'),
      icon: Wifi,
      items: [
        { id: 'lounge-1', name: t('booking.service.lounge30'), price: 30000 },
        { id: 'lounge-2', name: t('booking.service.lounge60'), price: 50000 },
      ],
    },
  ], [t]);

  const [currentStep, setCurrentStep] = useState<BookingStep>('charger');
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(30);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const { station, loading: stationLoading } = useStation(id || '');
  const { createBooking } = useBookings();
  const { user } = useAuth();
  const { isTimeSlotAvailable, loading: bookingsLoading } = useStationBookings(id || '', selectedCharger?.id);
  const { toast } = useToast();
  
  // Generate time slots with real availability check
  const timeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let day = 0; day < 3; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      
      const startHour = day === 0 ? currentHour + 1 : 6;
      
      for (let hour = startHour; hour < 23; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const slotDate = new Date(date);
          slotDate.setHours(hour, min, 0, 0);
          
          // Check real availability from database
          const available = isTimeSlotAvailable(slotDate, duration);
          
          slots.push({
            date: slotDate,
            label: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
            dayLabel: day === 0 ? t('booking.today') : day === 1 ? t('booking.tomorrow') : slotDate.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }),
            available,
            peak: hour >= 17 && hour <= 20,
          });
        }
      }
    }
    return slots;
  }, [duration, isTimeSlotAvailable, t]);
  
  // Group time slots by day
  const groupedSlots = useMemo(() => {
    const groups: Record<string, typeof timeSlots> = {};
    timeSlots.forEach(slot => {
      if (!groups[slot.dayLabel]) groups[slot.dayLabel] = [];
      groups[slot.dayLabel].push(slot);
    });
    return groups;
  }, [timeSlots]);

  const [selectedDay, setSelectedDay] = useState(Object.keys(groupedSlots)[0]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;
    
    // Charging cost estimate
    if (selectedCharger && duration) {
      total += (selectedCharger.price_per_kwh * selectedCharger.power_kw * duration) / 60;
    }
    
    // Services cost
    additionalServices.forEach(service => {
      service.items.forEach(item => {
        if (selectedServices.includes(item.id)) {
          total += item.price;
        }
      });
    });
    
    return total;
  }, [selectedCharger, duration, selectedServices, additionalServices]);

  const toggleService = (itemId: string) => {
    setSelectedServices(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'charger': return selectedCharger !== null;
      case 'time': return selectedTime !== null;
      case 'services': return true;
      case 'payment': return paymentMethod !== '';
      default: return false;
    }
  };

  const nextStep = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const prevStep = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCharger || !selectedTime || !station) return;
    
    setIsProcessing(true);
    
    const endTime = new Date(selectedTime.getTime() + duration * 60000);
    
    const { error } = await createBooking({
      station_id: station.id,
      charger_id: selectedCharger.id,
      start_time: selectedTime.toISOString(),
      end_time: endTime.toISOString(),
      total_price: totalPrice,
      services: selectedServices,
      payment_method: paymentMethod,
    });
    
    setIsProcessing(false);
    
    if (error) {
      toast({
        title: t('common.error'),
        description: error,
        variant: 'destructive',
      });
    } else {
      setBookingComplete(true);
      
      // Send booking confirmation email
      if (user?.email) {
        const bookingCode = `SCS${Date.now().toString().slice(-8)}`;
        sendBookingConfirmationEmail({
          userEmail: user.email,
          userName: user.profile?.full_name || 'Khách hàng',
          stationName: station.name,
          stationAddress: station.address,
          chargerName: `${selectedCharger.connector_type} - ${selectedCharger.power_kw}kW`,
          bookingDate: selectedTime.toLocaleDateString('vi-VN'),
          bookingTime: selectedTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          duration: duration,
          totalAmount: totalPrice,
          bookingCode: bookingCode,
        });
      }
    }
  };

  if (stationLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>{t('booking.notFound')}</p>
      </div>
    );
  }

  if (bookingComplete) {
    return <BookingSuccess station={station} selectedCharger={selectedCharger} selectedTime={selectedTime} duration={duration} totalPrice={totalPrice} t={t} />;
  }

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-32">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back button */}
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link to={`/station/${id}`}>
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
          </Button>

          {/* Station info header */}
          <div className="card-premium p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="font-bold text-lg text-foreground">{station.name}</h1>
                <div className="flex items-center gap-1 text-sm text-foreground/60">
                  <MapPin className="w-3.5 h-3.5" />
                  {station.address}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground/60">{t('booking.estimatedTotal')}</p>
                <p className="text-xl font-bold text-primary">{totalPrice.toLocaleString()}đ</p>
              </div>
            </div>
          </div>

          {/* Progress steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
              <div 
                className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
              
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = index < currentStepIndex;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.id} className="relative flex flex-col items-center z-10">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                      isCompleted ? 'bg-primary text-primary-foreground' :
                      isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                      'bg-card border-2 border-border text-muted-foreground'
                    )}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className={cn(
                      'mt-2 text-xs font-medium transition-colors',
                      isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Select Charger */}
              {currentStep === 'charger' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t('booking.selectCharger')}</h2>
                    <p className="text-foreground/60">{t('booking.selectChargerDesc')}</p>
                  </div>

                  {/* Charger grid - Cinema style */}
                  <div className="card-premium p-6">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-border/40">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-success" />
                        <span className="text-sm text-foreground/70">{t('booking.empty')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-warning" />
                        <span className="text-sm text-foreground/70">{t('booking.inUse')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-destructive" />
                        <span className="text-sm text-foreground/70">{t('booking.maintenance')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded ring-2 ring-primary bg-primary/20" />
                        <span className="text-sm text-foreground/70">{t('booking.selecting')}</span>
                      </div>
                    </div>

                    {/* Charger visualization */}
                    <div className="relative mb-6">
                      {/* Station entrance indicator */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
                          <Car className="w-4 h-4" />
                          <span className="text-sm font-medium">{t('booking.stationEntrance')}</span>
                        </div>
                      </div>

                      {/* Charger slots */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {station.chargers?.map((charger, index) => {
                          const isSelected = selectedCharger?.id === charger.id;
                          const isAvailable = charger.status === 'available';
                          const isOccupied = charger.status === 'occupied';
                          
                          return (
                            <button
                              key={charger.id}
                              onClick={() => isAvailable && setSelectedCharger(charger)}
                              disabled={!isAvailable}
                              className={cn(
                                'relative p-4 rounded-xl border-2 transition-all duration-200',
                                isSelected ? 'border-primary bg-primary/10 ring-2 ring-primary/30' :
                                isAvailable ? 'border-success/50 bg-success/5 hover:border-success hover:bg-success/10' :
                                isOccupied ? 'border-warning/50 bg-warning/5 cursor-not-allowed' :
                                'border-destructive/50 bg-destructive/5 cursor-not-allowed'
                              )}
                            >
                              {/* Charger number */}
                              <div className={cn(
                                'absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                isSelected ? 'bg-primary text-primary-foreground' :
                                isAvailable ? 'bg-success text-success-foreground' :
                                isOccupied ? 'bg-warning text-warning-foreground' :
                                'bg-destructive text-destructive-foreground'
                              )}>
                                {index + 1}
                              </div>

                              <div className="flex flex-col items-center">
                                <Zap className={cn(
                                  'w-8 h-8 mb-2',
                                  isSelected ? 'text-primary' :
                                  isAvailable ? 'text-success' :
                                  isOccupied ? 'text-warning' :
                                  'text-destructive'
                                )} />
                                <p className="font-semibold text-sm text-foreground">{charger.connector_type}</p>
                                <p className="text-xs text-foreground/60">{charger.power_kw} kW</p>
                                <p className="text-sm font-bold text-primary mt-1">
                                  {charger.price_per_kwh.toLocaleString()}đ/kWh
                                </p>
                              </div>

                              {isSelected && (
                                <div className="absolute -top-1 -right-1">
                                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected charger info */}
                    {selectedCharger && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-primary/5 border border-primary/20 rounded-xl"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{t('booking.selectedPort')}</p>
                            <p className="text-sm text-foreground/70">
                              {CONNECTOR_LABELS[selectedCharger.connector_type]} • {selectedCharger.power_kw} kW
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {selectedCharger.price_per_kwh.toLocaleString()}đ
                            </p>
                            <p className="text-xs text-foreground/60">/kWh</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Select Time */}
              {currentStep === 'time' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t('booking.selectTime')}</h2>
                    <p className="text-foreground/60">{t('booking.selectTimeDesc')}</p>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Duration selector */}
                    <div className="card-premium p-6">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Timer className="w-5 h-5 text-primary" />
                        {t('booking.chargingDuration')}
                      </h3>
                      <div className="space-y-3">
                        {[30, 60, 90, 120].map(mins => (
                          <button
                            key={mins}
                            onClick={() => setDuration(mins)}
                            className={cn(
                              'w-full p-3 rounded-xl border-2 transition-all text-left',
                              duration === mins 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">{mins} {t('booking.minutes')}</span>
                              {selectedCharger && (
                                <span className="text-sm text-primary font-semibold">
                                  ~{((selectedCharger.power_kw * mins) / 60).toFixed(0)} kWh
                                </span>
                              )}
                            </div>
                            {selectedCharger && (
                              <p className="text-xs text-foreground/60 mt-1">
                                ≈ {((selectedCharger.price_per_kwh * selectedCharger.power_kw * mins) / 60).toLocaleString()}đ
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Day & Time selector */}
                    <div className="lg:col-span-2 card-premium p-6">
                      {/* Day tabs */}
                      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {Object.keys(groupedSlots).map(day => (
                          <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                              selectedDay === day
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
                            )}
                          >
                            {day}
                          </button>
                        ))}
                      </div>

                      {/* Time grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {groupedSlots[selectedDay]?.map((slot, index) => {
                          const isSelected = selectedTime?.getTime() === slot.date.getTime();
                          
                          return (
                            <button
                              key={index}
                              onClick={() => slot.available && setSelectedTime(slot.date)}
                              disabled={!slot.available}
                              className={cn(
                                'p-2 rounded-lg text-sm font-medium transition-all relative',
                                isSelected ? 'bg-primary text-primary-foreground' :
                                slot.available ? 'bg-secondary hover:bg-primary/20 text-foreground' :
                                'bg-muted text-muted-foreground cursor-not-allowed'
                              )}
                            >
                              {slot.label}
                              {slot.peak && slot.available && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warning" title={t('booking.peakHour')} />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex gap-4 mt-4 pt-4 border-t border-border/40">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-warning" />
                          <span className="text-xs text-foreground/60">{t('booking.peakHour')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected time summary */}
                  {selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-premium p-4 bg-primary/5 border-primary/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {selectedTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            <p className="text-sm text-foreground/70">
                              {selectedTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedTime.getTime() + duration * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              {' '}({duration} {t('booking.minutes')})
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Step 3: Additional Services */}
              {currentStep === 'services' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t('booking.services')}</h2>
                    <p className="text-foreground/60">{t('booking.servicesDesc')}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {additionalServices.map(service => {
                      const ServiceIcon = service.icon;
                      const hasSelectedItems = service.items.some(item => selectedServices.includes(item.id));
                      
                      return (
                        <div 
                          key={service.id}
                          className={cn(
                            'card-premium p-6 transition-all',
                            hasSelectedItems && 'border-primary/50 bg-primary/5'
                          )}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center',
                              hasSelectedItems ? 'bg-primary/20' : 'bg-secondary'
                            )}>
                              <ServiceIcon className={cn(
                                'w-6 h-6',
                                hasSelectedItems ? 'text-primary' : 'text-foreground/70'
                              )} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{service.name}</h3>
                              <p className="text-sm text-foreground/60">{service.description}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {service.items.map(item => {
                              const isSelected = selectedServices.includes(item.id);
                              
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => toggleService(item.id)}
                                  className={cn(
                                    'w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between',
                                    isSelected 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border hover:border-primary/50'
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                                      isSelected ? 'border-primary bg-primary' : 'border-border'
                                    )}>
                                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                    </div>
                                    <span className="font-medium text-foreground">{item.name}</span>
                                  </div>
                                  <span className="font-semibold text-primary">
                                    +{item.price.toLocaleString()}đ
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo code */}
                  <div className="card-premium p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Gift className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{t('booking.promoCode')}</h3>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder={t('booking.enterPromo')}
                        className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button variant="outline">{t('booking.apply')}</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t('booking.payment.title')}</h2>
                    <p className="text-foreground/60">{t('booking.payment.selectMethod')}</p>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Payment methods */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">{t('booking.payment.method')}</h3>
                      
                      {[
                        { id: 'card', name: t('booking.payment.card'), icon: CreditCard, desc: t('booking.payment.cardDesc') },
                        { id: 'momo', name: t('booking.payment.momo'), icon: Sparkles, desc: t('booking.payment.momoDesc') },
                        { id: 'vnpay', name: t('booking.payment.vnpay'), icon: CreditCard, desc: t('booking.payment.vnpayDesc') },
                        { id: 'wallet', name: t('booking.payment.wallet'), icon: Zap, desc: `${t('booking.payment.walletBalance')}: 500.000đ` },
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={cn(
                            'w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4',
                            paymentMethod === method.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            paymentMethod === method.id ? 'bg-primary/20' : 'bg-secondary'
                          )}>
                            <method.icon className={cn(
                              'w-6 h-6',
                              paymentMethod === method.id ? 'text-primary' : 'text-foreground/70'
                            )} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-foreground">{method.name}</p>
                            <p className="text-sm text-foreground/60">{method.desc}</p>
                          </div>
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            paymentMethod === method.id ? 'border-primary bg-primary' : 'border-border'
                          )}>
                            {paymentMethod === method.id && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Order summary */}
                    <div className="card-premium p-6">
                      <h3 className="font-semibold text-foreground mb-4">{t('booking.payment.orderDetails')}</h3>
                      
                      <div className="space-y-3">
                        {/* Charging */}
                        <div className="flex justify-between items-center pb-3 border-b border-border/40">
                          <div>
                            <p className="font-medium text-foreground">{t('booking.payment.chargingFee')}</p>
                            <p className="text-sm text-foreground/60">
                              {selectedCharger?.connector_type} • {duration} {t('booking.minutes')}
                            </p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {selectedCharger ? ((selectedCharger.price_per_kwh * selectedCharger.power_kw * duration) / 60).toLocaleString() : 0}đ
                          </p>
                        </div>

                        {/* Services */}
                        {selectedServices.length > 0 && (
                          <div className="pb-3 border-b border-border/40">
                            <p className="font-medium text-foreground mb-2">{t('booking.payment.additionalServices')}</p>
                            {additionalServices.map(service => 
                              service.items.filter(item => selectedServices.includes(item.id)).map(item => (
                                <div key={item.id} className="flex justify-between text-sm py-1">
                                  <span className="text-foreground/70">{item.name}</span>
                                  <span className="text-foreground">{item.price.toLocaleString()}đ</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Total */}
                        <div className="flex justify-between items-center pt-2">
                          <p className="text-lg font-bold text-foreground">{t('booking.total')}</p>
                          <p className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()}đ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Confirm */}
              {currentStep === 'confirm' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t('booking.confirm.title')}</h2>
                    <p className="text-foreground/60">{t('booking.confirm.review')}</p>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <div className="card-premium p-6 space-y-6">
                      {/* Station */}
                      <div className="flex items-center gap-4 pb-4 border-b border-border/40">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Zap className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-foreground">{station.name}</p>
                          <p className="text-sm text-foreground/60">{station.address}</p>
                        </div>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/50 rounded-xl">
                          <p className="text-sm text-foreground/60 mb-1">{t('booking.confirm.charger')}</p>
                          <p className="font-semibold text-foreground">
                            {selectedCharger && CONNECTOR_LABELS[selectedCharger.connector_type]}
                          </p>
                          <p className="text-sm text-primary">{selectedCharger?.power_kw} kW</p>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-xl">
                          <p className="text-sm text-foreground/60 mb-1">{t('booking.confirm.time')}</p>
                          <p className="font-semibold text-foreground">
                            {selectedTime?.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-sm text-primary">
                            {selectedTime?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {duration} {t('booking.minutes')}
                          </p>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-xl">
                          <p className="text-sm text-foreground/60 mb-1">{t('booking.confirm.services')}</p>
                          <p className="font-semibold text-foreground">
                            {selectedServices.length > 0 ? `${selectedServices.length} ${t('booking.confirm.servicesCount')}` : t('booking.confirm.noServices')}
                          </p>
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-xl">
                          <p className="text-sm text-foreground/60 mb-1">{t('booking.confirm.payment')}</p>
                          <p className="font-semibold text-foreground">
                            {paymentMethod === 'card' ? t('booking.payment.card') : 
                             paymentMethod === 'momo' ? t('booking.payment.momo') :
                             paymentMethod === 'vnpay' ? t('booking.payment.vnpay') : t('booking.payment.wallet')}
                          </p>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl">
                        <p className="text-lg font-bold text-foreground">{t('booking.confirm.totalPayment')}</p>
                        <p className="text-3xl font-bold text-primary">{totalPrice.toLocaleString()}đ</p>
                      </div>

                      {/* Terms */}
                      <p className="text-xs text-foreground/50 text-center">
                        {t('booking.confirm.terms')} <a href="#" className="text-primary hover:underline">{t('booking.confirm.termsOfUse')}</a> {t('booking.confirm.and')} <a href="#" className="text-primary hover:underline">{t('booking.confirm.cancelPolicy')}</a> {t('booking.confirm.ofSCS')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/40 p-4 z-40">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className={currentStepIndex === 0 ? 'invisible' : ''}
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>

          <div className="text-center">
            <p className="text-sm text-foreground/60">{t('booking.total')}</p>
            <p className="text-xl font-bold text-primary">{totalPrice.toLocaleString()}đ</p>
          </div>

          {currentStep === 'confirm' ? (
            <Button
              variant="hero"
              size="lg"
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="animate-pulse">{t('booking.processing')}</span>
              ) : (
                <>
                  {t('booking.confirmBooking')}
                  <Check className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="hero"
              size="lg"
              onClick={nextStep}
              disabled={!canProceed()}
            >
              {t('common.next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


// Booking Success Component
function BookingSuccess({ 
  station, 
  selectedCharger, 
  selectedTime, 
  duration, 
  totalPrice,
  t
}: { 
  station: { id: string; name: string; address: string; lat?: number; lng?: number }; 
  selectedCharger: Charger | null; 
  selectedTime: Date | null; 
  duration: number; 
  totalPrice: number;
  t: (key: string) => string;
}) {
  const bookingCode = `SCS${Date.now().toString().slice(-8)}`;
  
  // Function to open navigation
  const openNavigation = useCallback(() => {
    const lat = station.lat;
    const lng = station.lng;
    const destination = encodeURIComponent(station.address);
    
    // Check if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (lat && lng) {
      if (isMobile) {
        // Try to open native maps app
        // iOS will open Apple Maps, Android will open Google Maps
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
      } else {
        // Desktop - open Google Maps in new tab
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
      }
    } else {
      // Fallback to address search
      window.open(`https://www.google.com/maps/search/?api=1&query=${destination}`, '_blank');
    }
  }, [station.lat, station.lng, station.address]);

  // Auto open navigation after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      openNavigation();
    }, 2000);
    return () => clearTimeout(timer);
  }, [openNavigation]);
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('booking.success.title')}</h1>
            <p className="text-foreground/60">{t('booking.success.confirmed')}</p>
            <p className="text-sm text-primary mt-2 animate-pulse">{t('booking.success.openingMap')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-6 space-y-6"
          >
            {/* QR Code */}
            <div className="text-center p-6 bg-white rounded-2xl">
              <div className="w-48 h-48 mx-auto bg-secondary rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-32 h-32 text-foreground" />
              </div>
              <p className="text-2xl font-mono font-bold text-foreground">{bookingCode}</p>
              <p className="text-sm text-foreground/60 mt-1">{t('booking.success.scanQR')}</p>
            </div>

            {/* Booking details */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{station.name}</p>
                  <p className="text-sm text-foreground/60">{station.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <p className="text-sm text-foreground/60">{t('booking.confirm.charger')}</p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {selectedCharger && CONNECTOR_LABELS[selectedCharger.connector_type]}
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <p className="text-sm text-foreground/60">{t('booking.confirm.time')}</p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {selectedTime?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-foreground/60">
                    {selectedTime?.toLocaleDateString('vi-VN')} • {duration} {t('booking.minutes')}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl">
                <p className="font-semibold text-foreground">{t('booking.success.paid')}</p>
                <p className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()}đ</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/dashboard/bookings">
                  <Calendar className="w-4 h-4" />
                  {t('booking.success.viewSchedule')}
                </Link>
              </Button>
              <Button variant="hero" className="flex-1" onClick={openNavigation}>
                <MapPin className="w-4 h-4" />
                {t('station.directions')}
              </Button>
            </div>

            {/* Tips */}
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
              <p className="text-sm text-foreground">
                <strong>{t('booking.success.note')}</strong> {t('booking.success.noteText')}
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
