import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Phone,
  MapPin,
  Bell,
  Moon,
  Globe,
  Shield,
  Trash2,
  Save,
  Loader2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { user, updateProfile, signOut } = useAuth();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.profile?.full_name || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    darkMode: true,
    language: 'vi',
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(profileData);
      toast({
        title: 'Đã lưu',
        description: 'Thông tin cá nhân đã được cập nhật',
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thông tin',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground">Quản lý tài khoản và tùy chọn</p>
        </div>

        {/* Profile Section */}
        <motion.div
          className="card-premium p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Thông tin cá nhân
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
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
              <Label htmlFor="phone">Số điện thoại</Label>
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
              <Label htmlFor="address">Địa chỉ</Label>
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

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
            </div>

            <Button variant="hero" onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          className="card-premium p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Thông báo
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Thông báo đẩy</p>
                <p className="text-sm text-muted-foreground">Nhận thông báo về booking và khuyến mãi</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email thông báo</p>
                <p className="text-sm text-muted-foreground">Nhận email về hoạt động tài khoản</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
              />
            </div>
          </div>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          className="card-premium p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Giao diện
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Chế độ tối</p>
                <p className="text-sm text-muted-foreground">Sử dụng giao diện tối</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Ngôn ngữ</p>
                <p className="text-sm text-muted-foreground">Chọn ngôn ngữ hiển thị</p>
              </div>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div
          className="card-premium p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Bảo mật
          </h3>

          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Đổi mật khẩu</p>
                <p className="text-sm text-muted-foreground">Cập nhật mật khẩu đăng nhập</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">Xác thực 2 bước</p>
                <p className="text-sm text-muted-foreground">Bảo vệ tài khoản với OTP</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          className="card-premium p-6 border-destructive/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Vùng nguy hiểm
          </h3>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start text-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa tài khoản
            </Button>
            <p className="text-xs text-muted-foreground">
              Xóa vĩnh viễn tài khoản và tất cả dữ liệu. Hành động này không thể hoàn tác.
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
