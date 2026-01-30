import 'package:flutter/foundation.dart';
import '../models/community.dart';

class CommunityProvider extends ChangeNotifier {
  List<CommunityPost> _posts = [];
  List<StationReview> _reviews = [];
  List<StationReport> _reports = [];
  bool _isLoading = false;

  List<CommunityPost> get posts => _posts;
  List<StationReview> get reviews => _reviews;
  List<StationReport> get reports => _reports;
  bool get isLoading => _isLoading;

  // Active reports (not resolved)
  List<StationReport> get activeReports =>
      _reports.where((r) => r.status != ReportStatus.resolved).toList();

  CommunityProvider() {
    _loadMockData();
  }

  void _loadMockData() {
    _isLoading = true;
    notifyListeners();

    // Mock posts
    _posts = [
      CommunityPost(
        id: '1',
        authorId: 'user1',
        authorName: 'Nguyễn Văn Minh',
        authorAvatar: 'https://i.pravatar.cc/150?img=1',
        content:
            'Vừa sạc xong ở trạm VinFast Landmark 81, trải nghiệm rất tốt! Sạc nhanh, nhân viên thân thiện. Recommend cho mọi người! ⚡🚗',
        images: [],
        type: PostType.experience,
        stationId: 'station1',
        stationName: 'VinFast Landmark 81',
        likes: 45,
        comments: 12,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        commentsList: [
          PostComment(
            id: 'c1',
            authorId: 'user2',
            authorName: 'Trần Thị Lan',
            authorAvatar: 'https://i.pravatar.cc/150?img=5',
            content: 'Cảm ơn bạn đã chia sẻ! Mình cũng hay sạc ở đây.',
            createdAt: DateTime.now().subtract(const Duration(hours: 1)),
          ),
        ],
      ),
      CommunityPost(
        id: '2',
        authorId: 'user3',
        authorName: 'Lê Hoàng Nam',
        authorAvatar: 'https://i.pravatar.cc/150?img=3',
        content:
            'Mẹo hay cho các bác: Nên sạc pin khi còn 20-30% để tối ưu tuổi thọ pin. Đừng để cạn kiệt mới sạc nhé! 🔋💡',
        images: [],
        type: PostType.tip,
        likes: 128,
        comments: 34,
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      CommunityPost(
        id: '3',
        authorId: 'user4',
        authorName: 'Phạm Đức Anh',
        authorAvatar: 'https://i.pravatar.cc/150?img=8',
        content:
            'Có ai biết trạm sạc nào ở Quận 7 đang hoạt động tốt không ạ? Mình cần sạc gấp chiều nay. 🙏',
        images: [],
        type: PostType.question,
        likes: 8,
        comments: 15,
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
        commentsList: [
          PostComment(
            id: 'c2',
            authorId: 'user5',
            authorName: 'Ngô Minh Tuấn',
            authorAvatar: 'https://i.pravatar.cc/150?img=12',
            content:
                'Trạm SC Crescent Mall đang trống bạn ơi, mình vừa sạc xong.',
            createdAt: DateTime.now().subtract(const Duration(hours: 7)),
          ),
          PostComment(
            id: 'c3',
            authorId: 'user6',
            authorName: 'Võ Thị Hương',
            authorAvatar: 'https://i.pravatar.cc/150?img=9',
            content: 'Hoặc trạm Sunrise City cũng tốt lắm!',
            createdAt: DateTime.now().subtract(const Duration(hours: 6)),
          ),
        ],
      ),
      CommunityPost(
        id: '4',
        authorId: 'user7',
        authorName: 'Trương Văn Hùng',
        authorAvatar: 'https://i.pravatar.cc/150?img=15',
        content:
            'Review chi tiết trạm sạc EVN Quận 1:\n✅ Tốc độ sạc: 120kW\n✅ Số cổng: 4\n✅ Có mái che\n✅ Bảo vệ 24/7\n⚠️ Cuối tuần hơi đông\n\nĐánh giá: 4.5/5 ⭐',
        images: [],
        type: PostType.review,
        stationId: 'station2',
        stationName: 'EVN Quận 1',
        likes: 89,
        comments: 23,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      CommunityPost(
        id: '5',
        authorId: 'user8',
        authorName: 'Đỗ Thành Long',
        authorAvatar: 'https://i.pravatar.cc/150?img=11',
        content:
            'Chuyến đi Đà Lạt bằng xe điện thành công! Sạc 2 lần trên đường, tổng chi phí chỉ 150k. Tiết kiệm hơn xăng rất nhiều! 🏔️⚡',
        images: [],
        type: PostType.experience,
        likes: 234,
        comments: 67,
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
    ];

    // Mock reviews
    _reviews = [
      StationReview(
        id: 'r1',
        stationId: 'station1',
        stationName: 'VinFast Landmark 81',
        authorId: 'user1',
        authorName: 'Nguyễn Văn Minh',
        authorAvatar: 'https://i.pravatar.cc/150?img=1',
        rating: 5.0,
        content:
            'Trạm sạc rất tốt, nằm trong hầm để xe Landmark 81. Sạc nhanh 150kW, có đủ các loại cổng sạc. Nhân viên hỗ trợ nhiệt tình.',
        helpful: 45,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        tags: ReviewTags(
          fastCharging: true,
          easyToFind: true,
          goodAmenities: true,
          safeLocation: true,
          friendlyStaff: true,
          cleanArea: true,
        ),
      ),
      StationReview(
        id: 'r2',
        stationId: 'station2',
        stationName: 'EVN Quận 1',
        authorId: 'user3',
        authorName: 'Lê Hoàng Nam',
        authorAvatar: 'https://i.pravatar.cc/150?img=3',
        rating: 4.0,
        content:
            'Vị trí thuận tiện, tốc độ sạc ổn. Tuy nhiên cuối tuần khá đông, phải chờ đợi. Nên có app đặt lịch trước.',
        helpful: 32,
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
        tags: ReviewTags(
          fastCharging: true,
          easyToFind: true,
          safeLocation: true,
        ),
      ),
      StationReview(
        id: 'r3',
        stationId: 'station3',
        stationName: 'SC Crescent Mall',
        authorId: 'user5',
        authorName: 'Ngô Minh Tuấn',
        authorAvatar: 'https://i.pravatar.cc/150?img=12',
        rating: 4.5,
        content:
            'Sạc trong lúc đi shopping rất tiện. Tốc độ 100kW, đủ để sạc từ 20-80% trong 30 phút. Có quán cafe ngay bên cạnh.',
        helpful: 28,
        createdAt: DateTime.now().subtract(const Duration(days: 5)),
        tags: ReviewTags(
          easyToFind: true,
          goodAmenities: true,
          safeLocation: true,
          cleanArea: true,
        ),
      ),
      StationReview(
        id: 'r4',
        stationId: 'station4',
        stationName: 'PV Power Bình Thạnh',
        authorId: 'user9',
        authorName: 'Huỳnh Minh Đức',
        authorAvatar: 'https://i.pravatar.cc/150?img=7',
        rating: 3.5,
        content:
            'Trạm ổn, giá hợp lý. Nhưng không có mái che nên ngày nắng hơi nóng. Bảo vệ thân thiện.',
        helpful: 15,
        createdAt: DateTime.now().subtract(const Duration(days: 7)),
        tags: ReviewTags(
          safeLocation: true,
          friendlyStaff: true,
        ),
      ),
    ];

    // Mock reports
    _reports = [
      StationReport(
        id: 'rp1',
        stationId: 'station5',
        stationName: 'EV Station Thủ Đức',
        reporterId: 'user2',
        reporterName: 'Trần Thị Lan',
        type: ReportType.broken,
        description:
            'Cổng sạc số 2 bị hỏng, không nhận được kết nối. Đã báo nhân viên nhưng chưa sửa.',
        status: ReportStatus.confirmed,
        createdAt: DateTime.now().subtract(const Duration(hours: 4)),
        confirmations: 5,
      ),
      StationReport(
        id: 'rp2',
        stationId: 'station6',
        stationName: 'VinFast Gò Vấp',
        reporterId: 'user4',
        reporterName: 'Phạm Đức Anh',
        type: ReportType.crowded,
        description:
            'Trạm đang rất đông, phải chờ hơn 1 tiếng. Có 3 xe đang sạc và 4 xe đang chờ.',
        status: ReportStatus.confirmed,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
        confirmations: 8,
      ),
      StationReport(
        id: 'rp3',
        stationId: 'station7',
        stationName: 'EVN Tân Bình',
        reporterId: 'user6',
        reporterName: 'Võ Thị Hương',
        type: ReportType.maintenance,
        description:
            'Trạm đang bảo trì định kỳ, dự kiến hoàn thành lúc 18:00 hôm nay.',
        status: ReportStatus.pending,
        createdAt: DateTime.now().subtract(const Duration(hours: 6)),
        confirmations: 3,
      ),
      StationReport(
        id: 'rp4',
        stationId: 'station8',
        stationName: 'SC Aeon Mall',
        reporterId: 'user7',
        reporterName: 'Trương Văn Hùng',
        type: ReportType.wrongInfo,
        description:
            'Giá sạc trên app hiển thị 3.500đ/kWh nhưng thực tế là 4.000đ/kWh. Cần cập nhật lại.',
        status: ReportStatus.pending,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        confirmations: 2,
      ),
    ];

    _isLoading = false;
    notifyListeners();
  }

  // Toggle like on post
  void toggleLike(String postId) {
    final index = _posts.indexWhere((p) => p.id == postId);
    if (index != -1) {
      final post = _posts[index];
      _posts[index] = post.copyWith(
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1,
      );
      notifyListeners();
    }
  }

  // Add comment to post
  void addComment(String postId, String content, String authorName) {
    final index = _posts.indexWhere((p) => p.id == postId);
    if (index != -1) {
      final post = _posts[index];
      final newComment = PostComment(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        authorId: 'currentUser',
        authorName: authorName,
        authorAvatar: 'https://i.pravatar.cc/150?img=20',
        content: content,
        createdAt: DateTime.now(),
      );
      _posts[index] = post.copyWith(
        comments: post.comments + 1,
        commentsList: [...post.commentsList, newComment],
      );
      notifyListeners();
    }
  }

  // Add new post
  void addPost(CommunityPost post) {
    _posts.insert(0, post);
    notifyListeners();
  }

  // Toggle helpful on review
  void toggleHelpful(String reviewId) {
    final index = _reviews.indexWhere((r) => r.id == reviewId);
    if (index != -1) {
      final review = _reviews[index];
      _reviews[index] = review.copyWith(
        isHelpful: !review.isHelpful,
        helpful: review.isHelpful ? review.helpful - 1 : review.helpful + 1,
      );
      notifyListeners();
    }
  }

  // Add new review
  void addReview(StationReview review) {
    _reviews.insert(0, review);
    notifyListeners();
  }

  // Confirm report
  void confirmReport(String reportId) {
    final index = _reports.indexWhere((r) => r.id == reportId);
    if (index != -1) {
      final report = _reports[index];
      _reports[index] = report.copyWith(
        isConfirmed: !report.isConfirmed,
        confirmations: report.isConfirmed
            ? report.confirmations - 1
            : report.confirmations + 1,
        status:
            report.confirmations >= 4 ? ReportStatus.confirmed : report.status,
      );
      notifyListeners();
    }
  }

  // Add new report
  void addReport(StationReport report) {
    _reports.insert(0, report);
    notifyListeners();
  }

  // Get posts by type
  List<CommunityPost> getPostsByType(PostType type) {
    return _posts.where((p) => p.type == type).toList();
  }

  // Get reviews for station
  List<StationReview> getReviewsForStation(String stationId) {
    return _reviews.where((r) => r.stationId == stationId).toList();
  }

  // Get reports for station
  List<StationReport> getReportsForStation(String stationId) {
    return _reports.where((r) => r.stationId == stationId).toList();
  }
}
