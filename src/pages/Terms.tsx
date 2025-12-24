import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Terms() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {language === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Service'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {language === 'vi' ? 'Cập nhật lần cuối: 24/12/2024' : 'Last updated: December 24, 2024'}
            </p>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {language === 'vi' ? (
                <>
                  <h2>1. Giới thiệu</h2>
                  <p>
                    Chào mừng bạn đến với SCS GO. Bằng việc truy cập và sử dụng dịch vụ của chúng tôi, 
                    bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này.
                  </p>

                  <h2>2. Định nghĩa</h2>
                  <ul>
                    <li><strong>"Dịch vụ"</strong>: Nền tảng tìm kiếm và đặt chỗ trạm sạc xe điện SCS GO</li>
                    <li><strong>"Người dùng"</strong>: Cá nhân hoặc tổ chức sử dụng Dịch vụ</li>
                    <li><strong>"Trạm sạc"</strong>: Các điểm sạc xe điện được liệt kê trên nền tảng</li>
                  </ul>

                  <h2>3. Đăng ký tài khoản</h2>
                  <p>
                    Để sử dụng đầy đủ tính năng của SCS GO, bạn cần đăng ký tài khoản với thông tin chính xác. 
                    Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.
                  </p>

                  <h2>4. Sử dụng dịch vụ</h2>
                  <p>Khi sử dụng SCS GO, bạn đồng ý:</p>
                  <ul>
                    <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                    <li>Không can thiệp vào hoạt động của hệ thống</li>
                    <li>Cung cấp thông tin chính xác khi đặt chỗ</li>
                    <li>Tuân thủ quy định tại các trạm sạc</li>
                  </ul>

                  <h2>5. Đặt chỗ và thanh toán</h2>
                  <p>
                    Khi đặt chỗ sạc xe, bạn cam kết sẽ đến đúng giờ. Việc hủy đặt chỗ phải được thực hiện 
                    trước 30 phút so với giờ hẹn. Các khoản thanh toán được xử lý qua các cổng thanh toán 
                    an toàn và tuân thủ quy định pháp luật.
                  </p>

                  <h2>6. Chính sách hủy</h2>
                  <ul>
                    <li>Hủy trước 30 phút: Miễn phí</li>
                    <li>Hủy trong vòng 30 phút: Có thể bị tính phí</li>
                    <li>Không đến (No-show): Có thể bị hạn chế tài khoản</li>
                  </ul>

                  <h2>7. Giới hạn trách nhiệm</h2>
                  <p>
                    SCS GO là nền tảng kết nối người dùng với các trạm sạc. Chúng tôi không chịu trách nhiệm 
                    về chất lượng dịch vụ tại các trạm sạc hoặc các sự cố phát sinh trong quá trình sạc xe.
                  </p>

                  <h2>8. Quyền sở hữu trí tuệ</h2>
                  <p>
                    Tất cả nội dung, thiết kế, logo và thương hiệu trên SCS GO thuộc quyền sở hữu của 
                    công ty chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ.
                  </p>

                  <h2>9. Thay đổi điều khoản</h2>
                  <p>
                    Chúng tôi có quyền cập nhật các điều khoản này bất cứ lúc nào. Việc tiếp tục sử dụng 
                    dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
                  </p>

                  <h2>10. Liên hệ</h2>
                  <p>
                    Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ:<br />
                    Email: legal@scsgo.vn<br />
                    Hotline: 1900 xxxx
                  </p>
                </>
              ) : (
                <>
                  <h2>1. Introduction</h2>
                  <p>
                    Welcome to SCS GO. By accessing and using our services, you agree to comply with 
                    the terms and conditions set forth in this document.
                  </p>

                  <h2>2. Definitions</h2>
                  <ul>
                    <li><strong>"Service"</strong>: The SCS GO EV charging station search and booking platform</li>
                    <li><strong>"User"</strong>: Individual or organization using the Service</li>
                    <li><strong>"Charging Station"</strong>: EV charging points listed on the platform</li>
                  </ul>

                  <h2>3. Account Registration</h2>
                  <p>
                    To fully use SCS GO features, you need to register an account with accurate information. 
                    You are responsible for maintaining the security of your login credentials.
                  </p>

                  <h2>4. Use of Service</h2>
                  <p>When using SCS GO, you agree to:</p>
                  <ul>
                    <li>Not use the service for illegal purposes</li>
                    <li>Not interfere with system operations</li>
                    <li>Provide accurate information when booking</li>
                    <li>Comply with regulations at charging stations</li>
                  </ul>

                  <h2>5. Booking and Payment</h2>
                  <p>
                    When booking a charging slot, you commit to arriving on time. Cancellations must be made 
                    at least 30 minutes before the scheduled time. Payments are processed through secure 
                    payment gateways in compliance with regulations.
                  </p>

                  <h2>6. Cancellation Policy</h2>
                  <ul>
                    <li>Cancel 30+ minutes before: Free</li>
                    <li>Cancel within 30 minutes: May incur fees</li>
                    <li>No-show: May result in account restrictions</li>
                  </ul>

                  <h2>7. Limitation of Liability</h2>
                  <p>
                    SCS GO is a platform connecting users with charging stations. We are not responsible 
                    for service quality at charging stations or incidents during charging.
                  </p>

                  <h2>8. Intellectual Property</h2>
                  <p>
                    All content, designs, logos, and trademarks on SCS GO are owned by our company 
                    and protected by intellectual property laws.
                  </p>

                  <h2>9. Changes to Terms</h2>
                  <p>
                    We reserve the right to update these terms at any time. Continued use of the service 
                    after changes means you accept the new terms.
                  </p>

                  <h2>10. Contact</h2>
                  <p>
                    For questions about terms of service, please contact:<br />
                    Email: legal@scsgo.vn<br />
                    Hotline: 1900 xxxx
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
