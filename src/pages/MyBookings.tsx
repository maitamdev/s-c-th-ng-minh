import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingCard } from '@/components/booking/BookingCard';
import { NoBookings } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types';
import { enrichedStations, mockChargers } from '@/data/mockStations';
import { 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BookingTab = 'upcoming' | 'past';

// Generate mock bookings
const generateMockBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const now = new Date();
  
  // Upcoming bookings
  for (let i = 0; i < 3; i++) {
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() + i);
    startTime.setHours(10 + i * 2, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 60);
    
    const station = enrichedStations[i];
    const charger = station.chargers?.[0];
    
    bookings.push({
      id: `upcoming-${i}`,
      user_id: 'user1',
      station_id: station.id,
      charger_id: charger?.id || '',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: i === 0 ? 'held' : 'confirmed',
      hold_expires_at: i === 0 ? new Date(now.getTime() + 5 * 60 * 1000).toISOString() : null,
      created_at: now.toISOString(),
      station,
      charger,
    });
  }
  
  // Past bookings
  for (let i = 0; i < 5; i++) {
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() - (i + 1) * 2);
    startTime.setHours(14, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 60);
    
    const station = enrichedStations[i + 10];
    const charger = station.chargers?.[0];
    
    bookings.push({
      id: `past-${i}`,
      user_id: 'user1',
      station_id: station.id,
      charger_id: charger?.id || '',
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: i === 2 ? 'cancelled' : 'completed',
      hold_expires_at: null,
      created_at: startTime.toISOString(),
      station,
      charger,
    });
  }
  
  return bookings;
};

const mockBookings = generateMockBookings();

export default function MyBookings() {
  const [tab, setTab] = useState<BookingTab>('upcoming');
  
  const upcomingBookings = mockBookings.filter(
    b => b.status === 'held' || b.status === 'confirmed'
  );
  
  const pastBookings = mockBookings.filter(
    b => b.status === 'completed' || b.status === 'cancelled'
  );
  
  const bookings = tab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Lịch đặt chỗ</h1>
            <p className="text-foreground/60">Quản lý các lượt đặt chỗ sạc xe</p>
          </div>
          <Button variant="hero" asChild>
            <a href="/explore">
              <Calendar className="w-4 h-4" />
              Đặt chỗ mới
            </a>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-secondary rounded-xl w-fit">
          <button
            onClick={() => setTab('upcoming')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === 'upcoming' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Clock className="w-4 h-4" />
            Sắp tới ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === 'past' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            Đã qua ({pastBookings.length})
          </button>
        </div>

        {/* Bookings list */}
        {bookings.length === 0 ? (
          <NoBookings />
        ) : (
          <motion.div 
            className="grid gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <BookingCard 
                  booking={booking}
                  onConfirm={booking.status === 'held' ? () => {} : undefined}
                  onCancel={
                    booking.status === 'held' || booking.status === 'confirmed' 
                      ? () => {} 
                      : undefined
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
