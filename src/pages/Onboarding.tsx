import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Phone, 
  MapPin, 
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: user?.profile?.full_name || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
  });

  const handleSubmit = async () => {
    if (!profileData.full_name || !profileData.phone) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập họ tên và số điện thoại',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        ...profileData,
        onboarding_completed: true,
      });
      
      toast({
        title: 'Hoàn tất!',
        description: 'Chào mừng bạn đến với SCS GO',
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thông tin. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await updateProfile({
        full_name: profileData.full_name || user?.profile?.full_name || 'User',
        onboarding_completed: true,
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg">
            <img src="/logo.png" alt="SCS GO" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold gradient-text">SCS GO</span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Chào mừng bạn!</h1>
              <p className="text-muted-foreground">Hoàn tất thông tin để bắt đầu sử dụng</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn A"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0912 345 678"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ (tùy chọn)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="123 Đường ABC, Quận XYZ"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground">
                💡 Bạn có thể kết nối xe điện sau trong phần <strong>Xe của tôi</strong> để AI gợi ý trạm sạc phù hợp hơn.
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <Button variant="ghost" onClick={handleSkip} disabled={loading}>
              Bỏ qua
            </Button>
            
            <Button variant="hero" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Hoàn tất
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
