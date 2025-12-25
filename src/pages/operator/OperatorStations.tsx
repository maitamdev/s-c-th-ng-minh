import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { OperatorLayout } from '@/components/layout/OperatorLayout';
import { Button } from '@/components/ui/button';
import { useOperator, OperatorStation } from '@/hooks/useOperator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Zap,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OperatorStations() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { stations, loading, deleteStation } = useOperator();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [deleteModal, setDeleteModal] = useState<OperatorStation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    const { error } = await deleteStation(deleteModal.id);
    if (error) {
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
    } else {
      toast({ title: t('common.success'), description: t('operator.stationDeleted') });
    }
    setDeleting(false);
    setDeleteModal(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <CheckCircle2 className="w-3 h-3" />
            {t('operator.status.approved')}
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <Clock className="w-3 h-3" />
            {t('operator.status.pending')}
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            {t('operator.status.rejected')}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </OperatorLayout>
    );
  }

  return (
    <OperatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('operator.stations.title')}
            </h1>
            <p className="text-muted-foreground">{t('operator.stations.subtitle')}</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/operator/stations/new">
              <Plus className="w-4 h-4" />
              {t('operator.addStation')}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('operator.searchStations')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'approved', 'pending', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {status === 'all' ? t('common.all') : t(`operator.status.${status}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Stations Grid */}
        {filteredStations.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? t('operator.noStationsFound') : t('operator.noStations.title')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? t('operator.tryDifferentSearch') : t('operator.noStations.desc')}
            </p>
            {!searchQuery && (
              <Button variant="hero" asChild>
                <Link to="/operator/stations/new">
                  <Plus className="w-4 h-4" />
                  {t('operator.addFirstStation')}
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            {filteredStations.map((station) => (
              <motion.div
                key={station.id}
                className="card-premium overflow-hidden group"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                {/* Image */}
                <div className="relative h-40 bg-secondary">
                  {station.image_url ? (
                    <img
                      src={station.image_url}
                      alt={station.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Zap className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(station.status)}
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Link
                        to={`/operator/stations/${station.id}`}
                        className="p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-card transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/operator/stations/${station.id}/edit`}
                        className="p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-card transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteModal(station)}
                        className="p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 truncate">{station.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 truncate flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {station.address}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="w-4 h-4 text-primary" />
                        {station.chargers?.length || 0} {t('operator.chargers')}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-500" />
                        4.5
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {station.is_24h ? '24/7' : `${station.hours_open} - ${station.hours_close}`}
                    </span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">0</p>
                      <p className="text-xs text-muted-foreground">{t('operator.todayBookings')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">0đ</p>
                      <p className="text-xs text-muted-foreground">{t('operator.todayRevenue')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">
                        {station.chargers?.filter(c => c.status === 'available').length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">{t('operator.available')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteModal(null)}
            />
            <motion.div
              className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t('operator.deleteStation.title')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('operator.deleteStation.desc')} <strong>{deleteModal.name}</strong>?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDeleteModal(null)}
                    disabled={deleting}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        {t('common.delete')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </OperatorLayout>
  );
}
