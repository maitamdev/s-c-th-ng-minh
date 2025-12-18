import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  Zap, 
  MapPin, 
  Brain, 
  Clock, 
  Shield, 
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Building2,
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Tìm trạm thông minh',
    description: 'Bản đồ real-time với hơn 150 trạm sạc trên toàn quốc, lọc theo loại cổng, công suất, giá.',
  },
  {
    icon: Brain,
    title: 'AI Gợi ý tối ưu',
    description: 'Thuật toán AI phân tích vị trí, pin xe, điểm đến để đề xuất trạm phù hợp nhất.',
  },
  {
    icon: BarChart3,
    title: 'Dự đoán thời gian',
    description: 'Xem trước mức độ đông đúc theo giờ, tìm "giờ vàng" để sạc nhanh nhất.',
  },
  {
    icon: Clock,
    title: 'Đặt chỗ trước',
    description: 'Giữ chỗ cổng sạc, không lo hết chỗ. Hủy miễn phí trước 30 phút.',
  },
];

const stats = [
  { value: '150+', label: 'Trạm sạc' },
  { value: '500+', label: 'Cổng sạc' },
  { value: '10K+', label: 'Người dùng' },
  { value: '99%', label: 'Uptime' },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Nền tảng sạc xe điện thông minh</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Tìm trạm sạc tối ưu
              <br />
              <span className="gradient-text">Đặt chỗ trước, không lo chờ</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              SCS GO giúp bạn tìm, dự đoán độ đông và đặt trước cổng sạc xe điện 
              với công nghệ AI. Sạc thông minh, tiết kiệm thời gian.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/explore">
                  <MapPin className="w-5 h-5" />
                  Khám phá bản đồ
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/auth?mode=register">
                  Đăng ký miễn phí
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sạc xe thông minh hơn với <span className="gradient-text">AI</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              SCS GO kết hợp dữ liệu real-time và thuật toán AI để mang đến 
              trải nghiệm tìm và đặt trạm sạc tốt nhất.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                className="card-premium p-6 text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Brain className="w-4 h-4" />
                AI Engine
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                AI hiểu bạn cần gì,
                <br />
                <span className="gradient-text">gợi ý trạm tối ưu</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Thuật toán AI của SCS GO phân tích nhiều yếu tố để tìm trạm sạc 
                phù hợp nhất với bạn: vị trí hiện tại, mức pin, điểm đến, 
                giờ cao điểm, giá cả và đánh giá.
              </p>

              <div className="space-y-4">
                {[
                  'Gợi ý trạm theo hành trình của bạn',
                  'Dự đoán độ đông theo giờ với độ chính xác cao',
                  'Tối ưu theo tiêu chí: Nhanh, Rẻ, Ít lệch tuyến',
                  'Giải thích lý do AI chọn trạm',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Button variant="hero" className="mt-8" asChild>
                <Link to="/explore">
                  Trải nghiệm ngay
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* AI Demo Card */}
              <div className="card-premium p-6 glow-primary">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">AI đề xuất cho bạn</p>
                    <p className="text-sm text-muted-foreground">Dựa trên vị trí và hồ sơ xe</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'VinFast Hà Nội 1', score: 95, power: '150 kW', distance: '1.2 km' },
                    { name: 'EVN Cầu Giấy', score: 88, power: '100 kW', distance: '2.5 km' },
                    { name: 'GreenCharge Đống Đa', score: 82, power: '60 kW', distance: '3.1 km' },
                  ].map((station, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-sm">{station.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {station.power} • {station.distance}
                        </p>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-medium">
                        {station.score}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 px-3 py-1.5 bg-success/20 text-success rounded-full text-sm font-medium border border-success/30">
                Giờ vàng: 10:00 - 12:00
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Gói dịch vụ linh hoạt
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Từ miễn phí cho người dùng cá nhân đến Enterprise cho doanh nghiệp lớn.
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              {[
                { name: 'Free', price: '0đ', desc: 'Cho người dùng cá nhân', icon: Users },
                { name: 'Plus', price: '99K/tháng', desc: 'Nhiều tính năng hơn', icon: Zap, highlighted: true },
                { name: 'Business', price: 'Liên hệ', desc: 'Cho chủ trạm sạc', icon: Building2 },
              ].map((plan, i) => (
                <div 
                  key={i}
                  className={`card-premium p-6 ${plan.highlighted ? 'border-primary glow-sm' : ''}`}
                >
                  <plan.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-2xl font-bold my-2">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                </div>
              ))}
            </div>

            <Button variant="outline" size="lg" asChild>
              <Link to="/pricing">
                Xem chi tiết bảng giá
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="card-premium p-8 md:p-12 text-center glow-primary relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-cyan-500/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Sẵn sàng sạc thông minh?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Tham gia cùng hàng nghìn người dùng đang sử dụng SCS GO để tìm và đặt trạm sạc.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/auth?mode=register">
                    Bắt đầu miễn phí
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/explore">
                    Khám phá trạm sạc
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
