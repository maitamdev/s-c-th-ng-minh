import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/team_member.dart';
import '../../widgets/team_member_card.dart';
import '../../config/theme.dart';

class TeamScreen extends StatelessWidget {
  const TeamScreen({super.key});

  static final List<TeamMember> _teamMembers = [
    const TeamMember(
      name: 'Nguyễn Minh Tuấn',
      role: 'CEO & Founder',
      description:
          'Lãnh đạo tầm nhìn với 15 năm kinh nghiệm trong lĩnh vực AI và năng lượng sạch.',
      avatarUrl: 'assets/team/member_1.png',
      socialLinks: [
        SocialLink(type: SocialType.linkedin, url: '#'),
        SocialLink(type: SocialType.twitter, url: '#'),
        SocialLink(type: SocialType.email, url: '#'),
      ],
    ),
    const TeamMember(
      name: 'Trần Thị Hương',
      role: 'Chief Tech Officer',
      description:
          'Kỹ sư Google cựu chiến binh chuyên về hệ thống phân tán và kiến trúc đám mây.',
      avatarUrl: 'assets/team/member_2.png',
      socialLinks: [
        SocialLink(type: SocialType.github, url: '#'),
        SocialLink(type: SocialType.linkedin, url: '#'),
      ],
    ),
    const TeamMember(
      name: 'Lê Quang Hải',
      role: 'Head of Design',
      description:
          'Nhà thiết kế đoạt giải thưởng tập trung vào giao diện người dùng và trải nghiệm.',
      avatarUrl: 'assets/team/member_3.png',
      socialLinks: [
        SocialLink(type: SocialType.twitter, url: '#'),
        SocialLink(type: SocialType.link, url: '#'),
      ],
    ),
    const TeamMember(
      name: 'Phạm Thu Hà',
      role: 'Lead Engineer',
      description:
          'Chuyên gia phát triển full-stack xây dựng môi trường siêu mở rộng.',
      avatarUrl: 'assets/team/member_4.png',
      socialLinks: [
        SocialLink(type: SocialType.github, url: '#'),
        SocialLink(type: SocialType.email, url: '#'),
      ],
    ),
    const TeamMember(
      name: 'Hoàng Văn Nam',
      role: 'Product Strategy',
      description:
          'Nhà tư duy chiến lược thúc đẩy tăng trưởng sản phẩm và mở rộng thị trường.',
      avatarUrl: 'assets/team/member_5.png',
      socialLinks: [
        SocialLink(type: SocialType.linkedin, url: '#'),
        SocialLink(type: SocialType.twitter, url: '#'),
      ],
    ),
    const TeamMember(
      name: 'Đỗ Thị Lan',
      role: 'Operations Director',
      description:
          'Đơn giản hóa hoạt động và xây dựng văn hóa làm việc từ xa hạng nhất.',
      avatarUrl: 'assets/team/member_6.png',
      socialLinks: [
        SocialLink(type: SocialType.linkedin, url: '#'),
        SocialLink(type: SocialType.email, url: '#'),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final screenWidth = MediaQuery.of(context).size.width;
    final crossAxisCount = screenWidth > 900 ? 3 : (screenWidth > 600 ? 2 : 1);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: Colors.transparent,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: isDark
                        ? [
                            AppColors.darkBackground,
                            AppColors.darkCard,
                            AppColors.primary.withOpacity(0.1),
                          ]
                        : [
                            const Color(0xFFF0F9FF),
                            const Color(0xFFE0F2FE),
                            AppColors.primaryLight.withOpacity(0.1),
                          ],
                  ),
                ),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Vision & Purpose label
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: AppColors.primary.withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          'TẦM NHÌN & SỨ MỆNH',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Main title
                      ShaderMask(
                        shaderCallback: (bounds) => const LinearGradient(
                          colors: [
                            AppColors.primary,
                            AppColors.cyanLight,
                          ],
                        ).createShader(bounds),
                        child: Text(
                          'Gặp Gỡ Đội Ngũ\nTiên Phong',
                          style: GoogleFonts.inter(
                            fontSize: 42,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.03,
                            height: 1.1,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Subtitle
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32),
                        child: Text(
                          'Đội ngũ kỹ sư, nhà thiết kế và nhà tư tưởng đẳng cấp thế giới\nxây dựng tương lai công nghệ thông qua đổi mới sáng tạo tập thể.',
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            color: isDark
                                ? AppColors.darkMutedForeground
                                : AppColors.lightMutedForeground,
                            height: 1.6,
                            letterSpacing: -0.01,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Team Members Grid
          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: SliverGrid(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                childAspectRatio: 0.75,
                crossAxisSpacing: 20,
                mainAxisSpacing: 20,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  return TeamMemberCard(member: _teamMembers[index]);
                },
                childCount: _teamMembers.length,
              ),
            ),
          ),

          // Call to Action Section
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(20, 40, 20, 40),
              padding: const EdgeInsets.all(48),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDark
                      ? [
                          AppColors.darkCard,
                          AppColors.primary.withOpacity(0.05),
                        ]
                      : [
                          const Color(0xFFF0F9FF),
                          AppColors.primaryLight.withOpacity(0.1),
                        ],
                ),
                borderRadius: BorderRadius.circular(32),
                border: Border.all(
                  color: isDark
                      ? AppColors.darkBorder.withOpacity(0.3)
                      : AppColors.lightBorder,
                  width: 1,
                ),
              ),
              child: Column(
                children: [
                  Text(
                    'Quan tâm đến việc làm việc cùng chúng tôi?',
                    style: GoogleFonts.inter(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: isDark
                          ? AppColors.darkForeground
                          : AppColors.lightForeground,
                      letterSpacing: -0.02,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Chúng tôi luôn tìm kiếm những tài năng xuất sắc để tham gia hành trình.\nKhám phá các vị trí tuyển dụng và tìm thử thách tiếp theo của bạn.',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: isDark
                          ? AppColors.darkMutedForeground
                          : AppColors.lightMutedForeground,
                      height: 1.6,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Primary CTA
                      Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              AppColors.primary,
                              AppColors.cyanLight,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.4),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 18,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: Text(
                            'Xem Vị Trí Tuyển Dụng',
                            style: GoogleFonts.inter(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                              letterSpacing: -0.01,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),

                      // Secondary CTA
                      OutlinedButton(
                        onPressed: () {},
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 32,
                            vertical: 18,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          side: BorderSide(
                            color: isDark
                                ? AppColors.darkBorder
                                : AppColors.lightBorder,
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          'Theo Dõi Blog',
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? AppColors.darkForeground
                                : AppColors.lightForeground,
                            letterSpacing: -0.01,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
