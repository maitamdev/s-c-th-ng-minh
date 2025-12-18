import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StationCard } from '@/components/stations/StationCard';
import { NoStationsFound } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { enrichedStations } from '@/data/mockStations';
import { 
  Heart,
  MapPin,
} from 'lucide-react';

// Mock favorites - first 5 stations
const favoriteStations = enrichedStations.slice(0, 5);

export default function Favorites() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trạm yêu thích</h1>
            <p className="text-muted-foreground">{favoriteStations.length} trạm đã lưu</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/explore">
              <MapPin className="w-4 h-4" />
              Khám phá thêm
            </Link>
          </Button>
        </div>

        {favoriteStations.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có trạm yêu thích</h3>
            <p className="text-muted-foreground mb-4">
              Lưu các trạm sạc thường dùng để truy cập nhanh hơn
            </p>
            <Button asChild>
              <Link to="/explore">Khám phá trạm sạc</Link>
            </Button>
          </div>
        ) : (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {favoriteStations.map((station) => (
              <motion.div
                key={station.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <StationCard station={station} aiScore={Math.floor(Math.random() * 20) + 75} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
