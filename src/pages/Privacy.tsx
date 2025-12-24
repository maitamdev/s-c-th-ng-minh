import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Privacy() {
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
              {language === 'vi' ? 'Chính sách bảo mật' : 'Privacy Policy'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {language === 'vi' ? 'Cập nhật lần cuối: 24/12/2024' : 'Last updated: December 24, 2024'}
            </p>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {language === 'vi' ? (
                <>
                  <h2>1. Giới thiệu</h2>
                  <p>
                    SCS GO cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi 
                    thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
                  </p>

                  <h2>2. Thông tin chúng tôi thu thập</h2>
                  <h3>2.1. Thông tin bạn cung cấp</h3>
                  <ul>
                    <li>Họ tên, email, số điện thoại khi đăng ký</li>
                    <li>Thông tin xe điện (model, dung lượng pin)</li>
                    <li>Lịch sử đặt chỗ và thanh toán</li>
                    <li>Đánh giá và phản hồi</li>
                  </ul>

                  <h3>2.2. Thông tin tự động thu thập</h3>
                  <ul>
                    <li>Vị trí địa lý (khi bạn cho phép)</li>
                    <li>Thông tin thiết bị và trình duyệt</li>
                    <li>Dữ liệu sử dụng ứng dụng</li>
                    <li>Cookies và công nghệ theo dõi tương tự</li>
                  </ul>

                  <h2>3. Mục đích sử dụng thông tin</h2>
                  <p>Chúng tôi sử dụng thông tin của bạn để:</p>
                  <ul>
                    <li>Cung cấp và cải thiện dịch vụ</li>
                    <li>Xử lý đặt chỗ và thanh toán</li>
                    <li>Gửi thông báo về đặt chỗ và khuyến mãi</li>
                    <li>Cá nhân hóa trải nghiệm người dùng</li>
                    <li>Phân tích và cải thiện sản phẩm</li>
                    <li>Hỗ trợ khách hàng</li>
                  </ul>

                  <h2>4. Chia sẻ thông tin</h2>
                  <p>Chúng tôi có thể chia sẻ thông tin với:</p>
                  <ul>
                    <li>Các trạm sạc đối tác (để xử lý đặt chỗ)</li>
                    <li>Nhà cung cấp dịch vụ thanh toán</li>
                    <li>Đối tác phân tích dữ liệu</li>
                    <li>Cơ quan pháp luật (khi được yêu cầu)</li>
                  </ul>
                  <p>Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba.</p>

                  <h2>5. Bảo mật dữ liệu</h2>
                  <p>
                    Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ thông tin của bạn, 
                    bao gồm mã hóa SSL, xác thực hai yếu tố và kiểm soát truy cập nghiêm ngặt.
                  </p>

                  <h2>6. Quyền của bạn</h2>
                  <p>Bạn có quyền:</p>
                  <ul>
                    <li>Truy cập và xem thông tin cá nhân</li>
                    <li>Chỉnh sửa thông tin không chính xác</li>
                    <li>Yêu cầu xóa tài khoản và dữ liệu</li>
                    <li>Từ chối nhận email marketing</li>
                    <li>Rút lại sự đồng ý về vị trí</li>
                  </ul>

                  <h2>7. Cookies</h2>
                  <p>
                    Chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng. Bạn có thể quản lý 
                    cài đặt cookies trong trình duyệt của mình.
                  </p>

                  <h2>8. Lưu trữ dữ liệu</h2>
                  <p>
                    Dữ liệu của bạn được lưu trữ trên các máy chủ bảo mật. Chúng tôi chỉ giữ thông tin 
                    trong thời gian cần thiết để cung cấp dịch vụ hoặc theo yêu cầu pháp luật.
                  </p>

                  <h2>9. Trẻ em</h2>
                  <p>
                    Dịch vụ của chúng tôi không dành cho người dưới 18 tuổi. Chúng tôi không cố ý 
                    thu thập thông tin từ trẻ em.
                  </p>

                  <h2>10. Thay đổi chính sách</h2>
                  <p>
                    Chúng tôi có thể cập nhật chính sách này. Các thay đổi quan trọng sẽ được thông báo 
                    qua email hoặc thông báo trong ứng dụng.
                  </p>

                  <h2>11. Liên hệ</h2>
                  <p>
                    Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ:<br />
                    Email: privacy@scsgo.vn<br />
                    Hotline: 1900 xxxx
                  </p>
                </>
              ) : (
                <>
                  <h2>1. Introduction</h2>
                  <p>
                    SCS GO is committed to protecting your privacy. This policy explains how we collect, 
                    use, and protect your personal information.
                  </p>

                  <h2>2. Information We Collect</h2>
                  <h3>2.1. Information You Provide</h3>
                  <ul>
                    <li>Name, email, phone number during registration</li>
                    <li>Electric vehicle information (model, battery capacity)</li>
                    <li>Booking and payment history</li>
                    <li>Reviews and feedback</li>
                  </ul>

                  <h3>2.2. Automatically Collected Information</h3>
                  <ul>
                    <li>Geographic location (when permitted)</li>
                    <li>Device and browser information</li>
                    <li>App usage data</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>

                  <h2>3. How We Use Information</h2>
                  <p>We use your information to:</p>
                  <ul>
                    <li>Provide and improve services</li>
                    <li>Process bookings and payments</li>
                    <li>Send booking notifications and promotions</li>
                    <li>Personalize user experience</li>
                    <li>Analyze and improve products</li>
                    <li>Customer support</li>
                  </ul>

                  <h2>4. Information Sharing</h2>
                  <p>We may share information with:</p>
                  <ul>
                    <li>Partner charging stations (for booking processing)</li>
                    <li>Payment service providers</li>
                    <li>Data analytics partners</li>
                    <li>Law enforcement (when required)</li>
                  </ul>
                  <p>We do not sell your personal information to third parties.</p>

                  <h2>5. Data Security</h2>
                  <p>
                    We implement industry-standard security measures to protect your information, 
                    including SSL encryption, two-factor authentication, and strict access controls.
                  </p>

                  <h2>6. Your Rights</h2>
                  <p>You have the right to:</p>
                  <ul>
                    <li>Access and view personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request account and data deletion</li>
                    <li>Opt-out of marketing emails</li>
                    <li>Withdraw location consent</li>
                  </ul>

                  <h2>7. Cookies</h2>
                  <p>
                    We use cookies to improve user experience. You can manage cookie settings 
                    in your browser.
                  </p>

                  <h2>8. Data Retention</h2>
                  <p>
                    Your data is stored on secure servers. We only retain information for as long 
                    as necessary to provide services or as required by law.
                  </p>

                  <h2>9. Children</h2>
                  <p>
                    Our service is not intended for persons under 18. We do not knowingly 
                    collect information from children.
                  </p>

                  <h2>10. Policy Changes</h2>
                  <p>
                    We may update this policy. Significant changes will be notified via email 
                    or in-app notification.
                  </p>

                  <h2>11. Contact</h2>
                  <p>
                    For privacy policy questions, please contact:<br />
                    Email: privacy@scsgo.vn<br />
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
