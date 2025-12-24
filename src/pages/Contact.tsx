import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Headphones,
  FileQuestion,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ContactType = 'general' | 'support' | 'business' | 'feedback';

export default function Contact() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [contactType, setContactType] = useState<ContactType>('general');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactTypes = [
    { id: 'general' as const, icon: MessageSquare, label: language === 'vi' ? 'Câu hỏi chung' : 'General Inquiry' },
    { id: 'support' as const, icon: Headphones, label: language === 'vi' ? 'Hỗ trợ kỹ thuật' : 'Technical Support' },
    { id: 'business' as const, icon: Mail, label: language === 'vi' ? 'Hợp tác kinh doanh' : 'Business Partnership' },
    { id: 'feedback' as const, icon: FileQuestion, label: language === 'vi' ? 'Góp ý / Phản hồi' : 'Feedback' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSubmitting(false);
    setSubmitted(true);
    toast({
      title: language === 'vi' ? 'Gửi thành công!' : 'Message sent!',
      description: language === 'vi' 
        ? 'Chúng tôi sẽ phản hồi trong vòng 24 giờ.' 
        : 'We will respond within 24 hours.',
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-md mx-auto text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-2xl font-bold mb-4">
                {language === 'vi' ? 'Cảm ơn bạn đã liên hệ!' : 'Thank you for contacting us!'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {language === 'vi' 
                  ? 'Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.'
                  : 'We have received your message and will respond as soon as possible.'}
              </p>
              <Button variant="hero" onClick={() => setSubmitted(false)}>
                {language === 'vi' ? 'Gửi tin nhắn khác' : 'Send another message'}
              </Button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'vi' ? 'Liên hệ với chúng tôi' : 'Contact Us'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'vi' 
                ? 'Có câu hỏi hoặc cần hỗ trợ? Đội ngũ SCS GO luôn sẵn sàng giúp đỡ bạn.'
                : 'Have questions or need support? The SCS GO team is always ready to help.'}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="card-premium p-6">
                <h3 className="font-semibold mb-4">
                  {language === 'vi' ? 'Thông tin liên hệ' : 'Contact Information'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{language === 'vi' ? 'Địa chỉ' : 'Address'}</p>
                      <p className="text-sm text-muted-foreground">
                        Tầng 10, Tòa nhà ABC<br />
                        123 Nguyễn Huệ, Q.1, TP.HCM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{language === 'vi' ? 'Hotline' : 'Hotline'}</p>
                      <a href="tel:1900xxxx" className="text-sm text-primary hover:underline">1900 xxxx</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <a href="mailto:support@scsgo.vn" className="text-sm text-primary hover:underline">support@scsgo.vn</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{language === 'vi' ? 'Giờ làm việc' : 'Working Hours'}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'vi' ? 'T2 - T7: 8:00 - 18:00' : 'Mon - Sat: 8:00 AM - 6:00 PM'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="card-premium p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-2">
                  {language === 'vi' ? 'Câu hỏi thường gặp' : 'FAQ'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'vi' 
                    ? 'Tìm câu trả lời nhanh cho các câu hỏi phổ biến.'
                    : 'Find quick answers to common questions.'}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/faq">{language === 'vi' ? 'Xem FAQ' : 'View FAQ'}</a>
                </Button>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card-premium p-6">
                <h3 className="font-semibold mb-6">
                  {language === 'vi' ? 'Gửi tin nhắn' : 'Send a Message'}
                </h3>

                {/* Contact Type */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {contactTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setContactType(type.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                        contactType === type.id
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-secondary/50 border-border hover:border-primary/50'
                      )}
                    >
                      <type.icon className="w-5 h-5" />
                      <span className="text-xs font-medium text-center">{type.label}</span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{language === 'vi' ? 'Họ và tên' : 'Full Name'} *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'John Doe'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">{language === 'vi' ? 'Số điện thoại' : 'Phone'}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0912 345 678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">{language === 'vi' ? 'Tiêu đề' : 'Subject'} *</Label>
                      <Input
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder={language === 'vi' ? 'Nhập tiêu đề...' : 'Enter subject...'}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">{language === 'vi' ? 'Nội dung' : 'Message'} *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={language === 'vi' ? 'Nhập nội dung tin nhắn...' : 'Enter your message...'}
                    />
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {language === 'vi' ? 'Đang gửi...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {language === 'vi' ? 'Gửi tin nhắn' : 'Send Message'}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
