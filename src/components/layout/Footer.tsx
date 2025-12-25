import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Zap, 
  Mail, 
  Phone, 
  MapPin,
  Facebook,
  Youtube,
  MessageCircle,
} from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { href: '/explore', label: language === 'vi' ? 'Tìm trạm sạc' : 'Find Stations' },
      { href: '/pricing', label: language === 'vi' ? 'Bảng giá' : 'Pricing' },
      { href: '/#features', label: language === 'vi' ? 'Tính năng' : 'Features' },
      { href: '/#how-it-works', label: language === 'vi' ? 'Cách hoạt động' : 'How it works' },
    ],
    support: [
      { href: '/contact', label: language === 'vi' ? 'Liên hệ' : 'Contact' },
      { href: '/faq', label: 'FAQ' },
      { href: '/help', label: language === 'vi' ? 'Trung tâm hỗ trợ' : 'Help Center' },
    ],
    legal: [
      { href: '/terms', label: language === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Service' },
      { href: '/privacy', label: language === 'vi' ? 'Chính sách bảo mật' : 'Privacy Policy' },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <img src="/logo.jpg" alt="SCS GO" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold gradient-text">SCS GO</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'vi' 
                ? 'Nền tảng tìm kiếm và đặt chỗ trạm sạc xe điện thông minh hàng đầu Việt Nam.'
                : 'Vietnam\'s leading smart EV charging station search and booking platform.'}
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a 
                href="https://zalo.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {language === 'vi' ? 'Sản phẩm' : 'Product'}
            </h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {language === 'vi' ? 'Hỗ trợ' : 'Support'}
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              {language === 'vi' ? 'Liên hệ' : 'Contact'}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Tầng 10, Tòa nhà ABC, 123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:1900xxxx" className="hover:text-primary">1900 xxxx</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:support@scsgo.vn" className="hover:text-primary">support@scsgo.vn</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SCS GO. {language === 'vi' ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map((link) => (
              <Link 
                key={link.href}
                to={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
