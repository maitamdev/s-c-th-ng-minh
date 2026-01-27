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
        name: 'Sơn Hoàng Hiếu',
        nameEn: 'Son Hoang Hieu',
        role: 'CEO (Chief Executive Officer)',
        roleVi: 'Giám đốc điều hành',
        university: 'Trường Đại học Nguyễn Tất Thành',
        universityEn: 'Nguyen Tat Thanh University',
        faculty: 'Khoa Quản trị Kinh doanh',
        facultyEn: 'Faculty of Business Administration',
        studentId: '2200012147',
        image: '/team/member-1.jpg',
        linkedin: '#',
        email: 'hieu.son@scsgo.vn',
    },
    {
        name: 'Vũ Thị Thơm',
        nameEn: 'Vu Thi Thom',
        role: 'CMO (Chief Marketing Officer)',
        roleVi: 'Giám đốc tiếp thị',
        university: 'Trường Đại học Nguyễn Tất Thành',
        universityEn: 'Nguyen Tat Thanh University',
        faculty: 'Khoa Quản trị Kinh doanh',
        facultyEn: 'Faculty of Business Administration',
        studentId: '2311559764',
        image: '/team/member-2.jpg',
        linkedin: '#',
        email: 'thom.vu@scsgo.vn',
    },
    {
        name: 'Nguyễn Thị Bích Trâm',
        nameEn: 'Nguyen Thi Bich Tram',
        role: 'CCO (Chief Creative Officer)',
        roleVi: 'Giám đốc sáng tạo',
        university: 'Trường Đại học Nguyễn Tất Thành',
        universityEn: 'Nguyen Tat Thanh University',
        faculty: 'Khoa Quản trị Kinh doanh',
        facultyEn: 'Faculty of Business Administration',
        studentId: '2311553463',
        image: '/team/member-3.jpg',
        linkedin: '#',
        email: 'tram.nguyen@scsgo.vn',
    },
    {
        name: 'Bùi Thị Tuyên',
        nameEn: 'Bui Thi Tuyen',
        role: 'CFO (Chief Financial Officer)',
        roleVi: 'Giám đốc tài chính',
        university: 'Trường Đại học Công Nghiệp TP.HCM',
        universityEn: 'HCMC University of Industry',
        faculty: 'Khoa Quản trị Kinh doanh',
        facultyEn: 'Faculty of Business Administration',
        studentId: '22703911',
        image: '/team/member-4.jpg',
        linkedin: '#',
        email: 'tuyen.bui@scsgo.vn',
    },
    {
        name: 'Mai Trần Thiện Tâm',
        nameEn: 'Mai Tran Thien Tam',
        role: 'CTO (Chief Technology Officer)',
        roleVi: 'Giám đốc công nghệ',
        university: 'Đại học Hùng Vương TP.HCM',
        universityEn: 'Hung Vuong University HCMC',
        faculty: 'Khoa Kỹ Thuật Công Nghệ',
        facultyEn: 'Faculty of Engineering Technology',
        studentId: '2305CT2070',
        image: '/team/member-5.jpg',
        linkedin: '#',
        github: '#',
        email: 'tam.mai@scsgo.vn',
    },
    {
        name: 'Trần Biểu',
        nameEn: 'Tran Bieu',
        role: 'COO (Chief Operations Officer)',
        roleVi: 'Giám đốc vận hành',
        university: 'Trường Đại Học Văn Hiến',
        universityEn: 'Van Hien University',
        faculty: 'Khoa Kinh Tế Quản Trị',
        facultyEn: 'Faculty of Economics and Management',
        studentId: '231A230072',
        image: '/team/member-6.jpg',
        linkedin: '#',
        email: 'bieu.tran@scsgo.vn',
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
                                    <p className="text-sm text-primary font-medium mb-2">
                                        {language === 'vi' ? member.roleVi : member.role}
                                    </p>

                                    {/* University Info */}
                                    <div className="text-xs text-muted-foreground mb-3 space-y-1">
                                        <p className="font-medium">
                                            {language === 'vi' ? member.university : member.universityEn}
                                        </p>
                                        <p>{language === 'vi' ? member.faculty : member.facultyEn}</p>
                                        <p className="font-mono">MSSV: {member.studentId}</p>
                                    </div>

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
