// Settings - User account settings and preferences management
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
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Phone,
  MapPin,
  Bell,
  Moon,
  Sun,
  Monitor,
  Shield,
  Trash2,
  Save,
  Loader2,
  LogOut,
  ChevronRight,
  Languages,
} from 'lucide-react';

export default function Settings() {
  const { user, updateProfile, signOut } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
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
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(profileData);
      toast({
        title: t('common.success'),
        description: language === 'vi' ? 'Thông tin cá nhân đã được cập nhật' : 'Profile updated successfully',
      });
    } catch {
      toast({
        title: t('common.error'),
        description: language === 'vi' ? 'Không thể lưu thông tin' : 'Failed to save',
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        {/* Profile Section */}
        <motion.div
          className="card-premium p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t('settings.profile')}
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('settings.fullName')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'John Doe'}
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('settings.phone')}</Label>
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
              <Label htmlFor="address">{t('settings.address')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder={language === 'vi' ? '123 Đường ABC, Quận XYZ' : '123 Main St, City'}
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('auth.email')}</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground">{t('settings.emailCantChange')}</p>
            </div>

            <Button variant="hero" onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t('settings.saving')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('settings.saveChanges')}
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
            {t('settings.notifications')}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t('settings.pushNotifications')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.pushDesc')}</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{t('settings.emailNotifications')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.emailDesc')}</p>
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
            {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
            {t('settings.appearance')}
          </h3>

          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-3">{t('settings.displayMode')}</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{t('settings.light')}</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{t('settings.dark')}</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'system' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Monitor className={`w-5 h-5 ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{t('settings.system')}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{t('settings.language')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
                </div>
              </div>
              <Select
                value={language}
                onValueChange={(value: 'vi' | 'en') => setLanguage(value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
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
            {t('settings.security')}
          </h3>

          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">{t('settings.changePassword')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.changePasswordDesc')}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="text-left">
                <p className="font-medium text-foreground">{t('settings.twoFactor')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.twoFactorDesc')}</p>
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
            {t('settings.dangerZone')}
          </h3>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start text-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.logout')}
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('settings.deleteAccount')}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t('settings.deleteAccountDesc')}
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
