import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast({
        title: language === 'vi' ? 'Email đã được gửi!' : 'Email sent!',
        description: language === 'vi' 
          ? 'Vui lòng kiểm tra hộp thư của bạn.' 
          : 'Please check your inbox.',
      });
    } catch (error: any) {
      let message = language === 'vi' ? 'Có lỗi xảy ra' : 'An error occurred';
      if (error.code === 'auth/user-not-found') {
        message = language === 'vi' ? 'Email không tồn tại trong hệ thống' : 'Email not found';
      } else if (error.code === 'auth/invalid-email') {
        message = language === 'vi' ? 'Email không hợp lệ' : 'Invalid email';
      }
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {language === 'vi' ? 'Kiểm tra email của bạn' : 'Check your email'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'vi' 
              ? `Chúng tôi đã gửi link đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra hộp thư (và thư mục spam).`
              : `We've sent a password reset link to ${email}. Please check your inbox (and spam folder).`}
          </p>
          <div className="space-y-3">
            <Button variant="hero" className="w-full" onClick={() => setSent(false)}>
              {language === 'vi' ? 'Gửi lại email' : 'Resend email'}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/auth">
                <ArrowLeft className="w-4 h-4" />
                {language === 'vi' ? 'Quay lại đăng nhập' : 'Back to login'}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/30">
            <img src="/logo.png" alt="SCS GO" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold gradient-text">SCS GO</span>
        </Link>

        <h1 className="text-2xl font-bold mb-2">
          {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {language === 'vi' 
            ? 'Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.'
            : 'Enter your email and we will send you a password reset link.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button 
            variant="hero" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === 'vi' ? 'Đang gửi...' : 'Sending...'}
              </>
            ) : (
              language === 'vi' ? 'Gửi link đặt lại' : 'Send reset link'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/auth" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'vi' ? 'Quay lại đăng nhập' : 'Back to login'}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
