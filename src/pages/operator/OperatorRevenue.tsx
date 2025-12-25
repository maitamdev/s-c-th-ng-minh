import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OperatorLayout } from '@/components/layout/OperatorLayout';
import { Button } from '@/components/ui/button';
import { useOperator } from '@/hooks/useOperator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Building,
  CreditCard,
  ArrowRight,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OperatorRevenue() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { bookings, payouts, stats, loading, requestPayout } = useOperator();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [requesting, setRequesting] = useState(false);

  // Calculate revenue
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const pendingPayout = payouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);
  const completedPayout = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = totalRevenue - pendingPayout - completedPayout;

  const handleRequestPayout = async () => {
    if (!payoutAmount || !bankName || !bankAccount) {
      toast({ title: t('common.error'), description: t('operator.fillAllFields'), variant: 'destructive' });
      return;
    }

    const amount = parseInt(payoutAmount);
    if (amount > availableBalance) {
      toast({ title: t('common.error'), description: t('operator.insufficientBalance'), variant: 'destructive' });
      return;
    }

    setRequesting(true);
    const { error } = await requestPayout(amount, bankName, bankAccount);
    if (error) {
      toast({ title: t('common.error'), description: error, variant: 'destructive' });
    } else {
      toast({ title: t('common.success'), description: t('operator.payoutRequested') });
      setShowPayoutModal(false);
      setPayoutAmount('');
      setBankName('');
      setBankAccount('');
    }
    setRequesting(false);
  };

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <Clock className="w-3 h-3" />
            {t('operator.payout.pending')}
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <Loader2 className="w-3 h-3 animate-spin" />
            {t('operator.payout.processing')}
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <CheckCircle2 className="w-3 h-3" />
            {t('operator.payout.completed')}
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            {t('operator.payout.failed')}
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
              {t('operator.revenue.title')}
            </h1>
            <p className="text-muted-foreground">{t('operator.revenue.subtitle')}</p>
          </div>
          <Button variant="hero" onClick={() => setShowPayoutModal(true)}>
            <Wallet className="w-4 h-4" />
            {t('operator.requestPayout')}
          </Button>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-6 bg-gradient-to-br from-primary/10 to-cyan-500/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <span className="text-muted-foreground">{t('operator.availableBalance')}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {availableBalance.toLocaleString()}đ
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('operator.canWithdraw')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-premium p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-muted-foreground">{t('operator.totalEarnings')}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {totalRevenue.toLocaleString()}đ
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {completedBookings.length} {t('operator.completedBookings')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-muted-foreground">{t('operator.totalWithdrawn')}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {completedPayout.toLocaleString()}đ
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {payouts.filter(p => p.status === 'completed').length} {t('operator.withdrawals')}
            </p>
          </motion.div>
        </div>

        {/* Payout History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t('operator.payoutHistory')}
            </h3>
          </div>
          <div className="p-4">
            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">{t('operator.noPayouts')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{payout.bank_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payout.bank_account} • {new Date(payout.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{payout.amount.toLocaleString()}đ</p>
                      {getPayoutStatusBadge(payout.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-premium"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {t('operator.recentTransactions')}
            </h3>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4 mr-1" />
              {t('operator.export')}
            </Button>
          </div>
          <div className="p-4">
            {completedBookings.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">{t('operator.noTransactions')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {completedBookings.slice(0, 10).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {booking.user?.full_name || 'Khách hàng'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.station?.name} • {new Date(booking.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-success">
                      +{booking.total_price?.toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Payout Request Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPayoutModal(false)}
            />
            <motion.div
              className="relative bg-card rounded-2xl shadow-2xl max-w-md w-full p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">{t('operator.requestPayout')}</h3>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-xl">
                  <p className="text-sm text-muted-foreground">{t('operator.availableBalance')}</p>
                  <p className="text-2xl font-bold text-primary">{availableBalance.toLocaleString()}đ</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('operator.withdrawAmount')} *
                  </label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="VD: 1000000"
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('operator.bankName')} *
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="VD: Vietcombank, Techcombank..."
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('operator.bankAccount')} *
                  </label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="VD: 1234567890"
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPayoutModal(false)}
                    disabled={requesting}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleRequestPayout}
                    disabled={requesting}
                  >
                    {requesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        {t('operator.confirm')}
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
