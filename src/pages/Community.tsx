import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Heart,
  Share2,
  Star,
  AlertTriangle,
  MapPin,
  Clock,
  ThumbsUp,
  Plus,
  Send,
  Zap,
  Coffee,
  Wifi,
  ParkingSquare,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Types
interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: "tip" | "question" | "experience" | "news";
  title: string;
  content: string;
  likes: number;
  comments: Comment[];
  createdAt: Date;
  isLiked: boolean;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

interface StationReview {
  id: string;
  stationId: string;
  stationName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  tags: string[];
  helpfulCount: number;
  createdAt: Date;
  isHelpful: boolean;
}

interface StationReport {
  id: string;
  stationId: string;
  stationName: string;
  userId: string;
  userName: string;
  type: "broken" | "wrong_info" | "occupied" | "other";
  description: string;
  status: "pending" | "confirmed" | "resolved";
  createdAt: Date;
  confirmCount: number;
}

// Mock data
const mockPosts: CommunityPost[] = [
  {
    id: "1",
    userId: "u1",
    userName: "Minh Trần",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    type: "tip",
    title: "Mẹo sạc nhanh cho VinFast VF8",
    content:
      "Để sạc nhanh nhất, nên sạc khi pin còn 20-80%. Tránh sạc đầy 100% thường xuyên sẽ giúp pin bền hơn. Nên preconditioning pin trước khi đến trạm sạc nhanh DC.",
    likes: 45,
    comments: [
      {
        id: "c1",
        userId: "u2",
        userName: "Hương Nguyễn",
        content: "Cảm ơn tip hay quá! Mình sẽ thử",
        createdAt: new Date("2026-01-28"),
      },
    ],
    createdAt: new Date("2026-01-27"),
    isLiked: false,
  },
  {
    id: "2",
    userId: "u3",
    userName: "Hoàng Lê",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    type: "question",
    title: "Trạm sạc nào ở Quận 7 tốt nhất?",
    content:
      "Mình mới chuyển về Q7, cần tìm trạm sạc gần nhà. Các bạn có recommend trạm nào không? Mình dùng VF e34.",
    likes: 12,
    comments: [
      {
        id: "c2",
        userId: "u4",
        userName: "Nam Phạm",
        content: "Trạm ở Crescent Mall sạc nhanh lắm bạn ơi!",
        createdAt: new Date("2026-01-29"),
      },
    ],
    createdAt: new Date("2026-01-28"),
    isLiked: true,
  },
  {
    id: "3",
    userId: "u5",
    userName: "Lan Anh",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    type: "experience",
    title: "Road trip Sài Gòn - Đà Lạt bằng xe điện",
    content:
      "Vừa hoàn thành chuyến đi SG-Đà Lạt bằng VF8. Sạc 2 lần dọc đường, tổng thời gian dừng sạc ~1 tiếng. Trạm Bảo Lộc rất tiện, có cafe ngồi chờ!",
    likes: 89,
    comments: [],
    createdAt: new Date("2026-01-25"),
    isLiked: false,
  },
];

const mockReviews: StationReview[] = [
  {
    id: "r1",
    stationId: "s1",
    stationName: "VinFast Charging - Aeon Mall Tân Phú",
    userId: "u1",
    userName: "Minh Trần",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    comment:
      "Trạm sạc mới, sạch sẽ. Có 4 cổng DC 150kW, sạc rất nhanh. Có quán cafe ngay bên cạnh.",
    tags: ["Sạc nhanh", "Sạch sẽ", "Có cafe"],
    helpfulCount: 23,
    createdAt: new Date("2026-01-26"),
    isHelpful: false,
  },
  {
    id: "r2",
    stationId: "s2",
    stationName: "EV Station - Landmark 81",
    userId: "u3",
    userName: "Hoàng Lê",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    rating: 4,
    comment:
      "Vị trí đẹp, dễ tìm. Tuy nhiên cuối tuần khá đông, phải chờ 15 phút mới có chỗ.",
    tags: ["Vị trí tốt", "Đông cuối tuần"],
    helpfulCount: 15,
    createdAt: new Date("2026-01-24"),
    isHelpful: true,
  },
];

const mockReports: StationReport[] = [
  {
    id: "rp1",
    stationId: "s3",
    stationName: "Charging Hub - Quận 2",
    userId: "u2",
    userName: "Hương Nguyễn",
    type: "broken",
    description: "Cổng số 3 không hoạt động, màn hình báo lỗi E-05",
    status: "confirmed",
    createdAt: new Date("2026-01-29"),
    confirmCount: 5,
  },
  {
    id: "rp2",
    stationId: "s4",
    stationName: "EcoCharge - Phú Mỹ Hưng",
    userId: "u4",
    userName: "Nam Phạm",
    type: "occupied",
    description: "Có xe không sạc đậu chiếm chỗ từ sáng đến giờ",
    status: "pending",
    createdAt: new Date("2026-01-30"),
    confirmCount: 2,
  },
];

const Community = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [reviews] = useState<StationReview[]>(mockReviews);
  const [reports, setReports] = useState<StationReport[]>(mockReports);
  const [activeTab, setActiveTab] = useState("posts");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<CommunityPost["type"]>("tip");

  const isVn = language === "vi";

  const handleLikePost = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleConfirmReport = (reportId: string) => {
    setReports(
      reports.map((report) =>
        report.id === reportId
          ? { ...report, confirmCount: report.confirmCount + 1 }
          : report
      )
    );
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: "current-user",
      userName: "Bạn",
      type: newPostType,
      title: newPostTitle,
      content: newPostContent,
      likes: 0,
      comments: [],
      createdAt: new Date(),
      isLiked: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
    setShowCreatePost(false);
  };

  const getPostTypeIcon = (type: CommunityPost["type"]) => {
    switch (type) {
      case "tip":
        return <Zap className="h-4 w-4" />;
      case "question":
        return <MessageSquare className="h-4 w-4" />;
      case "experience":
        return <MapPin className="h-4 w-4" />;
      case "news":
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPostTypeBadge = (type: CommunityPost["type"]) => {
    const labels = {
      tip: isVn ? "Mẹo hay" : "Tip",
      question: isVn ? "Hỏi đáp" : "Question",
      experience: isVn ? "Trải nghiệm" : "Experience",
      news: isVn ? "Tin tức" : "News",
    };
    const colors = {
      tip: "bg-green-100 text-green-700",
      question: "bg-blue-100 text-blue-700",
      experience: "bg-purple-100 text-purple-700",
      news: "bg-orange-100 text-orange-700",
    };
    return (
      <Badge className={colors[type]}>
        {getPostTypeIcon(type)}
        <span className="ml-1">{labels[type]}</span>
      </Badge>
    );
  };

  const getReportTypeBadge = (type: StationReport["type"]) => {
    const labels = {
      broken: isVn ? "Hỏng" : "Broken",
      wrong_info: isVn ? "Sai thông tin" : "Wrong Info",
      occupied: isVn ? "Bị chiếm" : "Occupied",
      other: isVn ? "Khác" : "Other",
    };
    const colors = {
      broken: "bg-red-100 text-red-700",
      wrong_info: "bg-yellow-100 text-yellow-700",
      occupied: "bg-orange-100 text-orange-700",
      other: "bg-gray-100 text-gray-700",
    };
    return <Badge className={colors[type]}>{labels[type]}</Badge>;
  };

  const getStatusBadge = (status: StationReport["status"]) => {
    const labels = {
      pending: isVn ? "Chờ xác nhận" : "Pending",
      confirmed: isVn ? "Đã xác nhận" : "Confirmed",
      resolved: isVn ? "Đã xử lý" : "Resolved",
    };
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      resolved: "bg-green-100 text-green-700",
    };
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return isVn ? "Hôm nay" : "Today";
    if (diffDays === 1) return isVn ? "Hôm qua" : "Yesterday";
    if (diffDays < 7) return isVn ? `${diffDays} ngày trước` : `${diffDays} days ago`;
    return date.toLocaleDateString(isVn ? "vi-VN" : "en-US");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {isVn ? "Cộng đồng EV" : "EV Community"}
                </h1>
                <p className="text-sm text-gray-500">
                  {isVn ? "Chia sẻ & kết nối" : "Share & connect"}
                </p>
              </div>
            </div>
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Plus className="h-4 w-4 mr-2" />
                  {isVn ? "Đăng bài" : "New Post"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isVn ? "Tạo bài viết mới" : "Create New Post"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="flex gap-2">
                    {(["tip", "question", "experience", "news"] as const).map(
                      (type) => (
                        <Button
                          key={type}
                          variant={newPostType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewPostType(type)}
                        >
                          {getPostTypeIcon(type)}
                        </Button>
                      )
                    )}
                  </div>
                  <Input
                    placeholder={isVn ? "Tiêu đề..." : "Title..."}
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder={isVn ? "Nội dung..." : "Content..."}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
                    onClick={handleCreatePost}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isVn ? "Đăng bài" : "Post"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="posts">
              <MessageSquare className="h-4 w-4 mr-2" />
              {isVn ? "Chia sẻ" : "Posts"}
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="h-4 w-4 mr-2" />
              {isVn ? "Đánh giá" : "Reviews"}
            </TabsTrigger>
            <TabsTrigger value="reports">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {isVn ? "Báo cáo" : "Reports"}
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.userAvatar} />
                      <AvatarFallback>{post.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{post.userName}</span>
                        {getPostTypeBadge(post.type)}
                      </div>
                      <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className={post.isLiked ? "text-red-500" : ""}
                        >
                          <Heart
                            className={`h-4 w-4 mr-1 ${
                              post.isLiked ? "fill-current" : ""
                            }`}
                          />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments.length}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                        </Button>
                        <span className="ml-auto flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={review.userAvatar} />
                      <AvatarFallback>{review.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.userName}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <MapPin className="h-3 w-3" />
                        {review.stationName}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {review.comment}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {review.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={review.isHelpful ? "text-teal-500" : ""}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {isVn ? "Hữu ích" : "Helpful"} ({review.helpfulCount})
                        </Button>
                        <span className="ml-auto flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getReportTypeBadge(report.type)}
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {report.stationName}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {isVn ? "Báo cáo bởi" : "Reported by"} {report.userName}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfirmReport(report.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {isVn ? "Xác nhận" : "Confirm"} ({report.confirmCount})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;
