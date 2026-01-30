import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Share2,
  MoreHorizontal,
  Image,
  Video,
  MapPin,
  Smile,
  ThumbsUp,
  Send,
  Bookmark,
  Flag,
  X,
  ChevronLeft,
  Camera,
  Zap,
  Car,
  Plus,
  Globe,
  Users,
  Lock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  isViewed: boolean;
  isOwn?: boolean;
}

interface Reaction {
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  count: number;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  createdAt: Date;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userBadge?: string;
  content: string;
  images: string[];
  location?: string;
  reactions: Reaction[];
  totalReactions: number;
  comments: Comment[];
  shares: number;
  createdAt: Date;
  myReaction?: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  isSaved: boolean;
  privacy: "public" | "friends" | "private";
  tags?: string[];
}

interface SuggestedGroup {
  id: string;
  name: string;
  image: string;
  members: number;
  isJoined: boolean;
}

// Mock Stories
const mockStories: Story[] = [
  {
    id: "own",
    userId: "me",
    userName: "Tạo story",
    userAvatar: "https://i.pravatar.cc/150?img=68",
    imageUrl: "",
    isViewed: false,
    isOwn: true,
  },
  {
    id: "s1",
    userId: "u1",
    userName: "Minh Trần",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    imageUrl: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400",
    isViewed: false,
  },
  {
    id: "s2",
    userId: "u2",
    userName: "Lan Anh",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    isViewed: false,
  },
  {
    id: "s3",
    userId: "u3",
    userName: "Hoàng Lê",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
    isViewed: true,
  },
  {
    id: "s4",
    userId: "u4",
    userName: "Thu Hà",
    userAvatar: "https://i.pravatar.cc/150?img=9",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400",
    isViewed: true,
  },
  {
    id: "s5",
    userId: "u5",
    userName: "Nam Phạm",
    userAvatar: "https://i.pravatar.cc/150?img=12",
    imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400",
    isViewed: false,
  },
];

// Mock Posts
const mockPosts: Post[] = [
  {
    id: "1",
    userId: "u1",
    userName: "Minh Trần",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    userBadge: "Top Contributor",
    content: `🚗⚡ Vừa hoàn thành chuyến road trip Sài Gòn - Đà Lạt bằng VF8! 

Chia sẻ kinh nghiệm cho anh em:
• Xuất phát với 100% pin, đến Bảo Lộc còn 25%
• Sạc tại trạm VinFast Bảo Lộc 30 phút lên 85%
• Có quán cafe ngay bên cạnh, uống cafe chờ sạc thôi ☕

Tổng thời gian đi: 5 tiếng (bao gồm sạc)
Chi phí sạc: ~150k

Ai có kế hoạch đi Đà Lạt thì cứ yên tâm, hạ tầng sạc đường dài đã khá ổn rồi! 🎉`,
    images: [
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800",
    ],
    location: "Đà Lạt, Lâm Đồng",
    reactions: [
      { type: "like", count: 142 },
      { type: "love", count: 58 },
      { type: "wow", count: 23 },
    ],
    totalReactions: 223,
    comments: [
      {
        id: "c1",
        userId: "u2",
        userName: "Hương Nguyễn",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        content: "Hay quá anh ơi! Tuần sau em cũng có kế hoạch đi Đà Lạt, bài này quá hữu ích 🙏",
        likes: 12,
        isLiked: false,
        replies: [
          {
            id: "r1",
            userId: "u1",
            userName: "Minh Trần",
            userAvatar: "https://i.pravatar.cc/150?img=1",
            content: "Chúc em có chuyến đi vui vẻ! Nhớ check app SCS GO để tìm trạm nhé 😊",
            likes: 5,
            isLiked: false,
            replies: [],
            createdAt: new Date("2026-01-29T10:30:00"),
          },
        ],
        createdAt: new Date("2026-01-29T09:15:00"),
      },
      {
        id: "c2",
        userId: "u3",
        userName: "Hoàng Lê",
        userAvatar: "https://i.pravatar.cc/150?img=3",
        content: "Trạm Bảo Lộc sạc nhanh không anh? Em dùng VF e34",
        likes: 3,
        isLiked: true,
        replies: [],
        createdAt: new Date("2026-01-29T11:00:00"),
      },
    ],
    shares: 45,
    createdAt: new Date("2026-01-29T08:00:00"),
    myReaction: "love",
    isSaved: true,
    privacy: "public",
    tags: ["roadtrip", "dalat", "vinfast", "evcommunity"],
  },
  {
    id: "2",
    userId: "u4",
    userName: "Thu Hà",
    userAvatar: "https://i.pravatar.cc/150?img=9",
    content: `❓ Hỏi cộng đồng: Có ai biết trạm sạc nào ở Quận 7 có amenities tốt không ạ?

Mình thường phải chờ sạc 30-40 phút, muốn tìm chỗ có:
- Cafe/quán ăn gần
- Wifi mạnh
- Chỗ ngồi thoải mái

Xe mình là Tesla Model 3. Cảm ơn mọi người trước! 🙏`,
    images: [],
    reactions: [
      { type: "like", count: 18 },
      { type: "love", count: 3 },
    ],
    totalReactions: 21,
    comments: [
      {
        id: "c3",
        userId: "u5",
        userName: "Nam Phạm",
        userAvatar: "https://i.pravatar.cc/150?img=12",
        content: "Trạm ở Crescent Mall có đủ hết luôn chị! Wifi mạnh, có Starbucks ngay bên cạnh, sạc xong đi shopping luôn 😄",
        likes: 8,
        isLiked: false,
        replies: [],
        createdAt: new Date("2026-01-30T14:30:00"),
      },
    ],
    shares: 5,
    createdAt: new Date("2026-01-30T13:00:00"),
    isSaved: false,
    privacy: "public",
    tags: ["question", "quan7", "tesla"],
  },
  {
    id: "3",
    userId: "u6",
    userName: "EV Vietnam Official",
    userAvatar: "https://i.pravatar.cc/150?img=60",
    userBadge: "Verified",
    content: `📢 THÔNG BÁO: Khai trương trạm sạc siêu nhanh 350kW tại Vinhomes Grand Park!

✨ Đặc điểm:
• 8 cổng sạc DC 350kW - nhanh nhất Việt Nam
• 4 cổng AC 22kW cho sạc qua đêm  
• Khu vực chờ có điều hòa, wifi free
• Mở cửa 24/7

🎁 Khuyến mãi khai trương: MIỄN PHÍ sạc 3 ngày đầu (28/1 - 30/1)!

📍 Địa chỉ: Tầng hầm B2, Vinhomes Grand Park, Q9

Tag bạn bè để không bỏ lỡ! 👇`,
    images: [
      "https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    location: "Vinhomes Grand Park, Quận 9",
    reactions: [
      { type: "love", count: 456 },
      { type: "like", count: 234 },
      { type: "wow", count: 89 },
    ],
    totalReactions: 779,
    comments: [],
    shares: 234,
    createdAt: new Date("2026-01-28T09:00:00"),
    isSaved: false,
    privacy: "public",
    tags: ["news", "vinfast", "supercharger"],
  },
];

// Mock Suggested Groups
const mockGroups: SuggestedGroup[] = [
  {
    id: "g1",
    name: "Hội VinFast VF8/VF9 Việt Nam",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=200",
    members: 15420,
    isJoined: false,
  },
  {
    id: "g2",
    name: "EV Road Trip Vietnam",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200",
    members: 8750,
    isJoined: true,
  },
  {
    id: "g3",
    name: "Tesla Owners Vietnam",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200",
    members: 5230,
    isJoined: false,
  },
];

// Reaction Emojis
const reactionEmojis = {
  like: "👍",
  love: "❤️",
  haha: "😆",
  wow: "😮",
  sad: "😢",
  angry: "😠",
};

const Community = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isVn = language === "vi";

  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [stories] = useState<Story[]>(mockStories);
  const [groups, setGroups] = useState<SuggestedGroup[]>(mockGroups);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isVn ? "Vừa xong" : "Just now";
    if (minutes < 60) return `${minutes}${isVn ? " phút" : "m"}`;
    if (hours < 24) return `${hours}${isVn ? " giờ" : "h"}`;
    return `${days}${isVn ? " ngày" : "d"}`;
  };

  const handleReaction = (postId: string, reaction: keyof typeof reactionEmojis) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const hadReaction = post.myReaction;
        const newReactions = [...post.reactions];
        
        if (hadReaction) {
          const idx = newReactions.findIndex(r => r.type === hadReaction);
          if (idx !== -1) newReactions[idx].count--;
        }
        
        if (hadReaction !== reaction) {
          const idx = newReactions.findIndex(r => r.type === reaction);
          if (idx !== -1) {
            newReactions[idx].count++;
          } else {
            newReactions.push({ type: reaction, count: 1 });
          }
        }

        return {
          ...post,
          myReaction: hadReaction === reaction ? undefined : reaction,
          totalReactions: post.totalReactions + (hadReaction ? -1 : 0) + (hadReaction === reaction ? 0 : 1),
          reactions: newReactions,
        };
      }
      return post;
    }));
    setShowReactions(null);
  };

  const handleComment = (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: `c-${Date.now()}`,
            userId: "me",
            userName: "Bạn",
            userAvatar: "https://i.pravatar.cc/150?img=68",
            content: content.trim(),
            likes: 0,
            isLiked: false,
            replies: [],
            createdAt: new Date(),
          }],
        };
      }
      return post;
    }));
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const handleSave = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, isSaved: !post.isSaved } : post
    ));
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, isJoined: !g.isJoined } : g
    ));
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `p-${Date.now()}`,
      userId: "me",
      userName: "Bạn",
      userAvatar: "https://i.pravatar.cc/150?img=68",
      content: newPostContent,
      images: selectedImages,
      reactions: [],
      totalReactions: 0,
      comments: [],
      shares: 0,
      createdAt: new Date(),
      isSaved: false,
      privacy: "public",
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setSelectedImages([]);
    setShowCreatePost(false);
  };

  const getTopReactions = (reactions: Reaction[]) => {
    return reactions
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent hidden sm:block">
                  {isVn ? "Cộng đồng EV" : "EV Community"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-100 dark:bg-gray-700">
                <Sparkles className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Main Content */}
          <div className="flex-1 max-w-[680px] mx-auto lg:mx-0 space-y-4">
            {/* Stories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="flex-shrink-0 cursor-pointer group"
                    onClick={() => !story.isOwn && setViewingStory(story)}
                  >
                    {story.isOwn ? (
                      <div className="w-[110px] h-[200px] rounded-xl bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                        <div className="absolute inset-0 flex flex-col">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-800">
                              <AvatarImage src={story.userAvatar} />
                              <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-3 pt-6 relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center border-4 border-white dark:border-gray-800">
                              <Plus className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-center">
                              {isVn ? "Tạo tin" : "Create story"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={cn(
                        "w-[110px] h-[200px] rounded-xl relative overflow-hidden",
                        "ring-2 ring-offset-2",
                        story.isViewed 
                          ? "ring-gray-300 dark:ring-gray-600" 
                          : "ring-teal-500 ring-offset-white dark:ring-offset-gray-800"
                      )}>
                        <img
                          src={story.imageUrl}
                          alt={story.userName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                        <Avatar className={cn(
                          "absolute top-3 left-3 w-10 h-10 ring-4",
                          story.isViewed 
                            ? "ring-gray-300" 
                            : "ring-teal-500"
                        )}>
                          <AvatarImage src={story.userAvatar} />
                          <AvatarFallback>{story.userName[0]}</AvatarFallback>
                        </Avatar>
                        <p className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium line-clamp-2">
                          {story.userName}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create Post Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="https://i.pravatar.cc/150?img=68" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2.5 text-left text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {isVn ? "Bạn đang nghĩ gì về EV?" : "What's on your EV mind?"}
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button variant="ghost" className="flex-1 text-gray-600 dark:text-gray-300" onClick={() => setShowCreatePost(true)}>
                  <Video className="h-5 w-5 text-red-500 mr-2" />
                  <span className="hidden sm:inline">{isVn ? "Video trực tiếp" : "Live video"}</span>
                </Button>
                <Button variant="ghost" className="flex-1 text-gray-600 dark:text-gray-300" onClick={() => setShowCreatePost(true)}>
                  <Image className="h-5 w-5 text-green-500 mr-2" />
                  <span className="hidden sm:inline">{isVn ? "Ảnh/Video" : "Photo/Video"}</span>
                </Button>
                <Button variant="ghost" className="flex-1 text-gray-600 dark:text-gray-300" onClick={() => setShowCreatePost(true)}>
                  <Smile className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="hidden sm:inline">{isVn ? "Cảm xúc" : "Feeling"}</span>
                </Button>
              </div>
            </div>

            {/* Posts */}
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.userAvatar} />
                          <AvatarFallback>{post.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold hover:underline cursor-pointer">
                              {post.userName}
                            </span>
                            {post.userBadge && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300">
                                {post.userBadge === "Verified" ? (
                                  <CheckCircle2 className="h-3 w-3 mr-0.5" />
                                ) : (
                                  <Award className="h-3 w-3 mr-0.5" />
                                )}
                                {post.userBadge}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>{formatTimeAgo(post.createdAt)}</span>
                            <span>·</span>
                            {post.privacy === "public" ? (
                              <Globe className="h-3 w-3" />
                            ) : post.privacy === "friends" ? (
                              <Users className="h-3 w-3" />
                            ) : (
                              <Lock className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSave(post.id)}>
                            <Bookmark className={cn("h-4 w-4 mr-2", post.isSaved && "fill-current")} />
                            {post.isSaved ? (isVn ? "Bỏ lưu" : "Unsave") : (isVn ? "Lưu bài viết" : "Save post")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            {isVn ? "Báo cáo" : "Report"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Post Content */}
                    <div className="mt-3">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map(tag => (
                            <span key={tag} className="text-teal-600 dark:text-teal-400 text-sm hover:underline cursor-pointer">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {post.location && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span className="hover:underline cursor-pointer">{post.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Images */}
                  {post.images.length > 0 && (
                    <div className={cn(
                      "mt-3 grid gap-1",
                      post.images.length === 1 && "grid-cols-1",
                      post.images.length === 2 && "grid-cols-2",
                      post.images.length >= 3 && "grid-cols-2"
                    )}>
                      {post.images.slice(0, 4).map((img, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "relative overflow-hidden cursor-pointer",
                            post.images.length === 1 && "aspect-video",
                            post.images.length === 2 && "aspect-square",
                            post.images.length >= 3 && idx === 0 && "row-span-2 aspect-square",
                            post.images.length >= 3 && idx > 0 && "aspect-square",
                          )}
                        >
                          <img 
                            src={img} 
                            alt="" 
                            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                          />
                          {idx === 3 && post.images.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-2xl font-bold">+{post.images.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions & Comments Count */}
                  <div className="px-4 py-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        {getTopReactions(post.reactions).map((r, idx) => (
                          <span key={r.type} className={cn("text-base", idx > 0 && "-ml-1")} style={{ zIndex: 3 - idx }}>
                            {reactionEmojis[r.type]}
                          </span>
                        ))}
                        {post.totalReactions > 0 && (
                          <span className="ml-1 hover:underline cursor-pointer">
                            {post.totalReactions.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {post.comments.length > 0 && (
                          <span 
                            className="hover:underline cursor-pointer"
                            onClick={() => setExpandedComments(prev => 
                              prev.includes(post.id) 
                                ? prev.filter(id => id !== post.id)
                                : [...prev, post.id]
                            )}
                          >
                            {post.comments.length} {isVn ? "bình luận" : "comments"}
                          </span>
                        )}
                        {post.shares > 0 && (
                          <span className="hover:underline cursor-pointer">
                            {post.shares} {isVn ? "chia sẻ" : "shares"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 py-1 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                      {/* Like Button with Reactions */}
                      <div 
                        className="flex-1 relative"
                        onMouseEnter={() => setShowReactions(post.id)}
                        onMouseLeave={() => setShowReactions(null)}
                      >
                        <Button 
                          variant="ghost" 
                          className={cn(
                            "w-full justify-center gap-2",
                            post.myReaction && "text-teal-600 dark:text-teal-400"
                          )}
                          onClick={() => handleReaction(post.id, post.myReaction || "like")}
                        >
                          {post.myReaction ? (
                            <span className="text-lg">{reactionEmojis[post.myReaction]}</span>
                          ) : (
                            <ThumbsUp className="h-5 w-5" />
                          )}
                          <span className="hidden sm:inline">
                            {post.myReaction 
                              ? (post.myReaction === "like" ? (isVn ? "Thích" : "Like") : 
                                 post.myReaction === "love" ? (isVn ? "Yêu thích" : "Love") :
                                 post.myReaction === "haha" ? "Haha" :
                                 post.myReaction === "wow" ? "Wow" :
                                 post.myReaction === "sad" ? (isVn ? "Buồn" : "Sad") : 
                                 (isVn ? "Phẫn nộ" : "Angry"))
                              : (isVn ? "Thích" : "Like")}
                          </span>
                        </Button>
                        
                        {/* Reactions Popup */}
                        <AnimatePresence>
                          {showReactions === post.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: 10 }}
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-gray-700 rounded-full shadow-lg p-2 flex gap-1"
                            >
                              {Object.entries(reactionEmojis).map(([type, emoji]) => (
                                <button
                                  key={type}
                                  className="text-2xl hover:scale-125 transition-transform p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReaction(post.id, type as keyof typeof reactionEmojis);
                                  }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Button 
                        variant="ghost" 
                        className="flex-1 justify-center gap-2"
                        onClick={() => setExpandedComments(prev => 
                          prev.includes(post.id) 
                            ? prev.filter(id => id !== post.id)
                            : [...prev, post.id]
                        )}
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="hidden sm:inline">{isVn ? "Bình luận" : "Comment"}</span>
                      </Button>

                      <Button variant="ghost" className="flex-1 justify-center gap-2">
                        <Share2 className="h-5 w-5" />
                        <span className="hidden sm:inline">{isVn ? "Chia sẻ" : "Share"}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {(expandedComments.includes(post.id) || post.comments.length <= 2) && (
                    <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                      {/* Comment Input */}
                      <div className="flex gap-2 py-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="https://i.pravatar.cc/150?img=68" />
                          <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 relative">
                          <Input
                            placeholder={isVn ? "Viết bình luận..." : "Write a comment..."}
                            value={commentInputs[post.id] || ""}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                            className="rounded-full bg-gray-100 dark:bg-gray-700 border-0 pr-20"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Smile className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Camera className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleComment(post.id)}
                              disabled={!commentInputs[post.id]?.trim()}
                            >
                              <Send className={cn(
                                "h-4 w-4",
                                commentInputs[post.id]?.trim() ? "text-teal-500" : "text-gray-400"
                              )} />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.userAvatar} />
                              <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2 inline-block">
                                <span className="font-semibold text-sm hover:underline cursor-pointer">
                                  {comment.userName}
                                </span>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 px-2">
                                <span>{formatTimeAgo(comment.createdAt)}</span>
                                <button className={cn("font-semibold hover:underline", comment.isLiked && "text-teal-600")}>
                                  {isVn ? "Thích" : "Like"}
                                </button>
                                <button className="font-semibold hover:underline">
                                  {isVn ? "Trả lời" : "Reply"}
                                </button>
                                {comment.likes > 0 && (
                                  <span className="flex items-center gap-1">
                                    👍 {comment.likes}
                                  </span>
                                )}
                              </div>

                              {/* Replies */}
                              {comment.replies.length > 0 && (
                                <div className="mt-2 space-y-2 ml-4">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex gap-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={reply.userAvatar} />
                                        <AvatarFallback>{reply.userName[0]}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2 inline-block">
                                          <span className="font-semibold text-sm hover:underline cursor-pointer">
                                            {reply.userName}
                                          </span>
                                          <p className="text-sm">{reply.content}</p>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 px-2">
                                          <span>{formatTimeAgo(reply.createdAt)}</span>
                                          <button className="font-semibold hover:underline">
                                            {isVn ? "Thích" : "Like"}
                                          </button>
                                          <button className="font-semibold hover:underline">
                                            {isVn ? "Trả lời" : "Reply"}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="hidden lg:block w-[340px] space-y-4">
            {/* Trending Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                {isVn ? "Xu hướng" : "Trending"}
              </h3>
              <div className="space-y-3">
                {[
                  { tag: "#VinFastVF8", posts: "2.4k posts" },
                  { tag: "#RoadTripEV", posts: "1.8k posts" },
                  { tag: "#SạcXeĐiện", posts: "945 posts" },
                  { tag: "#TeslaVietnam", posts: "756 posts" },
                ].map((item) => (
                  <div key={item.tag} className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg cursor-pointer -mx-2">
                    <div>
                      <p className="font-medium text-teal-600">{item.tag}</p>
                      <p className="text-xs text-gray-500">{item.posts}</p>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Groups */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{isVn ? "Nhóm gợi ý" : "Suggested Groups"}</h3>
                <Button variant="link" className="text-teal-600 p-0 h-auto">
                  {isVn ? "Xem tất cả" : "See all"}
                </Button>
              </div>
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.id} className="flex gap-3 items-center">
                    <img 
                      src={group.image} 
                      alt={group.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{group.name}</p>
                      <p className="text-xs text-gray-500">
                        {group.members.toLocaleString()} {isVn ? "thành viên" : "members"}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      variant={group.isJoined ? "outline" : "default"}
                      className={cn(!group.isJoined && "bg-teal-500 hover:bg-teal-600")}
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      {group.isJoined ? (isVn ? "Đã tham gia" : "Joined") : (isVn ? "Tham gia" : "Join")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-sm p-4 text-white">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5" />
                {isVn ? "Thống kê cộng đồng" : "Community Stats"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">15.4k</p>
                  <p className="text-xs opacity-80">{isVn ? "Thành viên" : "Members"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">2.8k</p>
                  <p className="text-xs opacity-80">{isVn ? "Bài viết/tuần" : "Posts/week"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">456</p>
                  <p className="text-xs opacity-80">{isVn ? "Đánh giá trạm" : "Station Reviews"}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs opacity-80">{isVn ? "Online" : "Online now"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-center">{isVn ? "Tạo bài viết" : "Create Post"}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="flex gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://i.pravatar.cc/150?img=68" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Bạn</p>
                <Button variant="outline" size="sm" className="h-6 text-xs gap-1">
                  <Globe className="h-3 w-3" />
                  {isVn ? "Công khai" : "Public"}
                </Button>
              </div>
            </div>
            <Textarea
              placeholder={isVn ? "Bạn đang nghĩ gì về EV?" : "What's on your EV mind?"}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[150px] border-0 resize-none text-lg focus-visible:ring-0"
            />
            
            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button 
                      className="absolute top-2 right-2 w-6 h-6 bg-gray-800/70 rounded-full flex items-center justify-center"
                      onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add to post */}
            <div className="flex items-center justify-between mt-4 p-3 border rounded-lg">
              <span className="font-medium text-sm">{isVn ? "Thêm vào bài viết" : "Add to your post"}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                  <Image className="h-5 w-5 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MapPin className="h-5 w-5 text-red-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-5 w-5 text-yellow-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Car className="h-5 w-5 text-blue-500" />
                </Button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const urls = files.map(f => URL.createObjectURL(f));
                  setSelectedImages([...selectedImages, ...urls]);
                }}
              />
            </div>

            <Button 
              className="w-full mt-4 bg-teal-500 hover:bg-teal-600"
              onClick={handleCreatePost}
              disabled={!newPostContent.trim()}
            >
              {isVn ? "Đăng" : "Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setViewingStory(null)}
          >
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setViewingStory(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="max-w-[400px] w-full">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="w-10 h-10 ring-2 ring-white">
                  <AvatarImage src={viewingStory.userAvatar} />
                  <AvatarFallback>{viewingStory.userName[0]}</AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <p className="font-semibold">{viewingStory.userName}</p>
                  <p className="text-xs opacity-70">2h</p>
                </div>
              </div>
              <img 
                src={viewingStory.imageUrl} 
                alt={viewingStory.userName}
                className="w-full aspect-[9/16] object-cover rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community;
