import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/team_member.dart';
import '../config/theme.dart';

class TeamMemberCard extends StatefulWidget {
  final TeamMember member;

  const TeamMemberCard({
    super.key,
    required this.member,
  });

  @override
  State<TeamMemberCard> createState() => _TeamMemberCardState();
}

class _TeamMemberCardState extends State<TeamMemberCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  bool _isHovered = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.02).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return MouseRegion(
      onEnter: (_) {
        setState(() => _isHovered = true);
        _controller.forward();
      },
      onExit: (_) {
        setState(() => _isHovered = false);
        _controller.reverse();
      },
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCard : Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: isDark
                  ? AppColors.darkBorder.withOpacity(0.3)
                  : AppColors.lightBorder.withOpacity(0.5),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: _isHovered
                    ? (isDark
                        ? AppColors.primary.withOpacity(0.15)
                        : AppColors.primary.withOpacity(0.08))
                    : (isDark
                        ? Colors.black.withOpacity(0.3)
                        : Colors.black.withOpacity(0.04)),
                blurRadius: _isHovered ? 24 : 12,
                offset: Offset(0, _isHovered ? 8 : 4),
                spreadRadius: _isHovered ? 2 : 0,
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Avatar with gradient border
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [
                        AppColors.primary,
                        AppColors.cyanLight,
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(3),
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isDark ? AppColors.darkCard : Colors.white,
                    ),
                    padding: const EdgeInsets.all(3),
                    child: CircleAvatar(
                      radius: 60,
                      backgroundImage: AssetImage(widget.member.avatarUrl),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Name
                Text(
                  widget.member.name,
                  style: GoogleFonts.inter(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: isDark
                        ? AppColors.darkForeground
                        : AppColors.lightForeground,
                    letterSpacing: -0.02,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),

                // Role
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        AppColors.primary,
                        AppColors.cyanLight,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    widget.member.role.toUpperCase(),
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Description
                Text(
                  widget.member.description,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: isDark
                        ? AppColors.darkMutedForeground
                        : AppColors.lightMutedForeground,
                    height: 1.6,
                    letterSpacing: -0.01,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 20),

                // Social Links
                if (widget.member.socialLinks.isNotEmpty)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: widget.member.socialLinks.map((link) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: _SocialIconButton(
                          socialLink: link,
                          isDark: isDark,
                        ),
                      );
                    }).toList(),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SocialIconButton extends StatefulWidget {
  final SocialLink socialLink;
  final bool isDark;

  const _SocialIconButton({
    required this.socialLink,
    required this.isDark,
  });

  @override
  State<_SocialIconButton> createState() => _SocialIconButtonState();
}

class _SocialIconButtonState extends State<_SocialIconButton> {
  bool _isHovered = false;

  IconData _getIcon() {
    switch (widget.socialLink.type) {
      case SocialType.linkedin:
        return Icons.business;
      case SocialType.twitter:
        return Icons.alternate_email;
      case SocialType.github:
        return Icons.code;
      case SocialType.email:
        return Icons.email_outlined;
      case SocialType.link:
        return Icons.link;
    }
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: () {
          // Handle social link tap
          // You can use url_launcher package here
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: _isHovered
                ? AppColors.primary
                : (widget.isDark
                    ? AppColors.darkSecondary
                    : AppColors.lightSecondary),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: _isHovered
                  ? AppColors.primary
                  : (widget.isDark
                      ? AppColors.darkBorder.withOpacity(0.3)
                      : AppColors.lightBorder),
              width: 1,
            ),
          ),
          child: Icon(
            _getIcon(),
            size: 18,
            color: _isHovered
                ? Colors.white
                : (widget.isDark
                    ? AppColors.darkMutedForeground
                    : AppColors.lightMutedForeground),
          ),
        ),
      ),
    );
  }
}
