import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Tính năng', href: '#features' },
    { label: 'Bảng giá', href: '/pricing' },
    { label: 'Khám phá', href: '/explore' },
    { label: 'Cho doanh nghiệp', href: '/pricing#operator' },
  ],
  company: [
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Tuyển dụng', href: '/careers' },
    { label: 'Liên hệ', href: '/contact' },
  ],
  legal: [
    { label: 'Điều khoản sử dụng', href: '/terms' },
    { label: 'Chính sách bảo mật', href: '/privacy' },
    { label: 'Cookie', href: '/cookies' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="text-xl font-bold gradient-text">SCS GO</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Nền tảng tìm và đặt trạm sạc xe điện thông minh hàng đầu Việt Nam.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Sản phẩm</h4>
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

          <div>
            <h4 className="font-semibold mb-4">Công ty</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
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

          <div>
            <h4 className="font-semibold mb-4">Pháp lý</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
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
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            2024 SCS GO. Bản quyền thuộc về SCS GO.
          </p>
          <p className="text-sm text-muted-foreground">
            Được xây dựng với tâm huyết tại Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}
