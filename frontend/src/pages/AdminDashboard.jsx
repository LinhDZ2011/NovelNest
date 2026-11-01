import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../utils/Footer";
import DarkModeContext from "../context/DarkModeContext";
import LoadingScreen from "../utils/LoadingScreen";
import api from "../services/api";
import {
  FaChartBar,
  FaFileAlt,
  FaBook,
  FaComments,
  FaUsers,
  FaCheck,
  FaEdit,
  FaTrashAlt,
  FaSearch,
  FaCamera,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTimes,
  FaArrowLeft,
  FaTags,
  FaPlus,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const COLOR_PRESETS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#EF4444", // Red
  "#F43F5E", // Rose
  "#EAB308", // Yellow
];

const AdminDashboard = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Trạng thái các số liệu thống kê
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAuthors: 0,
    totalNovels: 0,
    totalPosts: 0,
    totalGenres: 0,
    pendingRequests: 0,
    recentNovels: [],
    recentPosts: [],
  });

  // Trạng thái danh sách đơn đăng ký tác giả
  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState("pending");
  const [selectedRejectRequest, setSelectedRejectRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Trạng thái danh sách truyện
  const [novels, setNovels] = useState([]);
  const [novelSearch, setNovelSearch] = useState("");
  const [editingNovel, setEditingNovel] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGenres, setEditGenres] = useState([]);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const [deletingNovel, setDeletingNovel] = useState(null);

  // Trạng thái quản lý Thể loại của Admin
  const [genres, setGenres] = useState([]);
  const [genreSearch, setGenreSearch] = useState("");
  const [isCreatingGenre, setIsCreatingGenre] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [deletingGenre, setDeletingGenre] = useState(null);
  const [genreFormName, setGenreFormName] = useState("");
  const [genreFormDescription, setGenreFormDescription] = useState("");
  const [genreFormColor, setGenreFormColor] = useState("#8B5CF6");

  // Trạng thái quản lý và chỉnh sửa chương truyện của Admin
  const [managingChaptersNovel, setManagingChaptersNovel] = useState(null);
  const [novelChapters, setNovelChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [adminEditingChapter, setAdminEditingChapter] = useState(null);
  const [adminChapterName, setAdminChapterName] = useState("");
  const [adminChapterContent, setAdminChapterContent] = useState("");
  const [isFetchingAdminChapter, setIsFetchingAdminChapter] = useState(false);
  const [isSavingAdminChapter, setIsSavingAdminChapter] = useState(false);

  // Trạng thái danh sách bài viết diễn đàn
  const [posts, setPosts] = useState([]);
  const [postSearch, setPostSearch] = useState("");
  const [deletingPost, setDeletingPost] = useState(null);

  // Trạng thái danh sách người dùng
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  // Trạng thái tiến trình thao tác và thông báo toast
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState("");

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, reqsRes, novelsRes, postsRes, usersRes, genresRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/author-requests"),
        api.get("/admin/novels"),
        api.get("/admin/posts"),
        api.get("/admin/users"),
        api.get("/genres"),
      ]);

      setStats(statsRes.data);
      setRequests(reqsRes.data);
      setNovels(novelsRes.data);
      setPosts(postsRes.data);
      setUsers(usersRes.data);
      setGenres(genresRes.data);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- CÁC HÀNH ĐỘNG: DUYỆT ĐƠN TÁC GIẢ ---
  const handleApproveRequest = async (reqId) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/author-requests/${reqId}/review`, {
        status: "approved",
      });
      showToast("Đã phê duyệt đơn tác giả thành công!");
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi phê duyệt đơn tác giả.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRejectRequest) return;
    try {
      setActionLoading(true);
      await api.put(`/admin/author-requests/${selectedRejectRequest._id}/review`, {
        status: "rejected",
        adminNote: rejectReason,
      });
      showToast("Đã từ chối đơn yêu cầu tác giả.");
      setSelectedRejectRequest(null);
      setRejectReason("");
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi từ chối đơn.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- CÁC HÀNH ĐỘNG: QUẢN LÝ TRUYỆN ---
  const openEditNovel = (novel) => {
    setEditingNovel(novel);
    setEditTitle(novel.title || "");
    setEditDescription(novel.description || "");
    const initialGenres = (novel.genres || []).map((g) => (g && g._id ? g._id : g));
    setEditGenres(initialGenres);
    setEditCoverFile(null);
    setEditCoverPreview(novel.coverPhoto?.url || null);
  };

  const toggleAdminNovelGenre = (genreId) => {
    setEditGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const handleSaveEditNovel = async (e) => {
    e.preventDefault();
    if (!editingNovel) return;
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("description", editDescription.trim());
      formData.append("genres", JSON.stringify(editGenres));
      if (editCoverFile) {
        formData.append("coverPhoto", editCoverFile);
      }

      await api.put(`/novels/${editingNovel._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Cập nhật thông tin truyện thành công!");
      setEditingNovel(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi cập nhật truyện.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeleteNovel = async () => {
    if (!deletingNovel) return;
    try {
      setActionLoading(true);
      await api.delete(`/novels/${deletingNovel._id}`);
      showToast("Đã xóa truyện và dọn dẹp liên kết dữ liệu thành công!");
      setDeletingNovel(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xóa truyện.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- CÁC HÀNH ĐỘNG: QUẢN LÝ THỂ LOẠI (ADMIN) ---
  const openCreateGenreModal = () => {
    setGenreFormName("");
    setGenreFormDescription("");
    setGenreFormColor("#8B5CF6");
    setIsCreatingGenre(true);
  };

  const openEditGenreModal = (genre) => {
    setEditingGenre(genre);
    setGenreFormName(genre.name || "");
    setGenreFormDescription(genre.description || "");
    setGenreFormColor(genre.color || "#8B5CF6");
  };

  const handleCreateGenre = async (e) => {
    e.preventDefault();
    if (!genreFormName.trim()) {
      showToast("Vui lòng nhập tên thể loại");
      return;
    }
    try {
      setActionLoading(true);
      await api.post("/genres", {
        name: genreFormName.trim(),
        description: genreFormDescription.trim(),
        color: genreFormColor.trim(),
      });
      showToast(`Đã tạo thể loại "${genreFormName.trim()}" thành công!`);
      setIsCreatingGenre(false);
      await loadAllData();
    } catch (err) {
      console.error("Create genre error:", err);
      showToast(err.response?.data?.msg || "Lỗi khi tạo thể loại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGenre = async (e) => {
    e.preventDefault();
    if (!editingGenre || !genreFormName.trim()) return;
    try {
      setActionLoading(true);
      await api.put(`/genres/${editingGenre._id}`, {
        name: genreFormName.trim(),
        description: genreFormDescription.trim(),
        color: genreFormColor.trim(),
      });
      showToast("Cập nhật thông tin thể loại thành công!");
      setEditingGenre(null);
      await loadAllData();
    } catch (err) {
      console.error("Update genre error:", err);
      showToast(err.response?.data?.msg || "Lỗi khi cập nhật thể loại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeleteGenre = async () => {
    if (!deletingGenre) return;
    try {
      setActionLoading(true);
      const res = await api.delete(`/genres/${deletingGenre._id}`);
      showToast(res.data?.msg || "Đã xóa thể loại an toàn!");
      setDeletingGenre(null);
      await loadAllData();
    } catch (err) {
      console.error("Delete genre error:", err);
      showToast(err.response?.data?.msg || "Lỗi khi xóa thể loại.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- CÁC HÀNH ĐỘNG: QUẢN LÝ & CHỈNH SỬA CHƯƠNG TRUYỆN ADMIN ---
  const openManageChapters = async (novel) => {
    setManagingChaptersNovel(novel);
    setAdminEditingChapter(null);
    setLoadingChapters(true);
    try {
      const res = await api.get(`/chapters/${novel._id}/chapters`);
      if (Array.isArray(res.data)) {
        setNovelChapters(res.data);
      } else {
        setNovelChapters([]);
      }
    } catch (err) {
      console.error("Error loading chapters:", err);
      setNovelChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  };

  const openAdminEditChapter = async (chapter) => {
    if (!managingChaptersNovel) return;
    setAdminEditingChapter(chapter);
    setAdminChapterName(chapter.chapterName || "");
    setAdminChapterContent(chapter.chapterContent || "");
    setIsFetchingAdminChapter(true);
    try {
      const res = await api.get(`/chapters/${managingChaptersNovel._id}/chapters/${chapter._id}`);
      if (res.data) {
        setAdminChapterName(res.data.chapterName || "");
        setAdminChapterContent(res.data.chapterContent || "");
      }
    } catch (err) {
      console.error("Error fetching chapter content:", err);
      showToast("Không thể tải chi tiết nội dung chương.");
    } finally {
      setIsFetchingAdminChapter(false);
    }
  };

  const handleAdminSaveChapter = async (e) => {
    e.preventDefault();
    if (!managingChaptersNovel || !adminEditingChapter) return;
    if (!adminChapterName.trim() || !adminChapterContent.trim()) {
      showToast("Vui lòng nhập đầy đủ tiêu đề và nội dung chương.");
      return;
    }
    try {
      setIsSavingAdminChapter(true);
      await api.put(`/chapters/${managingChaptersNovel._id}/chapters/${adminEditingChapter._id}`, {
        chapterName: adminChapterName.trim(),
        chapterContent: adminChapterContent.trim(),
      });
      showToast("Đã lưu nội dung chương thành công!");

      setNovelChapters((prev) =>
        prev.map((c) =>
          c._id === adminEditingChapter._id
            ? { ...c, chapterName: adminChapterName.trim(), chapterContent: adminChapterContent.trim() }
            : c
        )
      );
      setAdminEditingChapter(null);
    } catch (err) {
      console.error("Error updating chapter:", err);
      showToast("Lỗi khi cập nhật nội dung chương.");
    } finally {
      setIsSavingAdminChapter(false);
    }
  };

  // --- CÁC HÀNH ĐỘNG: QUẢN LÝ BÀI VIẾT DIỄN ĐÀN ---
  const handleConfirmDeletePost = async () => {
    if (!deletingPost) return;
    try {
      setActionLoading(true);
      await api.delete(`/posts/${deletingPost._id}`);
      showToast("Đã xóa bài viết khỏi diễn đàn thành công!");
      setDeletingPost(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi xóa bài viết.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- CÁC HÀNH ĐỘNG: QUẢN LÝ NGƯỜI DÙNG ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      showToast(`Đã cập nhật vai trò thành [${newRole}]`);
      await loadAllData();
    } catch (err) {
      console.error(err);
      showToast("Lỗi khi cập nhật vai trò.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (requestFilter === "all") return true;
    return r.status === requestFilter;
  });

  const filteredNovels = novels.filter((n) =>
    n.title?.toLowerCase().includes(novelSearch.toLowerCase()) ||
    n.author?.penName?.toLowerCase().includes(novelSearch.toLowerCase())
  );

  const filteredGenres = genres.filter((g) =>
    g.name?.toLowerCase().includes(genreSearch.toLowerCase()) ||
    g.slug?.toLowerCase().includes(genreSearch.toLowerCase()) ||
    g.description?.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const filteredPosts = posts.filter((p) =>
    p.title?.toLowerCase().includes(postSearch.toLowerCase()) ||
    p.user?.name?.toLowerCase().includes(postSearch.toLowerCase()) ||
    p.content?.toLowerCase().includes(postSearch.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-black text-white" : "bg-gray-50 text-gray-900"}`}>
      <Navbar />

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="pt-24 pb-16 max-w-7xl mx-auto px-4">
          {/* TOAST NOTIFICATION */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold shadow-2xl flex items-center gap-2 border border-purple-400"
              >
                <FaCheck /> {notification}
              </motion.div>
            )}
          </AnimatePresence>

          {/* HEADER PORTAL */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
                <FaShieldAlt size={26} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Bảng Điều Khiển Quản Trị Viên
                </h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  Hệ thống kiểm duyệt nội dung, quản lý thể loại, duyệt đơn tác giả và người dùng NovelHub
                </p>
              </div>
            </div>

            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 self-start md:self-auto">
              🛡️ Quyền Quản trị viên Tối cao
            </span>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
            {[
              { id: "overview", label: "Tổng quan", icon: FaChartBar },
              {
                id: "requests",
                label: `Duyệt đơn tác giả ${
                  stats.pendingRequests > 0 ? `(${stats.pendingRequests})` : ""
                }`,
                icon: FaFileAlt,
              },
              { id: "novels", label: `Quản lý truyện (${novels.length})`, icon: FaBook },
              { id: "genres", label: `Quản lý thể loại (${genres.length})`, icon: FaTags },
              { id: "posts", label: `Diễn đàn (${posts.length})`, icon: FaComments },
              { id: "users", label: `Người dùng (${users.length})`, icon: FaUsers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                      : isDarkMode
                      ? "bg-gray-900/80 text-gray-400 hover:text-white hover:bg-gray-800"
                      : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <Icon className="text-base" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: TỔNG QUAN & THỐNG KÊ */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {[
                  { label: "Tổng người dùng", val: stats.totalUsers, icon: FaUsers, color: "blue" },
                  { label: "Tổng tác giả", val: stats.totalAuthors, icon: FaFileAlt, color: "yellow" },
                  { label: "Tổng số truyện", val: stats.totalNovels, icon: FaBook, color: "purple" },
                  { label: "Tổng thể loại", val: stats.totalGenres || genres.length, icon: FaTags, color: "indigo" },
                  { label: "Bài thảo luận", val: stats.totalPosts, icon: FaComments, color: "green" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className={`p-5 rounded-2xl border transition-all duration-300 ${
                        isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {item.label}
                        </span>
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                          <Icon size={18} />
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{item.val}</p>
                    </div>
                  );
                })}
              </div>

              {/* Pending Requests Alert */}
              {stats.pendingRequests > 0 && (
                <div
                  onClick={() => {
                    setActiveTab("requests");
                    setRequestFilter("pending");
                  }}
                  className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaExclamationTriangle size={22} />
                    <span className="font-semibold text-sm md:text-base">
                      Đang có <strong>{stats.pendingRequests}</strong> đơn xin cấp quyền tác giả đang chờ duyệt!
                    </span>
                  </div>
                  <span className="text-xs font-bold underline">Xem và duyệt ngay &rarr;</span>
                </div>
              )}

              {/* Recent activity grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Novels */}
                <div
                  className={`p-6 rounded-2xl border ${
                    isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FaBook className="text-purple-400" />
                    <span>Tác phẩm mới đăng gần đây</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.recentNovels?.length > 0 ? (
                      stats.recentNovels.map((n) => (
                        <div
                          key={n._id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60"
                        >
                          <img
                            src={n.coverPhoto?.url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f"}
                            alt={n.title}
                            className="w-10 h-14 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{n.title}</p>
                            <p className="text-xs text-gray-500">
                              Tác giả: {n.author?.penName || "Ẩn danh"}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Chưa có tác phẩm mới</p>
                    )}
                  </div>
                </div>

                {/* Recent Posts */}
                <div
                  className={`p-6 rounded-2xl border ${
                    isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FaComments className="text-indigo-400" />
                    <span>Bài viết diễn đàn cần giám sát</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.recentPosts?.length > 0 ? (
                      stats.recentPosts.map((p) => (
                        <div
                          key={p._id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60"
                        >
                          <img
                            src={p.user?.userimage || "https://images.unsplash.com/photo-1511367461989-f85a21fda167"}
                            alt={p.user?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{p.title || p.content}</p>
                            <p className="text-xs text-gray-500">Người đăng: {p.user?.name}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Chưa có bài viết mới</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ ĐƠN XIN LÀM TÁC GIẢ */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              {/* Filter Sub-tabs */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
                {[
                  { id: "pending", label: "Chờ duyệt (Pending)" },
                  { id: "approved", label: "Đã duyệt (Approved)" },
                  { id: "rejected", label: "Đã từ chối (Rejected)" },
                  { id: "all", label: "Tất cả đơn" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRequestFilter(f.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      requestFilter === f.id
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredRequests.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  Không có đơn đăng ký nào trong mục này.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRequests.map((req) => (
                    <div
                      key={req._id}
                      className={`p-6 rounded-2xl border transition-all ${
                        isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.user?.userimage || "https://images.unsplash.com/photo-1511367461989-f85a21fda167"}
                            alt={req.user?.name}
                            className="w-12 h-12 rounded-full object-cover border"
                          />
                          <div>
                            <p className="font-bold text-base">{req.user?.name}</p>
                            <p className="text-xs text-gray-500">{req.user?.email}</p>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === "approved"
                              ? "bg-green-500/10 text-green-400 border border-green-500/30"
                              : req.status === "rejected"
                              ? "bg-red-500/10 text-red-400 border border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {req.status === "approved"
                            ? "Đã duyệt"
                            : req.status === "rejected"
                            ? "Đã từ chối"
                            : "Chờ duyệt"}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs md:text-sm mb-6 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl">
                        <p>
                          <strong className="text-purple-400">Bút danh mong muốn:</strong> {req.penName}
                        </p>
                        {req.bio && (
                          <p>
                            <strong className="text-gray-400">Giới thiệu:</strong> {req.bio}
                          </p>
                        )}
                        {req.reason && (
                          <p>
                            <strong className="text-gray-400">Kế hoạch / Dự án:</strong> {req.reason}
                          </p>
                        )}
                        {req.adminNote && (
                          <p className="text-red-400">
                            <strong>Ghi chú từ chối:</strong> {req.adminNote}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200 dark:border-gray-700">
                          Ngày nộp đơn: {new Date(req.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-3 justify-end">
                          <button
                            disabled={actionLoading}
                            onClick={() => setSelectedRejectRequest(req)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                          >
                            Từ chối
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleApproveRequest(req._id)}
                            className="px-5 py-2 rounded-xl text-xs font-semibold bg-green-600 hover:bg-green-700 text-white shadow transition-all"
                          >
                            Phê duyệt tác giả
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUẢN LÝ TOÀN BỘ TRUYỆN */}
          {activeTab === "novels" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Tìm kiếm truyện theo tên hoặc tác giả..."
                  value={novelSearch}
                  onChange={(e) => setNovelSearch(e.target.value)}
                  className={`w-full py-2.5 pl-10 pr-4 rounded-xl border text-sm outline-none ${
                    isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200"
                  }`}
                />
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Novels Table */}
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead
                      className={`text-xs uppercase border-b ${
                        isDarkMode
                          ? "bg-gray-800/60 border-gray-800 text-gray-400"
                          : "bg-gray-100 border-gray-200 text-gray-600"
                      }`}
                    >
                      <tr>
                        <th className="p-4">Tác phẩm</th>
                        <th className="p-4">Tác giả</th>
                        <th className="p-4">Thể loại</th>
                        <th className="p-4 text-center">Số chương</th>
                        <th className="p-4 text-center">Lượt thích</th>
                        <th className="p-4">Ngày đăng</th>
                        <th className="p-4 text-right">Thao tác Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredNovels.map((novel) => (
                        <tr key={novel._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={novel.coverPhoto?.url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f"}
                              alt={novel.title}
                              className="w-10 h-14 object-cover rounded-lg"
                            />
                            <div>
                              <p className="font-bold text-sm">{novel.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{novel.description}</p>
                            </div>
                          </td>
                          <td className="p-4">{novel.author?.penName || "Chưa xác định"}</td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {novel.genres && novel.genres.length > 0 ? (
                                novel.genres.map((g) => (
                                  <span
                                    key={g._id || g.slug}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: g.color || "#8B5CF6" }}
                                  >
                                    {g.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400 italic">Chưa gắn</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">{novel.chapters?.length || 0}</td>
                          <td className="p-4 text-center">{novel.likes?.length || 0}</td>
                          <td className="p-4 text-xs text-gray-500">
                            {new Date(novel.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => openManageChapters(novel)}
                              title="Quản lý & Chỉnh sửa chương"
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            >
                              <FaBook />
                            </button>
                            <button
                              onClick={() => openEditNovel(novel)}
                              title="Sửa cốt truyện / Thể loại"
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => setDeletingNovel(novel)}
                              title="Xóa truyện hoàn toàn"
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUẢN LÝ THỂ LOẠI (GENRE MANAGEMENT) */}
          {activeTab === "genres" && (
            <div className="space-y-6">
              {/* Header and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <input
                    type="text"
                    placeholder="Tìm kiếm thể loại theo tên, slug hoặc mô tả..."
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    className={`w-full py-2.5 pl-10 pr-4 rounded-xl border text-sm outline-none ${
                      isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200"
                    }`}
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <button
                  type="button"
                  onClick={openCreateGenreModal}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 transition-all self-start sm:self-auto"
                >
                  <FaPlus />
                  <span>Thêm thể loại mới</span>
                </button>
              </div>

              {/* Genres Table */}
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead
                      className={`text-xs uppercase border-b ${
                        isDarkMode
                          ? "bg-gray-800/60 border-gray-800 text-gray-400"
                          : "bg-gray-100 border-gray-200 text-gray-600"
                      }`}
                    >
                      <tr>
                        <th className="p-4">Tên thể loại</th>
                        <th className="p-4">Đường dẫn Slug</th>
                        <th className="p-4">Mô tả đặc trưng</th>
                        <th className="p-4 text-center">Số tác phẩm gắn</th>
                        <th className="p-4">Ngày tạo</th>
                        <th className="p-4 text-right">Thao tác Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredGenres.map((g) => (
                        <tr key={g._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                          <td className="p-4">
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                              style={{ backgroundColor: g.color || "#8B5CF6" }}
                            >
                              #{g.name}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-xs text-purple-400">/{g.slug}</td>
                          <td className="p-4 text-xs text-gray-500 max-w-sm truncate">
                            {g.description || "Chưa có mô tả."}
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-400">
                              {g.novelCount || 0} truyện
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                            {new Date(g.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => openEditGenreModal(g)}
                              title="Sửa tên / mô tả / màu sắc thể loại"
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingGenre(g)}
                              title="Xóa thể loại an toàn"
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: QUẢN LÝ DIỄN ĐÀN */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Tìm bài viết theo tiêu đề, người đăng, nội dung..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className={`w-full py-2.5 pl-10 pr-4 rounded-xl border text-sm outline-none ${
                    isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200"
                  }`}
                />
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <div
                    key={post._id}
                    className={`p-6 rounded-2xl border flex flex-col justify-between ${
                      isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.user?.userimage || "https://images.unsplash.com/photo-1511367461989-f85a21fda167"}
                            alt={post.user?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-sm">{post.user?.name}</p>
                            <p className="text-[11px] text-gray-500">
                              {new Date(post.createdAt || post.timeStamp).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeletingPost(post)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 flex items-center gap-1.5"
                        >
                          <FaTrashAlt size={12} />
                          <span>Gỡ bài</span>
                        </button>
                      </div>

                      <h4 className="font-bold text-base mb-2">{post.title}</h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                        {post.content}
                      </p>

                      {post.image?.url && (
                        <div className="h-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-4">
                          <img
                            src={post.image.url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                      <span>❤️ {post.likes?.length || 0} lượt thích</span>
                      <span>💬 {post.comments?.length || 0} bình luận</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: QUẢN LÝ NGƯỜI DÙNG */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Tìm người dùng theo tên hoặc email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className={`w-full py-2.5 pl-10 pr-4 rounded-xl border text-sm outline-none ${
                    isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200"
                  }`}
                />
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead
                      className={`text-xs uppercase border-b ${
                        isDarkMode
                          ? "bg-gray-800/60 border-gray-800 text-gray-400"
                          : "bg-gray-100 border-gray-200 text-gray-600"
                      }`}
                    >
                      <tr>
                        <th className="p-4">Người dùng</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Nguồn đăng nhập</th>
                        <th className="p-4">Ngày đăng ký</th>
                        <th className="p-4 text-right">Vai trò (Role)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={u.userimage || "https://images.unsplash.com/photo-1511367461989-f85a21fda167"}
                              alt={u.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="font-semibold">{u.name}</span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">{u.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                u.authProvider === "google"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              }`}
                            >
                              {u.authProvider === "google" ? "Google OAuth" : "Local Email"}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer transition-all ${
                                u.role === "admin"
                                  ? "bg-purple-900/30 text-purple-400 border-purple-500/40"
                                  : u.role === "author"
                                  ? "bg-yellow-900/30 text-yellow-400 border-yellow-500/40"
                                  : isDarkMode
                                  ? "bg-gray-800 border-gray-700 text-gray-300"
                                  : "bg-gray-100 border-gray-300 text-gray-700"
                              }`}
                            >
                              <option
                                value="user"
                                style={{
                                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                                  color: isDarkMode ? "#f3f4f6" : "#111827",
                                }}
                                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium py-1"
                              >
                                Độc giả (User)
                              </option>
                              <option
                                value="author"
                                style={{
                                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                                  color: isDarkMode ? "#facc15" : "#b45309",
                                }}
                                className="bg-white dark:bg-gray-800 text-amber-700 dark:text-yellow-300 font-semibold py-1"
                              >
                                Tác giả (Author)
                              </option>
                              <option
                                value="admin"
                                style={{
                                  backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                                  color: isDarkMode ? "#c084fc" : "#7e22ce",
                                }}
                                className="bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 font-semibold py-1"
                              >
                                Quản trị (Admin)
                              </option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL THÊM THỂ LOẠI MỚI */}
      <AnimatePresence>
        {isCreatingGenre && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaTags className="text-purple-400" />
                <span>Thêm thể loại mới</span>
              </h3>
              <form onSubmit={handleCreateGenre} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Tên thể loại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={genreFormName}
                    onChange={(e) => setGenreFormName(e.target.value)}
                    placeholder="Ví dụ: Tiên Hiệp, Đô Thị..."
                    required
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Mô tả đặc trưng</label>
                  <textarea
                    rows={3}
                    value={genreFormDescription}
                    onChange={(e) => setGenreFormDescription(e.target.value)}
                    placeholder="Mô tả ngắn gọn về đặc điểm của thể loại..."
                    className={`w-full px-4 py-2 rounded-xl text-sm border outline-none ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">Màu sắc huy hiệu đại diện</label>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setGenreFormColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          genreFormColor === c ? "scale-125 ring-2 ring-white" : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={genreFormColor}
                      onChange={(e) => setGenreFormColor(e.target.value)}
                      className="w-10 h-10 p-0 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-gray-400">{genreFormColor}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsCreatingGenre(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md disabled:opacity-50"
                  >
                    {actionLoading ? "Đang tạo..." : "Tạo thể loại"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SỬA THỂ LOẠI */}
      <AnimatePresence>
        {editingGenre && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaEdit className="text-blue-500" />
                <span>Chỉnh sửa thể loại</span>
              </h3>
              <form onSubmit={handleUpdateGenre} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Tên thể loại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={genreFormName}
                    onChange={(e) => setGenreFormName(e.target.value)}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Mô tả đặc trưng</label>
                  <textarea
                    rows={3}
                    value={genreFormDescription}
                    onChange={(e) => setGenreFormDescription(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl text-sm border outline-none ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">Màu sắc huy hiệu đại diện</label>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setGenreFormColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform ${
                          genreFormColor === c ? "scale-125 ring-2 ring-white" : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={genreFormColor}
                      onChange={(e) => setGenreFormColor(e.target.value)}
                      className="w-10 h-10 p-0 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-mono text-gray-400">{genreFormColor}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setEditingGenre(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50"
                  >
                    {actionLoading ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL XÁC NHẬN XÓA THỂ LOẠI AN TOÀN */}
      <AnimatePresence>
        {deletingGenre && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <FaTrashAlt size={22} />
                <h4 className="text-lg font-bold">Xác nhận xóa thể loại</h4>
              </div>
              <p className="text-sm mb-4 leading-relaxed">
                Bạn có chắc chắn muốn xóa thể loại{" "}
                <strong className="text-purple-400">&quot;{deletingGenre.name}&quot;</strong>?
              </p>
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 mb-6 leading-relaxed">
                🛡️ <strong>Cơ chế bảo toàn dữ liệu:</strong> Thể loại này hiện đang được gắn cho{" "}
                <strong>{deletingGenre.novelCount || 0} tác phẩm</strong>. Khi xóa, thể loại sẽ tự động được gỡ khỏi các tác phẩm liên quan mà không làm mất truyện.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingGenre(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmDeleteGenre}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {actionLoading ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL TỪ CHỐI ĐƠN TÁC GIẢ KÈM LÝ DO */}
      <AnimatePresence>
        {selectedRejectRequest && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              <h4 className="text-lg font-bold mb-2">Lý do từ chối đơn đăng ký</h4>
              <p className="text-xs text-gray-500 mb-4">
                Người dùng ({selectedRejectRequest.user?.name}) sẽ thấy lý do này tại trang cá nhân để khắc phục.
              </p>
              <textarea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Bút danh trùng lặp, thông tin chưa đầy đủ..."
                className={`w-full p-3 rounded-xl border text-sm outline-none mb-4 ${
                  isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"
                }`}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRejectRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleRejectRequest}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SỬA CỐT TRUYỆN & THỂ LOẠI ADMIN */}
      <AnimatePresence>
        {editingNovel && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-xl w-full p-6 rounded-2xl border shadow-2xl ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaEdit className="text-blue-500" />
                <span>Admin - Chỉnh sửa cốt truyện & thông tin tác phẩm</span>
              </h3>
              <form onSubmit={handleSaveEditNovel} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2">Ảnh bìa</label>
                  <div className="flex items-center gap-4">
                    {editCoverPreview && (
                      <img
                        src={editCoverPreview}
                        alt="Preview"
                        className="w-16 h-24 object-cover rounded-xl border shadow"
                      />
                    )}
                    <label className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold inline-flex items-center gap-2">
                      <FaCamera /> Thay ảnh bìa
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setEditCoverFile(file);
                            setEditCoverPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Tên tác phẩm</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className={`w-full px-4 py-2 rounded-xl text-sm border outline-none ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>

                {/* Phân loại thể loại trong Admin Edit */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold">Thể loại tác phẩm</label>
                    <span className="text-[11px] text-purple-400 font-semibold">
                      Đã chọn: {editGenres.length} thể loại
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-xl border max-h-32 overflow-y-auto ${
                      isDarkMode ? "bg-gray-800/40 border-gray-700" : "bg-gray-50 border-gray-200"
                    } flex flex-wrap gap-1.5`}
                  >
                    {genres.map((g) => {
                      const isSelected = editGenres.includes(g._id);
                      return (
                        <button
                          type="button"
                          key={g._id}
                          onClick={() => toggleAdminNovelGenre(g._id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? "text-white shadow-md scale-105"
                              : isDarkMode
                              ? "bg-gray-700/60 text-gray-300 hover:bg-gray-700"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                          style={isSelected ? { backgroundColor: g.color || "#8B5CF6" } : {}}
                        >
                          {isSelected && <FaCheck size={9} />}
                          <span>{g.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Tóm tắt nội dung / Cốt truyện</label>
                  <textarea
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none leading-relaxed ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingNovel(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL XÓA TRUYỆN ADMIN */}
      <AnimatePresence>
        {deletingNovel && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <FaTrashAlt size={22} />
                <h4 className="text-lg font-bold">Admin: Xóa vĩnh viễn truyện</h4>
              </div>
              <p className="text-sm mb-4">
                Bạn có chắc chắn muốn xóa tác phẩm <strong className="text-red-500">&quot;{deletingNovel.title}&quot;</strong>?
              </p>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 mb-6">
                ⚠️ Thao tác này sẽ xóa triệt để tác phẩm, các chương, lượt đánh giá và gỡ bỏ khỏi thư viện của tất cả người dùng (Facade Pattern).
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingNovel(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmDeleteNovel}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL XÓA BÀI VIẾT ADMIN */}
      <AnimatePresence>
        {deletingPost && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <FaTrashAlt size={22} />
                <h4 className="text-lg font-bold">Admin: Xóa bài viết diễn đàn</h4>
              </div>
              <p className="text-sm mb-6 text-gray-600 dark:text-gray-300">
                Xác nhận gỡ bỏ bài viết của người dùng <strong>{deletingPost.user?.name}</strong> khỏi diễn đàn?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingPost(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmDeletePost}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  Gỡ bài viết
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL QUẢN LÝ VÀ CHỈNH SỬA CHƯƠNG ADMIN */}
      <AnimatePresence>
        {managingChaptersNovel && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-3xl w-full p-6 rounded-2xl border shadow-2xl my-8 ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <FaBook size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {adminEditingChapter
                        ? `Chỉnh sửa Chương ${adminEditingChapter.chapterNumber}`
                        : "Quản lý danh sách chương"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Tác phẩm: <span className="font-semibold text-blue-400">{managingChaptersNovel.title}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setManagingChaptersNovel(null);
                    setAdminEditingChapter(null);
                  }}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              {/* View 1: Edit Chapter Content */}
              {adminEditingChapter ? (
                <form onSubmit={handleAdminSaveChapter} className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setAdminEditingChapter(null)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white"
                    >
                      <FaArrowLeft /> Quay lại danh sách chương
                    </button>
                    {isFetchingAdminChapter && (
                      <span className="text-xs text-blue-400 animate-pulse">
                        Đang tải toàn bộ văn bản chương...
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Tiêu đề chương</label>
                    <input
                      type="text"
                      value={adminChapterName}
                      onChange={(e) => setAdminChapterName(e.target.value)}
                      placeholder="Ví dụ: Chương 1: Ly Hương"
                      required
                      className={`w-full px-4 py-2.5 rounded-xl text-sm border outline-none font-medium ${
                        isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Nội dung văn bản chương</label>
                    <textarea
                      rows={14}
                      value={adminChapterContent}
                      onChange={(e) => setAdminChapterContent(e.target.value)}
                      placeholder="Nhập hoặc chỉnh sửa toàn bộ nội dung văn bản của chương truyện tại đây..."
                      required
                      className={`w-full p-4 rounded-xl text-sm border outline-none font-sans leading-relaxed resize-y ${
                        isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-50 border-gray-200 text-gray-800"
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminEditingChapter(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAdminChapter || isFetchingAdminChapter}
                      className="px-6 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                    >
                      {isSavingAdminChapter ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              ) : (
                /* View 2: Chapters List */
                <div className="pt-4 space-y-4">
                  {loadingChapters ? (
                    <div className="py-12 text-center text-sm text-gray-400">
                      Đang tải danh sách chương...
                    </div>
                  ) : novelChapters.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-400">
                      Tác phẩm này hiện chưa có chương nào.
                    </div>
                  ) : (
                    <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
                      {novelChapters.map((chapter) => (
                        <div
                          key={chapter._id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                            isDarkMode
                              ? "bg-gray-800/60 border-gray-800 hover:bg-gray-800"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/10 text-blue-400 whitespace-nowrap">
                              Chương {chapter.chapterNumber}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {chapter.chapterName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => openAdminEditChapter(chapter)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shadow-sm transition-colors"
                          >
                            <FaEdit size={12} />
                            <span>Sửa nội dung</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end pt-2 border-t dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setManagingChaptersNovel(null)}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
