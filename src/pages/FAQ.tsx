import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, HelpCircle, Zap, CreditCard, User, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  icon: typeof HelpCircle;
  title: string;
  items: FAQItem[];
}

export default function FAQ() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqCategories: FAQCategory[] = language === 'vi' ? [
    {
      id: 'general',
      icon: HelpCircle,
      title: 'Câu hỏi chung',
      items: [
        {
          question: 'SCS GO là gì?',
          answer: 'SCS GO là nền tảng tìm kiếm và đặt chỗ trạm sạc xe điện thông minh. Chúng tôi sử dụng AI để gợi ý trạm sạc phù hợp nhất dựa trên vị trí, mức pin và nhu cầu của bạn.',
        },
        {
          question: 'SCS GO có miễn phí không?',
          answer: 'Có, bạn có thể sử dụng SCS GO hoàn toàn miễn phí với các tính năng cơ bản. Chúng tôi cũng có gói Pro với nhiều tính năng nâng cao hơn.',
        },
        {
          question: 'Làm sao để bắt đầu sử dụng?',
          answer: 'Bạn chỉ cần đăng ký tài khoản bằng email hoặc Google, sau đó có thể tìm kiếm và đặt chỗ trạm sạc ngay lập tức.',
        },
      ],
    },
    {
      id: 'booking',
      icon: Zap,
      title: 'Đặt chỗ sạc',
      items: [
        {
          question: 'Làm sao để đặt chỗ sạc?',
          answer: 'Tìm trạm sạc phù hợp → Chọn cổng sạc và thời gian → Chọn dịch vụ bổ sung (nếu có) → Thanh toán → Hoàn tất! Bạn sẽ nhận được mã QR để check-in tại trạm.',
        },
        {
          question: 'Tôi có thể hủy đặt chỗ không?',
          answer: 'Có, bạn có thể hủy miễn phí trước 30 phút so với giờ hẹn. Hủy trong vòng 30 phút có thể bị tính phí.',
        },
        {
          question: 'Nếu tôi đến muộn thì sao?',
          answer: 'Chỗ của bạn sẽ được giữ trong 15 phút. Sau đó, đặt chỗ có thể bị hủy tự động và bạn cần đặt lại.',
        },
        {
          question: 'Tôi có thể đặt chỗ cho người khác không?',
          answer: 'Có, bạn có thể đặt chỗ và chia sẻ mã QR cho người khác sử dụng.',
        },
      ],
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: 'Thanh toán',
      items: [
        {
          question: 'SCS GO hỗ trợ những phương thức thanh toán nào?',
          answer: 'Chúng tôi hỗ trợ thẻ Visa/Mastercard, ví MoMo, VNPay (QR Pay, thẻ ATM nội địa), và ví SCS GO.',
        },
        {
          question: 'Thanh toán có an toàn không?',
          answer: 'Có, tất cả giao dịch được mã hóa SSL và xử lý qua các cổng thanh toán uy tín, tuân thủ tiêu chuẩn PCI DSS.',
        },
        {
          question: 'Tôi có thể hoàn tiền không?',
          answer: 'Nếu hủy đặt chỗ đúng quy định, tiền sẽ được hoàn về phương thức thanh toán ban đầu trong 3-5 ngày làm việc.',
        },
      ],
    },
    {
      id: 'account',
      icon: User,
      title: 'Tài khoản',
      items: [
        {
          question: 'Làm sao để đổi mật khẩu?',
          answer: 'Vào Dashboard → Cài đặt → Bảo mật → Đổi mật khẩu. Hoặc sử dụng tính năng "Quên mật khẩu" ở trang đăng nhập.',
        },
        {
          question: 'Tôi có thể xóa tài khoản không?',
          answer: 'Có, bạn có thể yêu cầu xóa tài khoản trong phần Cài đặt. Lưu ý rằng hành động này không thể hoàn tác.',
        },
        {
          question: 'Làm sao để kết nối thông tin xe?',
          answer: 'Vào Dashboard → Xe của tôi → Kết nối xe hoặc nhập thủ công thông tin xe điện của bạn.',
        },
      ],
    },
    {
      id: 'stations',
      icon: MapPin,
      title: 'Trạm sạc',
      items: [
        {
          question: 'Thông tin trạm sạc có chính xác không?',
          answer: 'Chúng tôi cập nhật thông tin từ các nhà cung cấp và người dùng. Tuy nhiên, tình trạng thực tế có thể thay đổi, vui lòng kiểm tra trước khi đến.',
        },
        {
          question: 'Tôi có thể đăng ký trạm sạc của mình không?',
          answer: 'Có, nếu bạn là chủ trạm sạc, hãy liên hệ với chúng tôi qua trang Liên hệ hoặc đăng ký gói Business.',
        },
        {
          question: 'Làm sao để báo cáo sự cố tại trạm?',
          answer: 'Bạn có thể báo cáo sự cố qua nút "Báo cáo" trên trang chi tiết trạm hoặc liên hệ hotline 1900 xxxx.',
        },
      ],
    },
  ] : [
    {
      id: 'general',
      icon: HelpCircle,
      title: 'General Questions',
      items: [
        {
          question: 'What is SCS GO?',
          answer: 'SCS GO is a smart EV charging station search and booking platform. We use AI to recommend the most suitable charging stations based on your location, battery level, and needs.',
        },
        {
          question: 'Is SCS GO free?',
          answer: 'Yes, you can use SCS GO completely free with basic features. We also offer a Pro plan with more advanced features.',
        },
        {
          question: 'How do I get started?',
          answer: 'Simply register an account with email or Google, then you can search and book charging stations immediately.',
        },
      ],
    },
    {
      id: 'booking',
      icon: Zap,
      title: 'Booking',
      items: [
        {
          question: 'How do I book a charging slot?',
          answer: 'Find a suitable station → Select charger and time → Choose additional services (optional) → Pay → Done! You will receive a QR code to check-in at the station.',
        },
        {
          question: 'Can I cancel my booking?',
          answer: 'Yes, you can cancel for free up to 30 minutes before your scheduled time. Cancellations within 30 minutes may incur fees.',
        },
        {
          question: 'What if I arrive late?',
          answer: 'Your slot will be held for 15 minutes. After that, the booking may be automatically cancelled and you will need to rebook.',
        },
      ],
    },
    {
      id: 'payment',
      icon: CreditCard,
      title: 'Payment',
      items: [
        {
          question: 'What payment methods does SCS GO support?',
          answer: 'We support Visa/Mastercard, MoMo wallet, VNPay (QR Pay, domestic ATM cards), and SCS GO wallet.',
        },
        {
          question: 'Is payment secure?',
          answer: 'Yes, all transactions are SSL encrypted and processed through reputable payment gateways, complying with PCI DSS standards.',
        },
      ],
    },
  ];

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.items.length > 0);

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
              {language === 'vi' ? 'Câu hỏi thường gặp' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'vi' 
                ? 'Tìm câu trả lời cho các câu hỏi phổ biến về SCS GO'
                : 'Find answers to common questions about SCS GO'}
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={language === 'vi' ? 'Tìm kiếm câu hỏi...' : 'Search questions...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>

          {/* FAQ Categories */}
          <div className="max-w-3xl mx-auto space-y-8">
            {filteredCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">{category.title}</h2>
                </div>

                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => {
                    const itemId = `${category.id}-${itemIndex}`;
                    const isOpen = openItems.includes(itemId);

                    return (
                      <div
                        key={itemIndex}
                        className="card-premium overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <span className="font-medium pr-4">{item.question}</span>
                          <ChevronDown className={cn(
                            'w-5 h-5 text-muted-foreground transition-transform flex-shrink-0',
                            isOpen && 'rotate-180'
                          )} />
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-4 pb-4 text-muted-foreground">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === 'vi' ? 'Không tìm thấy câu hỏi phù hợp' : 'No matching questions found'}
                </p>
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <motion.div 
            className="max-w-3xl mx-auto mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-premium p-8 bg-primary/5 border-primary/20">
              <h3 className="text-xl font-semibold mb-2">
                {language === 'vi' ? 'Không tìm thấy câu trả lời?' : "Can't find your answer?"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === 'vi' 
                  ? 'Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn.'
                  : 'Our support team is always ready to help you.'}
              </p>
              <Button variant="hero" asChild>
                <Link to="/contact">
                  {language === 'vi' ? 'Liên hệ hỗ trợ' : 'Contact Support'}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
