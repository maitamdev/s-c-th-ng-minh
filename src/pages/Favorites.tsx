import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart,
  MapPin,
  Zap,
  Star,
  Loader2,
  Trash2,
} from 'lucide-react';

export default function Favorites() {
  const { favorites, loading, removeFavorite } = useFavorites();
  const { toast } = useToast();

  const handleRemove = async (stationId: string) => {
    const { error } = await removeFavorite(stationId);
    if (error) {
      toast({
        title: 'Lỗi',
        description: error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Đã xóa',
        description: 'Đã xóa khỏi danh sách yêu thích',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trạm yêu thích</h1>
            <p className="text-muted-foreground">{favorites.length} trạm đã lưu</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/explore">
              <MapPin className="w-4 h-4" />
              Khám phá thêm
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có trạm yêu thích</h3>
            <p className="text-muted-foreground mb-4">
              Lưu các trạm sạc thường dùng để truy cập nhanh hơn
            </p>
            <Button variant="hero" asChild>
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
            {favorites.map((favorite) => (
              <motion.div
                key={favorite.id}
                className="card-premium overflow-hidden group"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                {/* Image */}
                <div className="relative h-40 bg-secondary">
                  {favorite.station?.image_url ? (
                    <img 
                      src={favorite.station.image_url} 
                      alt={favorite.station.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Zap className="w-12 h-12 text-primary/50" />
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(favorite.station_id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm text-destructive hover:bg-destructive hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {favorite.station?.name || 'Trạm sạc'}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{favorite.station?.address || 'Địa chỉ'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {favorite.station?.provider}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/station/${favorite.station_id}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
