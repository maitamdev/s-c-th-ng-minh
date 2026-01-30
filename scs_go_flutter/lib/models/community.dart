// Community models for EV driver community feature

class CommunityPost {
  final String id;
  final String authorId;
  final String authorName;
  final String authorAvatar;
  final String content;
  final List<String> images;
  final PostType type;
  final String? stationId;
  final String? stationName;
  final int likes;
  final int comments;
  final bool isLiked;
  final DateTime createdAt;
  final List<PostComment> commentsList;

  CommunityPost({
    required this.id,
    required this.authorId,
    required this.authorName,
    required this.authorAvatar,
    required this.content,
    this.images = const [],
    required this.type,
    this.stationId,
    this.stationName,
    this.likes = 0,
    this.comments = 0,
    this.isLiked = false,
    required this.createdAt,
    this.commentsList = const [],
  });

  CommunityPost copyWith({
    int? likes,
    bool? isLiked,
    int? comments,
    List<PostComment>? commentsList,
  }) {
    return CommunityPost(
      id: id,
      authorId: authorId,
      authorName: authorName,
      authorAvatar: authorAvatar,
      content: content,
      images: images,
      type: type,
      stationId: stationId,
      stationName: stationName,
      likes: likes ?? this.likes,
      comments: comments ?? this.comments,
      isLiked: isLiked ?? this.isLiked,
      createdAt: createdAt,
      commentsList: commentsList ?? this.commentsList,
    );
  }
}

class PostComment {
  final String id;
  final String authorId;
  final String authorName;
  final String authorAvatar;
  final String content;
  final DateTime createdAt;

  PostComment({
    required this.id,
    required this.authorId,
    required this.authorName,
    required this.authorAvatar,
    required this.content,
    required this.createdAt,
  });
}

enum PostType {
  experience, // Chia sẻ kinh nghiệm
  review, // Đánh giá trạm sạc
  report, // Báo cáo trạm hỏng/đông
  tip, // Mẹo sử dụng
  question, // Hỏi đáp
}

class StationReview {
  final String id;
  final String stationId;
  final String stationName;
  final String authorId;
  final String authorName;
  final String authorAvatar;
  final double rating;
  final String content;
  final List<String> images;
  final int helpful;
  final bool isHelpful;
  final DateTime createdAt;
  final ReviewTags tags;

  StationReview({
    required this.id,
    required this.stationId,
    required this.stationName,
    required this.authorId,
    required this.authorName,
    required this.authorAvatar,
    required this.rating,
    required this.content,
    this.images = const [],
    this.helpful = 0,
    this.isHelpful = false,
    required this.createdAt,
    required this.tags,
  });

  StationReview copyWith({
    int? helpful,
    bool? isHelpful,
  }) {
    return StationReview(
      id: id,
      stationId: stationId,
      stationName: stationName,
      authorId: authorId,
      authorName: authorName,
      authorAvatar: authorAvatar,
      rating: rating,
      content: content,
      images: images,
      helpful: helpful ?? this.helpful,
      isHelpful: isHelpful ?? this.isHelpful,
      createdAt: createdAt,
      tags: tags,
    );
  }
}

class ReviewTags {
  final bool fastCharging;
  final bool easyToFind;
  final bool goodAmenities;
  final bool safeLocation;
  final bool friendlyStaff;
  final bool cleanArea;

  ReviewTags({
    this.fastCharging = false,
    this.easyToFind = false,
    this.goodAmenities = false,
    this.safeLocation = false,
    this.friendlyStaff = false,
    this.cleanArea = false,
  });
}

class StationReport {
  final String id;
  final String stationId;
  final String stationName;
  final String reporterId;
  final String reporterName;
  final ReportType type;
  final String description;
  final List<String> images;
  final ReportStatus status;
  final DateTime createdAt;
  final DateTime? resolvedAt;
  final int confirmations;
  final bool isConfirmed;

  StationReport({
    required this.id,
    required this.stationId,
    required this.stationName,
    required this.reporterId,
    required this.reporterName,
    required this.type,
    required this.description,
    this.images = const [],
    this.status = ReportStatus.pending,
    required this.createdAt,
    this.resolvedAt,
    this.confirmations = 0,
    this.isConfirmed = false,
  });

  StationReport copyWith({
    int? confirmations,
    bool? isConfirmed,
    ReportStatus? status,
  }) {
    return StationReport(
      id: id,
      stationId: stationId,
      stationName: stationName,
      reporterId: reporterId,
      reporterName: reporterName,
      type: type,
      description: description,
      images: images,
      status: status ?? this.status,
      createdAt: createdAt,
      resolvedAt: resolvedAt,
      confirmations: confirmations ?? this.confirmations,
      isConfirmed: isConfirmed ?? this.isConfirmed,
    );
  }
}

enum ReportType {
  broken, // Trạm hỏng
  crowded, // Trạm đông
  maintenance, // Đang bảo trì
  wrongInfo, // Thông tin sai
  unsafe, // Không an toàn
  other, // Khác
}

enum ReportStatus {
  pending, // Đang chờ xác nhận
  confirmed, // Đã xác nhận
  resolved, // Đã khắc phục
  rejected, // Không hợp lệ
}
