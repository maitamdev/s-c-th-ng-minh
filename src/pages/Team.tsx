import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Users,
    Linkedin,
    Mail,
    Github,
} from 'lucide-react';

const teamMembers = [
    {
        name: 'Nguyễn Văn A',
        nameEn: 'Nguyen Van A',
        role: 'CEO & Founder',
        roleVi: 'CEO & Nhà sáng lập',
        image: '/team/member-1.jpg',
        linkedin: '#',
        email: 'nguyenvana@scsgo.vn',
    },
    {
        name: 'Trần Thị B',
        nameEn: 'Tran Thi B',
        role: 'CTO',
        roleVi: 'Giám đốc Công nghệ',
        image: '/team/member-2.jpg',
        linkedin: '#',
        email: 'tranthib@scsgo.vn',
    },
    {
        name: 'Lê Văn C',
        nameEn: 'Le Van C',
        role: 'Head of Product',
        roleVi: 'Trưởng phòng Sản phẩm',
        image: '/team/member-3.jpg',
        linkedin: '#',
        email: 'levanc@scsgo.vn',
    },
    {
        name: 'Phạm Thị D',
        nameEn: 'Pham Thi D',
        role: 'Head of Operations',
        roleVi: 'Trưởng phòng Vận hành',
        image: '/team/member-4.jpg',
        linkedin: '#',
        email: 'phamthid@scsgo.vn',
    },
    {
        name: 'Hoàng Văn E',
        nameEn: 'Hoang Van E',
        role: 'Lead Developer',
        roleVi: 'Trưởng nhóm Phát triển',
        image: '/team/member-5.jpg',
        linkedin: '#',
        github: '#',
        email: 'hoangvane@scsgo.vn',
    },
    {
        name: 'Vũ Thị F',
        nameEn: 'Vu Thi F',
        role: 'UX/UI Designer',
        roleVi: 'Thiết kế UX/UI',
        image: '/team/member-6.jpg',
        linkedin: '#',
        email: 'vuthif@scsgo.vn',
    },
];

export default function Team() {
    const { language } = useLanguage();

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
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {language === 'vi' ? 'Đội ngũ của chúng tôi' : 'Our Team'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            {language === 'vi' ? 'Gặp gỡ đội ngũ tiên phong' : 'Meet Our Pioneering Team'}
                        </h1>
                        <p className="text-muted-foreground">
                            {language === 'vi'
                                ? 'Những con người đam mê công nghệ và môi trường, cùng nhau xây dựng tương lai giao thông xanh.'
                                : 'Passionate people about technology and environment, building the future of green transportation together.'}
                        </p>
                    </motion.div>

                    {/* Team Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={member.email}
                                className="card-premium p-6 group hover:shadow-xl transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* Avatar */}
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-cyan-400 opacity-20 group-hover:opacity-30 transition-opacity" />
                                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center overflow-hidden">
                                        <Users className="w-16 h-16 text-primary" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg mb-1">
                                        {language === 'vi' ? member.name : member.nameEn}
                                    </h3>
                                    <p className="text-sm text-primary mb-3">
                                        {language === 'vi' ? member.roleVi : member.role}
                                    </p>

                                    {/* Social Links */}
                                    <div className="flex items-center justify-center gap-2">
                                        {member.linkedin && (
                                            <a
                                                href={member.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-8 h-8 rounded-lg bg-secondary/50 hover:bg-primary/10 flex items-center justify-center transition-colors"
                                            >
                                                <Linkedin className="w-4 h-4" />
                                            </a>
                                        )}
                                        {member.github && (
                                            <a
                                                href={member.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-8 h-8 rounded-lg bg-secondary/50 hover:bg-primary/10 flex items-center justify-center transition-colors"
                                            >
                                                <Github className="w-4 h-4" />
                                            </a>
                                        )}
                                        <a
                                            href={`mailto:${member.email}`}
                                            className="w-8 h-8 rounded-lg bg-secondary/50 hover:bg-primary/10 flex items-center justify-center transition-colors"
                                        >
                                            <Mail className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Join Us Section */}
                    <motion.div
                        className="max-w-3xl mx-auto mt-16 text-center card-premium p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h2 className="text-2xl font-bold mb-4">
                            {language === 'vi' ? 'Tham gia cùng chúng tôi' : 'Join Our Team'}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            {language === 'vi'
                                ? 'Chúng tôi luôn tìm kiếm những tài năng xuất sắc để tham gia hành trình. Khám phá các vị trí tuyển dụng và tìm thử thách tiếp theo của bạn.'
                                : 'We are always looking for talented individuals to join our journey. Explore our open positions and find your next challenge.'}
                        </p>
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
                        >
                            <Mail className="w-4 h-4" />
                            {language === 'vi' ? 'Liên hệ với chúng tôi' : 'Contact Us'}
                        </a>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
