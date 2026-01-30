import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/community_provider.dart';
import '../../models/community.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(lang.isVietnamese ? 'Cộng đồng' : 'Community'),
        automaticallyImplyLeading: false,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: IconButton(
              icon: const Icon(Icons.search, color: AppColors.primary),
              onPressed: () {
                // TODO: Search
              },
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelColor: AppColors.primary,
          unselectedLabelColor: isDark ? Colors.grey[400] : Colors.grey[600],
          labelStyle:
              const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          tabs: [
            Tab(
              icon: const Icon(Icons.forum_outlined, size: 20),
              text: lang.isVietnamese ? 'Chia sẻ' : 'Posts',
            ),
            Tab(
              icon: const Icon(Icons.star_outline, size: 20),
              text: lang.isVietnamese ? 'Đánh giá' : 'Reviews',
            ),
            Tab(
              icon: const Icon(Icons.report_outlined, size: 20),
              text: lang.isVietnamese ? 'Báo cáo' : 'Reports',
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _PostsTab(),
          _ReviewsTab(),
          _ReportsTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateDialog(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(
          lang.isVietnamese ? 'Đăng bài' : 'New Post',
          style:
              const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  void _showCreateDialog(BuildContext context) {
    final lang = context.read<LanguageProvider>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _CreatePostSheet(tabIndex: _tabController.index),
    );
  }
}

// Posts Tab
class _PostsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final community = context.watch<CommunityProvider>();
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (community.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Simulate refresh
        await Future.delayed(const Duration(seconds: 1));
      },
      child: ListView.builder(
        padding: const EdgeInsets.only(top: 16, bottom: 100),
        itemCount: community.posts.length,
        itemBuilder: (context, index) {
          final post = community.posts[index];
          return _PostCard(post: post);
        },
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  final CommunityPost post;

  const _PostCard({required this.post});

  @override
  Widget build(BuildContext context) {
    final community = context.read<CommunityProvider>();
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(post.authorAvatar),
                  onBackgroundImageError: (_, __) {},
                  child: const Icon(Icons.person, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        post.authorName,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        _getTimeAgo(post.createdAt, lang.isVietnamese),
                        style: TextStyle(
                          color: Colors.grey[500],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                _PostTypeBadge(type: post.type),
              ],
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              post.content,
              style: const TextStyle(fontSize: 14, height: 1.5),
            ),
          ),

          // Station tag if any
          if (post.stationName != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.ev_station,
                        size: 14, color: AppColors.primary),
                    const SizedBox(width: 6),
                    Text(
                      post.stationName!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Actions
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                _ActionButton(
                  icon: post.isLiked ? Icons.favorite : Icons.favorite_border,
                  label: '${post.likes}',
                  color: post.isLiked ? Colors.red : null,
                  onTap: () {
                    HapticFeedback.lightImpact();
                    community.toggleLike(post.id);
                  },
                ),
                const SizedBox(width: 16),
                _ActionButton(
                  icon: Icons.comment_outlined,
                  label: '${post.comments}',
                  onTap: () => _showComments(context, post),
                ),
                const Spacer(),
                _ActionButton(
                  icon: Icons.share_outlined,
                  label: lang.isVietnamese ? 'Chia sẻ' : 'Share',
                  onTap: () {
                    HapticFeedback.lightImpact();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(lang.isVietnamese
                            ? 'Đã sao chép liên kết'
                            : 'Link copied'),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showComments(BuildContext context, CommunityPost post) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _CommentsSheet(post: post),
    );
  }

  String _getTimeAgo(DateTime time, bool isVietnamese) {
    final diff = DateTime.now().difference(time);
    if (diff.inMinutes < 60) {
      return isVietnamese
          ? '${diff.inMinutes} phút trước'
          : '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return isVietnamese
          ? '${diff.inHours} giờ trước'
          : '${diff.inHours}h ago';
    } else {
      return isVietnamese ? '${diff.inDays} ngày trước' : '${diff.inDays}d ago';
    }
  }
}

class _PostTypeBadge extends StatelessWidget {
  final PostType type;

  const _PostTypeBadge({required this.type});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();

    Color color;
    IconData icon;
    String label;

    switch (type) {
      case PostType.experience:
        color = Colors.blue;
        icon = Icons.auto_stories;
        label = lang.isVietnamese ? 'Trải nghiệm' : 'Experience';
        break;
      case PostType.review:
        color = Colors.amber;
        icon = Icons.star;
        label = lang.isVietnamese ? 'Đánh giá' : 'Review';
        break;
      case PostType.report:
        color = Colors.red;
        icon = Icons.warning;
        label = lang.isVietnamese ? 'Báo cáo' : 'Report';
        break;
      case PostType.tip:
        color = Colors.green;
        icon = Icons.lightbulb;
        label = lang.isVietnamese ? 'Mẹo hay' : 'Tip';
        break;
      case PostType.question:
        color = Colors.purple;
        icon = Icons.help;
        label = lang.isVietnamese ? 'Hỏi đáp' : 'Question';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Row(
          children: [
            Icon(icon, size: 18, color: color ?? Colors.grey[600]),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: color ?? Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Reviews Tab
class _ReviewsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final community = context.watch<CommunityProvider>();
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListView.builder(
      padding: const EdgeInsets.only(top: 16, bottom: 100),
      itemCount: community.reviews.length,
      itemBuilder: (context, index) {
        final review = community.reviews[index];
        return _ReviewCard(review: review);
      },
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final StationReview review;

  const _ReviewCard({required this.review});

  @override
  Widget build(BuildContext context) {
    final community = context.read<CommunityProvider>();
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Station header
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.primary.withOpacity(0.1),
                  AppColors.cyanLight.withOpacity(0.05),
                ],
              ),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.ev_station, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        review.stationName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Row(
                        children: [
                          ...List.generate(5, (i) {
                            return Icon(
                              i < review.rating.floor()
                                  ? Icons.star
                                  : (i < review.rating
                                      ? Icons.star_half
                                      : Icons.star_border),
                              size: 16,
                              color: Colors.amber,
                            );
                          }),
                          const SizedBox(width: 4),
                          Text(
                            review.rating.toString(),
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Author & content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundImage: NetworkImage(review.authorAvatar),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      review.authorName,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    const Spacer(),
                    Text(
                      _getTimeAgo(review.createdAt, lang.isVietnamese),
                      style: TextStyle(color: Colors.grey[500], fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  review.content,
                  style: const TextStyle(fontSize: 14, height: 1.5),
                ),
              ],
            ),
          ),

          // Tags
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (review.tags.fastCharging)
                  _TagChip(
                    icon: Icons.bolt,
                    label: lang.isVietnamese ? 'Sạc nhanh' : 'Fast charging',
                  ),
                if (review.tags.easyToFind)
                  _TagChip(
                    icon: Icons.location_on,
                    label: lang.isVietnamese ? 'Dễ tìm' : 'Easy to find',
                  ),
                if (review.tags.goodAmenities)
                  _TagChip(
                    icon: Icons.local_cafe,
                    label:
                        lang.isVietnamese ? 'Tiện ích tốt' : 'Good amenities',
                  ),
                if (review.tags.safeLocation)
                  _TagChip(
                    icon: Icons.security,
                    label: lang.isVietnamese ? 'An toàn' : 'Safe',
                  ),
                if (review.tags.friendlyStaff)
                  _TagChip(
                    icon: Icons.people,
                    label:
                        lang.isVietnamese ? 'Nhân viên tốt' : 'Friendly staff',
                  ),
                if (review.tags.cleanArea)
                  _TagChip(
                    icon: Icons.cleaning_services,
                    label: lang.isVietnamese ? 'Sạch sẽ' : 'Clean',
                  ),
              ],
            ),
          ),

          // Actions
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                TextButton.icon(
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    community.toggleHelpful(review.id);
                  },
                  icon: Icon(
                    review.isHelpful ? Icons.thumb_up : Icons.thumb_up_outlined,
                    size: 18,
                    color: review.isHelpful ? AppColors.primary : Colors.grey,
                  ),
                  label: Text(
                    lang.isVietnamese
                        ? 'Hữu ích (${review.helpful})'
                        : 'Helpful (${review.helpful})',
                    style: TextStyle(
                      color: review.isHelpful ? AppColors.primary : Colors.grey,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getTimeAgo(DateTime time, bool isVietnamese) {
    final diff = DateTime.now().difference(time);
    if (diff.inDays > 0) {
      return isVietnamese ? '${diff.inDays} ngày trước' : '${diff.inDays}d ago';
    } else if (diff.inHours > 0) {
      return isVietnamese
          ? '${diff.inHours} giờ trước'
          : '${diff.inHours}h ago';
    } else {
      return isVietnamese
          ? '${diff.inMinutes} phút trước'
          : '${diff.inMinutes}m ago';
    }
  }
}

class _TagChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _TagChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.success.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.success),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.success,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

// Reports Tab
class _ReportsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final community = context.watch<CommunityProvider>();
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListView.builder(
      padding: const EdgeInsets.only(top: 16, bottom: 100),
      itemCount: community.activeReports.length,
      itemBuilder: (context, index) {
        final report = community.activeReports[index];
        return _ReportCard(report: report);
      },
    );
  }
}

class _ReportCard extends StatelessWidget {
  final StationReport report;

  const _ReportCard({required this.report});

  @override
  Widget build(BuildContext context) {
    final community = context.read<CommunityProvider>();
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Color statusColor;
    String statusText;
    IconData statusIcon;

    switch (report.status) {
      case ReportStatus.pending:
        statusColor = Colors.orange;
        statusText = lang.isVietnamese ? 'Chờ xác nhận' : 'Pending';
        statusIcon = Icons.hourglass_empty;
        break;
      case ReportStatus.confirmed:
        statusColor = Colors.red;
        statusText = lang.isVietnamese ? 'Đã xác nhận' : 'Confirmed';
        statusIcon = Icons.check_circle;
        break;
      case ReportStatus.resolved:
        statusColor = Colors.green;
        statusText = lang.isVietnamese ? 'Đã khắc phục' : 'Resolved';
        statusIcon = Icons.done_all;
        break;
      case ReportStatus.rejected:
        statusColor = Colors.grey;
        statusText = lang.isVietnamese ? 'Không hợp lệ' : 'Rejected';
        statusIcon = Icons.cancel;
        break;
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: statusColor.withOpacity(0.3),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with report type
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(_getReportTypeIcon(report.type),
                      color: statusColor, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        report.stationName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        _getReportTypeText(report.type, lang.isVietnamese),
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(statusIcon, size: 14, color: statusColor),
                      const SizedBox(width: 4),
                      Text(
                        statusText,
                        style: TextStyle(
                          fontSize: 11,
                          color: statusColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Description
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  report.description,
                  style: const TextStyle(fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    CircleAvatar(
                      radius: 12,
                      backgroundColor: Colors.grey[300],
                      child: const Icon(Icons.person, size: 14),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      report.reporterName,
                      style: const TextStyle(fontSize: 12),
                    ),
                    const Spacer(),
                    Icon(Icons.access_time, size: 14, color: Colors.grey[500]),
                    const SizedBox(width: 4),
                    Text(
                      _getTimeAgo(report.createdAt, lang.isVietnamese),
                      style: TextStyle(color: Colors.grey[500], fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Confirm button
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      community.confirmReport(report.id);
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor:
                          report.isConfirmed ? AppColors.primary : Colors.grey,
                      side: BorderSide(
                        color: report.isConfirmed
                            ? AppColors.primary
                            : Colors.grey[300]!,
                      ),
                    ),
                    icon: Icon(
                      report.isConfirmed
                          ? Icons.check_circle
                          : Icons.check_circle_outline,
                      size: 18,
                    ),
                    label: Text(
                      lang.isVietnamese
                          ? 'Xác nhận (${report.confirmations})'
                          : 'Confirm (${report.confirmations})',
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.people, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        '${report.confirmations}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getReportTypeIcon(ReportType type) {
    switch (type) {
      case ReportType.broken:
        return Icons.build;
      case ReportType.crowded:
        return Icons.groups;
      case ReportType.maintenance:
        return Icons.engineering;
      case ReportType.wrongInfo:
        return Icons.info;
      case ReportType.unsafe:
        return Icons.warning;
      case ReportType.other:
        return Icons.more_horiz;
    }
  }

  String _getReportTypeText(ReportType type, bool isVietnamese) {
    switch (type) {
      case ReportType.broken:
        return isVietnamese ? 'Trạm hỏng' : 'Broken';
      case ReportType.crowded:
        return isVietnamese ? 'Trạm đông' : 'Crowded';
      case ReportType.maintenance:
        return isVietnamese ? 'Đang bảo trì' : 'Maintenance';
      case ReportType.wrongInfo:
        return isVietnamese ? 'Thông tin sai' : 'Wrong info';
      case ReportType.unsafe:
        return isVietnamese ? 'Không an toàn' : 'Unsafe';
      case ReportType.other:
        return isVietnamese ? 'Khác' : 'Other';
    }
  }

  String _getTimeAgo(DateTime time, bool isVietnamese) {
    final diff = DateTime.now().difference(time);
    if (diff.inDays > 0) {
      return isVietnamese ? '${diff.inDays} ngày trước' : '${diff.inDays}d ago';
    } else if (diff.inHours > 0) {
      return isVietnamese
          ? '${diff.inHours} giờ trước'
          : '${diff.inHours}h ago';
    } else {
      return isVietnamese
          ? '${diff.inMinutes} phút trước'
          : '${diff.inMinutes}m ago';
    }
  }
}

// Comments Sheet
class _CommentsSheet extends StatefulWidget {
  final CommunityPost post;

  const _CommentsSheet({required this.post});

  @override
  State<_CommentsSheet> createState() => _CommentsSheetState();
}

class _CommentsSheetState extends State<_CommentsSheet> {
  final _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final community = context.watch<CommunityProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Get updated post from provider
    final post = community.posts.firstWhere((p) => p.id == widget.post.id);

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text(
                  lang.isVietnamese
                      ? 'Bình luận (${post.comments})'
                      : 'Comments (${post.comments})',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Comments list
          Expanded(
            child: post.commentsList.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.chat_bubble_outline,
                            size: 48, color: Colors.grey[400]),
                        const SizedBox(height: 12),
                        Text(
                          lang.isVietnamese
                              ? 'Chưa có bình luận'
                              : 'No comments yet',
                          style: TextStyle(color: Colors.grey[500]),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: post.commentsList.length,
                    itemBuilder: (context, index) {
                      final comment = post.commentsList[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            CircleAvatar(
                              radius: 18,
                              backgroundImage:
                                  NetworkImage(comment.authorAvatar),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: isDark
                                          ? Colors.grey[800]
                                          : Colors.grey[100],
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          comment.authorName,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: 13,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          comment.content,
                                          style: const TextStyle(fontSize: 14),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Padding(
                                    padding:
                                        const EdgeInsets.only(left: 12, top: 4),
                                    child: Text(
                                      _getTimeAgo(
                                          comment.createdAt, lang.isVietnamese),
                                      style: TextStyle(
                                        color: Colors.grey[500],
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),

          // Comment input
          Container(
            padding: EdgeInsets.fromLTRB(
                16, 12, 16, MediaQuery.of(context).viewInsets.bottom + 16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard : Colors.white,
              border: Border(
                top: BorderSide(color: Colors.grey[200]!),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: InputDecoration(
                      hintText: lang.isVietnamese
                          ? 'Viết bình luận...'
                          : 'Write a comment...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: isDark ? Colors.grey[800] : Colors.grey[100],
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppColors.primary, AppColors.cyanLight],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: () {
                      if (_commentController.text.isNotEmpty) {
                        context.read<CommunityProvider>().addComment(
                              widget.post.id,
                              _commentController.text,
                              'Bạn',
                            );
                        _commentController.clear();
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getTimeAgo(DateTime time, bool isVietnamese) {
    final diff = DateTime.now().difference(time);
    if (diff.inMinutes < 60) {
      return isVietnamese
          ? '${diff.inMinutes} phút trước'
          : '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return isVietnamese
          ? '${diff.inHours} giờ trước'
          : '${diff.inHours}h ago';
    } else {
      return isVietnamese ? '${diff.inDays} ngày trước' : '${diff.inDays}d ago';
    }
  }
}

// Create Post Sheet
class _CreatePostSheet extends StatefulWidget {
  final int tabIndex;

  const _CreatePostSheet({required this.tabIndex});

  @override
  State<_CreatePostSheet> createState() => _CreatePostSheetState();
}

class _CreatePostSheetState extends State<_CreatePostSheet> {
  final _contentController = TextEditingController();
  PostType _selectedType = PostType.experience;
  ReportType _selectedReportType = ReportType.broken;
  double _rating = 5.0;
  String _selectedStation = 'VinFast Landmark 81';

  final List<String> _stations = [
    'VinFast Landmark 81',
    'EVN Quận 1',
    'SC Crescent Mall',
    'PV Power Bình Thạnh',
    'EV Station Thủ Đức',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.tabIndex == 2) {
      _selectedType = PostType.report;
    } else if (widget.tabIndex == 1) {
      _selectedType = PostType.review;
    }
  }

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text(
                  _getTitle(lang.isVietnamese),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(lang.isVietnamese ? 'Hủy' : 'Cancel'),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Post type selector (for posts tab)
                  if (widget.tabIndex == 0) ...[
                    Text(
                      lang.isVietnamese ? 'Loại bài viết' : 'Post type',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      children: [
                        _TypeChip(
                          label:
                              lang.isVietnamese ? 'Trải nghiệm' : 'Experience',
                          icon: Icons.auto_stories,
                          isSelected: _selectedType == PostType.experience,
                          onTap: () => setState(
                              () => _selectedType = PostType.experience),
                        ),
                        _TypeChip(
                          label: lang.isVietnamese ? 'Mẹo hay' : 'Tip',
                          icon: Icons.lightbulb,
                          isSelected: _selectedType == PostType.tip,
                          onTap: () =>
                              setState(() => _selectedType = PostType.tip),
                        ),
                        _TypeChip(
                          label: lang.isVietnamese ? 'Hỏi đáp' : 'Question',
                          icon: Icons.help,
                          isSelected: _selectedType == PostType.question,
                          onTap: () =>
                              setState(() => _selectedType = PostType.question),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Station selector (for reviews & reports)
                  if (widget.tabIndex != 0) ...[
                    Text(
                      lang.isVietnamese ? 'Chọn trạm sạc' : 'Select station',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: DropdownButton<String>(
                        value: _selectedStation,
                        isExpanded: true,
                        underline: const SizedBox(),
                        items: _stations.map((s) {
                          return DropdownMenuItem(value: s, child: Text(s));
                        }).toList(),
                        onChanged: (v) => setState(() => _selectedStation = v!),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Rating (for reviews)
                  if (widget.tabIndex == 1) ...[
                    Text(
                      lang.isVietnamese ? 'Đánh giá' : 'Rating',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: List.generate(5, (i) {
                        return IconButton(
                          icon: Icon(
                            i < _rating ? Icons.star : Icons.star_border,
                            size: 36,
                            color: Colors.amber,
                          ),
                          onPressed: () => setState(() => _rating = i + 1.0),
                        );
                      }),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Report type (for reports)
                  if (widget.tabIndex == 2) ...[
                    Text(
                      lang.isVietnamese ? 'Loại báo cáo' : 'Report type',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _ReportTypeChip(
                          label: lang.isVietnamese ? 'Trạm hỏng' : 'Broken',
                          icon: Icons.build,
                          isSelected: _selectedReportType == ReportType.broken,
                          onTap: () => setState(
                              () => _selectedReportType = ReportType.broken),
                        ),
                        _ReportTypeChip(
                          label: lang.isVietnamese ? 'Trạm đông' : 'Crowded',
                          icon: Icons.groups,
                          isSelected: _selectedReportType == ReportType.crowded,
                          onTap: () => setState(
                              () => _selectedReportType = ReportType.crowded),
                        ),
                        _ReportTypeChip(
                          label: lang.isVietnamese ? 'Bảo trì' : 'Maintenance',
                          icon: Icons.engineering,
                          isSelected:
                              _selectedReportType == ReportType.maintenance,
                          onTap: () => setState(() =>
                              _selectedReportType = ReportType.maintenance),
                        ),
                        _ReportTypeChip(
                          label: lang.isVietnamese
                              ? 'Sai thông tin'
                              : 'Wrong info',
                          icon: Icons.info,
                          isSelected:
                              _selectedReportType == ReportType.wrongInfo,
                          onTap: () => setState(
                              () => _selectedReportType = ReportType.wrongInfo),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Content input
                  Text(
                    lang.isVietnamese ? 'Nội dung' : 'Content',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _contentController,
                    maxLines: 5,
                    decoration: InputDecoration(
                      hintText: _getHintText(lang.isVietnamese),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Add photos button
                  OutlinedButton.icon(
                    onPressed: () {
                      // TODO: Add photo picker
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(lang.isVietnamese
                              ? 'Tính năng đang phát triển'
                              : 'Feature coming soon'),
                        ),
                      );
                    },
                    icon: const Icon(Icons.add_photo_alternate),
                    label: Text(lang.isVietnamese ? 'Thêm ảnh' : 'Add photos'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Submit button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkCard : Colors.white,
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
            ),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  lang.isVietnamese ? 'Đăng bài' : 'Post',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getTitle(bool isVietnamese) {
    switch (widget.tabIndex) {
      case 0:
        return isVietnamese ? 'Tạo bài viết' : 'Create Post';
      case 1:
        return isVietnamese ? 'Viết đánh giá' : 'Write Review';
      case 2:
        return isVietnamese ? 'Báo cáo trạm' : 'Report Station';
      default:
        return '';
    }
  }

  String _getHintText(bool isVietnamese) {
    switch (widget.tabIndex) {
      case 0:
        return isVietnamese
            ? 'Chia sẻ trải nghiệm của bạn...'
            : 'Share your experience...';
      case 1:
        return isVietnamese
            ? 'Viết đánh giá chi tiết về trạm sạc...'
            : 'Write a detailed review...';
      case 2:
        return isVietnamese
            ? 'Mô tả vấn đề bạn gặp phải...'
            : 'Describe the issue...';
      default:
        return '';
    }
  }

  void _submit() {
    if (_contentController.text.isEmpty) {
      return;
    }

    final community = context.read<CommunityProvider>();
    final lang = context.read<LanguageProvider>();

    if (widget.tabIndex == 0) {
      // Add post
      community.addPost(CommunityPost(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        authorId: 'currentUser',
        authorName: 'Bạn',
        authorAvatar: 'https://i.pravatar.cc/150?img=20',
        content: _contentController.text,
        type: _selectedType,
        createdAt: DateTime.now(),
      ));
    } else if (widget.tabIndex == 1) {
      // Add review
      community.addReview(StationReview(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        stationId: 'station_new',
        stationName: _selectedStation,
        authorId: 'currentUser',
        authorName: 'Bạn',
        authorAvatar: 'https://i.pravatar.cc/150?img=20',
        rating: _rating,
        content: _contentController.text,
        createdAt: DateTime.now(),
        tags: ReviewTags(),
      ));
    } else {
      // Add report
      community.addReport(StationReport(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        stationId: 'station_new',
        stationName: _selectedStation,
        reporterId: 'currentUser',
        reporterName: 'Bạn',
        type: _selectedReportType,
        description: _contentController.text,
        createdAt: DateTime.now(),
      ));
    }

    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            lang.isVietnamese ? 'Đã đăng thành công!' : 'Posted successfully!'),
        backgroundColor: AppColors.success,
      ),
    );
  }
}

class _TypeChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _TypeChip({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.grey[100],
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 16, color: isSelected ? Colors.white : Colors.grey),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReportTypeChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _ReportTypeChip({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? Colors.red : Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 16, color: isSelected ? Colors.white : Colors.grey),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey[700],
                fontWeight: FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
