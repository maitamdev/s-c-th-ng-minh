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
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Building2,
  Play,
  Shield,
  Bolt,
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

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section - 2 Column Layout */}
      <section className="relative pt-24 pb-16 lg:pt-28 lg:pb-24 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
        
        {/* Glow effects */}
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium">Nền tảng sạc xe điện thông minh</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
                Bạn có đang sạc xe
                <br />
                <span className="gradient-text italic">thông minh?</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Tìm trạm sạc tối ưu và <span className="text-foreground font-medium">đặt chỗ trước</span>. 
                Công cụ AI giúp bạn tiết kiệm thời gian khi sạc xe điện.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/explore">
                    Tìm trạm ngay
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" className="group" asChild>
                  <Link to="/pricing">
                    <Play className="w-4 h-4 group-hover:text-primary transition-colors" />
                    Xem demo
                  </Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-foreground/80">Miễn phí sử dụng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="text-foreground/80">Bảo mật dữ liệu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bolt className="w-4 h-4 text-success" />
                  <span className="text-foreground/80">Cập nhật real-time</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Image/Visual */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative">
                {/* Glow behind image */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-cyan-500/20 to-primary/20 rounded-3xl blur-2xl opacity-60" />
                
                {/* Main image container */}
                <div className="relative rounded-3xl overflow-hidden border border-border/40 shadow-2xl shadow-primary/20">
                  {/* Image with overlay */}
                  <div className="relative aspect-[4/3]">
                    <img 
                      src="/AZsvv-Twpeb29gkCO-cyUQ-AZsvv-TwZDsf5jQBo_vLBw.jpg" 
                      alt="EV Charging Station"
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
                    
                    {/* Scan line effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] animate-scan" />
                    </div>
                  </div>
                </div>

                {/* Floating card - AI Score */}
                <motion.div 
                  className="absolute -top-4 -right-4 md:right-4 card-premium p-4 shadow-2xl backdrop-blur-xl bg-card/90"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">AI đề xuất</p>
                      <p className="font-bold text-lg text-success">95% phù hợp</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card - Station info */}
                <motion.div 
                  className="absolute -bottom-4 -left-4 md:left-4 card-premium p-4 shadow-2xl backdrop-blur-xl bg-card/90 max-w-[220px]"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    <span className="text-xs text-success font-medium">3 cổng trống</span>
                  </div>
                  <p className="font-semibold text-sm mb-1">VinFast Hà Nội 1</p>
                  <p className="text-xs text-muted-foreground">150 kW • 1.2 km • 4.8⭐</p>
                </motion.div>

                {/* Corner accent */}
                <div className="absolute -top-2 -left-2 w-20 h-20 border-l-2 border-t-2 border-primary/50 rounded-tl-3xl" />
                <div className="absolute -bottom-2 -right-2 w-20 h-20 border-r-2 border-b-2 border-cyan-500/50 rounded-br-3xl" />
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 lg:mt-24 pt-8 border-t border-border/40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
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
                <h3 className="font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.description}</p>
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
                    <span className="text-foreground">{item}</span>
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
      <section className="py-20 bg-card/30">
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
                  <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                  <p className="text-2xl font-bold my-2 text-foreground">{plan.price}</p>
                  <p className="text-sm text-foreground/70">{plan.desc}</p>
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
