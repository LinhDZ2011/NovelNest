import { useState, useEffect, useContext, useCallback } from "react";
import Navbar from "../components/Navbar";
import ApplyAuthorship from "../components/ApplyAuthorship";
import UploadNovel from "../components/UploadNovel";
import UserPosts from "../components/UserPosts";
import AuthorSection from "../components/AuthorSection";
import LikedNovels from "../components/LikedNovels";
import {
  FaBook,
  FaComments,
  FaHeart,
  FaUserEdit,
  FaCamera,
  FaKey,
  FaTimes,
  FaFeatherAlt,
  FaCheck,
  FaExclamationCircle,
  FaClock,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeContext from "../context/DarkModeContext";
import AuthContext from "../context/AuthContext";
import LoadingScreen from "../utils/LoadingScreen";
import Footer from "../utils/Footer";
import api from "../services/api";

const fetchAuthorData = async () => {
  try {
    const response = await api.get('/authors/author-dashboard');
    return response.data;
  } catch (error) {
    console.error("Error fetching author data:", error);
    return null;
  }
};

const fetchUserPosts = async () => {
  try {
    const response = await api.get('/posts/user/user-posts');
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

const fetchNovelData = async (novel) => {
  try {
    const response = await api.get(`/novels/${novel._id || novel}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching novel:`, error);
    return null;
  }
};

const fetchUserLikedNovels = async () => {
  try {
    const response = await api.get('/users/liked-novels');
    return response.data;
  } catch (error) {
    console.error("Error fetching liked novels:", error);
    return [];
  }
};

const fetchMyAuthorRequest = async () => {
  try {
    const response = await api.get('/authors/my-request');
    return response.data;
  } catch (error) {
    console.error("Error fetching my author request:", error);
    return null;
  }
};

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [authorRequest, setAuthorRequest] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedNovels, setLikedNovels] = useState([]);
  const [novelsData, setNovelsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [toastMessage, setToastMessage] = useState("");

  // Modal chỉnh sửa tên hiển thị
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Modal đổi mật khẩu tài khoản
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { isDarkMode } = useContext(DarkModeContext);
  const { loggedUser, update } = useContext(AuthContext);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      if (loggedUser && Object.keys(loggedUser).length > 0) {
        setUserData(loggedUser);
        setNewName(loggedUser.name || "");

        const [userPosts, userLiked, myReq] = await Promise.all([
          fetchUserPosts(),
          fetchUserLikedNovels(),
          fetchMyAuthorRequest(),
        ]);

        setPosts(userPosts);
        setLikedNovels(userLiked);
        setAuthorRequest(myReq);

        if (loggedUser.role === "author" || loggedUser.role === "admin") {
          const author = await fetchAuthorData();
          if (author) {
            setAuthorData(author);
            if (author.novels && author.novels.length > 0) {
              const novelPromises = author.novels.map((novel) => fetchNovelData(novel));
              const novels = await Promise.all(novelPromises);
              setNovelsData(novels.filter((n) => n !== null));
            }
          }
        }
      }
    } catch (err) {
      console.error("Dashboard load data error:", err);
    }
  }, [loggedUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // --- HÀNH ĐỘNG: TẢI LÊN ẢNH ĐẠI DIỆN ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.put("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUserData((prev) => ({ ...prev, userimage: response.data.userimage }));
      update();
      showToast("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      console.error("Error updating avatar:", err);
      showToast("Lỗi khi tải ảnh đại diện.");
    }
  };

  // --- HÀNH ĐỘNG: CẬP NHẬT TÊN HIỂN THỊ ---
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim().length < 3) {
      showToast("Tên hiển thị phải có ít nhất 3 ký tự");
      return;
    }

    try {
      setIsUpdatingName(true);
      await api.put("/users/profile", { name: newName.trim() });
      setUserData((prev) => ({ ...prev, name: newName.trim() }));
      setShowEditNameModal(false);
      update();
      showToast("Đã đổi tên hiển thị thành công!");
    } catch (err) {
      console.error("Error updating name:", err);
      showToast("Lỗi khi cập nhật tên");
    } finally {
      setIsUpdatingName(false);
    }
  };

  // --- HÀNH ĐỘNG: ĐỔI MẬT KHẨU TÀI KHOẢN ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (userData?.authProvider === "google") {
      setPasswordError("Tài khoản Google không thể thay đổi mật khẩu tại đây.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu mới không trùng khớp.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.put("/users/change-password", {
        currentPassword,
        newPassword,
      });

      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Đổi mật khẩu thành công!");
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi khi đổi mật khẩu";
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // --- HÀM GỌI LẠI (CALLBACK): GỬI ĐƠN TÁC GIẢ ---
  const handleAuthorshipSubmitted = async () => {
    showToast("Đã gửi đơn đăng ký thành công! Vui lòng chờ Admin duyệt.");
    const myReq = await fetchMyAuthorRequest();
    setAuthorRequest(myReq);
    update();
  };

  // --- HÀM GỌI LẠI (CALLBACK): CẬP NHẬT & XÓA TRUYỆN ---
  const handleNovelUpdated = (updatedNovel) => {
    setNovelsData((prev) =>
      prev.map((n) => (n._id === updatedNovel._id ? updatedNovel : n))
    );
    showToast("Cập nhật truyện thành công!");
  };

  const handleNovelDeleted = (deletedId) => {
    setNovelsData((prev) => prev.filter((n) => n._id !== deletedId));
    showToast("Đã xóa truyện thành công!");
  };

  // --- HÀM GỌI LẠI (CALLBACK): XÓA BÀI VIẾT DIỄN ĐÀN ---
  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    showToast("Đã xóa bài viết thành công!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-black via-gray-950 to-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 text-gray-900"
      }`}
    >
      <Navbar />

      {/* TOAST MESSAGE */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 px-5 py-3 rounded-xl bg-purple-600 text-white text-sm font-semibold shadow-2xl flex items-center gap-2 border border-purple-400"
          >
            <FaCheck /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 space-y-8">
          {/* [1] PROFILE HERO BANNER */}
          <div
            className={`rounded-3xl overflow-hidden border shadow-xl backdrop-blur-xl transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-900/80 border-gray-800"
                : "bg-white/90 border-gray-100"
            }`}
          >
            {/* Banner Cover Artwork */}
            <div className="h-44 md:h-56 w-full bg-gradient-to-r from-purple-800 via-indigo-900 to-blue-900 relative">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Profile Info Row */}
            <div className="px-6 md:px-10 pb-8 relative -mt-16 md:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                {/* Avatar with Camera Icon */}
                <div className="relative group">
                  <img
                    src={
                      userData?.userimage ||
                      "https://images.unsplash.com/photo-1511367461989-f85a21fda167"
                    }
                    alt={userData?.name}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-2xl bg-white"
                  />
                  <label
                    title="Thay đổi ảnh đại diện"
                    className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg cursor-pointer transform hover:scale-110 transition-all border-2 border-white dark:border-gray-900"
                  >
                    <FaCamera size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Name & Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      {userData?.name}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        userData?.role === "admin"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : userData?.role === "author"
                          ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {userData?.role === "admin"
                        ? "🛡️ Quản trị viên"
                        : userData?.role === "author"
                        ? "⭐ Tác giả"
                        : "📖 Độc giả"}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {userData?.email} • Tham gia từ {formatDate(userData?.createdAt)}
                  </p>
                </div>
              </div>

              {/* Action Buttons on Banner */}
              <div className="flex items-center justify-center sm:justify-end gap-3 flex-wrap">
                <button
                  onClick={() => setShowEditNameModal(true)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border flex items-center gap-2 ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
                  }`}
                >
                  <FaUserEdit />
                  <span>Sửa tên</span>
                </button>

                <button
                  onClick={() => setShowPasswordModal(true)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border flex items-center gap-2 ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700"
                  }`}
                >
                  <FaKey />
                  <span>Đổi mật khẩu</span>
                </button>

                {/* Nút Đăng ký tác giả (nếu role là 'user' và chưa có đơn pending) */}
                {userData?.role === "user" && (!authorRequest || authorRequest.status === "rejected") && (
                  <button
                    onClick={() => setShowAuthorForm(true)}
                    className="px-5 py-2 rounded-xl text-xs md:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <FaFeatherAlt />
                    <span>{authorRequest?.status === "rejected" ? "Gửi lại đơn tác giả" : "Đăng ký làm Tác giả"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Author Request Status Banner */}
            {userData?.role === "user" && authorRequest && (
              <div className="px-6 md:px-10 pb-6">
                {authorRequest.status === "pending" && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-3">
                    <FaClock size={20} className="flex-shrink-0" />
                    <div className="text-xs md:text-sm">
                      <p className="font-bold">Đơn xin làm tác giả đang chờ Quản trị viên duyệt ⏳</p>
                      <p className="text-gray-400 mt-0.5">
                        Bút danh đăng ký: <strong>{authorRequest.penName}</strong>. Bạn sẽ nhận được quyền sáng tác ngay khi đơn được chấp thuận.
                      </p>
                    </div>
                  </div>
                )}

                {authorRequest.status === "rejected" && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <FaExclamationCircle size={20} className="flex-shrink-0" />
                      <div className="text-xs md:text-sm">
                        <p className="font-bold">Đơn tác giả của bạn đã bị từ chối ❌</p>
                        {authorRequest.adminNote && (
                          <p className="text-gray-300 mt-0.5">Lý do từ Admin: &quot;{authorRequest.adminNote}&quot;</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAuthorForm(true)}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow"
                    >
                      Gửi lại đơn
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* [2] QUICK STAT METRICS (THẺ THỐNG KÊ NHANH) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div
              className={`p-6 rounded-2xl border transition-all ${
                isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Truyện sáng tác
                </span>
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <FaBook size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold">
                {userData?.role === "author" || userData?.role === "admin" ? novelsData.length : 0}
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl border transition-all ${
                isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Bài viết thảo luận
                </span>
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                  <FaComments size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold">{posts.length}</p>
            </div>

            <div
              className={`p-6 rounded-2xl border transition-all ${
                isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Truyện yêu thích
                </span>
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400">
                  <FaHeart size={18} />
                </div>
              </div>
              <p className="text-3xl font-extrabold">{likedNovels.length}</p>
            </div>

            <div
              className={`p-6 rounded-2xl border transition-all ${
                isDarkMode ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Cấp độ vai trò
                </span>
                <div className="p-2.5 rounded-xl bg-green-500/10 text-green-400">
                  <FaUserEdit size={18} />
                </div>
              </div>
              <p className="text-xl font-bold">
                {userData?.role === "admin"
                  ? "Quản trị viên"
                  : userData?.role === "author"
                  ? "Tác giả"
                  : "Độc giả"}
              </p>
            </div>
          </div>

          {/* [3] TABBED CONTENT WORKSPACE */}
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "posts"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : isDarkMode
                    ? "bg-gray-900 text-gray-400 hover:text-white"
                    : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                }`}
              >
                Bài viết của tôi ({posts.length})
              </button>

              {(userData?.role === "author" || userData?.role === "admin") && (
                <button
                  onClick={() => setActiveTab("novels")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "novels"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : isDarkMode
                      ? "bg-gray-900 text-gray-400 hover:text-white"
                      : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                  }`}
                >
                  Truyện của bạn ({novelsData.length})
                </button>
              )}

              <button
                onClick={() => setActiveTab("liked")}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "liked"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : isDarkMode
                    ? "bg-gray-900 text-gray-400 hover:text-white"
                    : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
                }`}
              >
                Truyện đã thích ({likedNovels.length})
              </button>
            </div>

            {/* TAB CONTENT: POSTS */}
            {activeTab === "posts" && (
              <UserPosts posts={posts} onPostDeleted={handlePostDeleted} />
            )}

            {/* TAB CONTENT: NOVELS (AUTHOR / ADMIN) */}
            {activeTab === "novels" && (
              <AuthorSection
                authorData={authorData}
                novelsData={novelsData}
                onNovelUpdated={handleNovelUpdated}
                onNovelDeleted={handleNovelDeleted}
                onUploadNovel={(show, onClose) => (
                  <UploadNovel
                    authorData={authorData}
                    onNovelCreated={(newNovel) => {
                      setNovelsData([...novelsData, newNovel]);
                      onClose();
                    }}
                    onClose={onClose}
                  />
                )}
              />
            )}

            {/* TAB CONTENT: LIKED NOVELS */}
            {activeTab === "liked" && <LikedNovels likedNovels={likedNovels} />}
          </div>
        </div>
      )}

      {/* MODAL SỬA TÊN HIỂN THỊ */}
      <AnimatePresence>
        {showEditNameModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold">Chỉnh sửa tên hiển thị</h4>
                <button
                  onClick={() => setShowEditNameModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSaveName} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-500">
                    Tên hiển thị mới (ít nhất 3 ký tự)
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditNameModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingName}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUpdatingName ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl border shadow-2xl ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <FaKey className="text-purple-500" />
                  <span>Đổi mật khẩu tài khoản</span>
                </h4>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Chặn đối với tài khoản Google */}
              {userData?.authProvider === "google" ? (
                <div className="py-4 space-y-4">
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 leading-relaxed">
                    ℹ️ Bạn đang đăng nhập bằng tài khoản Google. Mật khẩu được bảo vệ an toàn bởi Google và không thể thay đổi tại đây.
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowPasswordModal(false)}
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Đã hiểu
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-500">
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-500">
                      Mật khẩu mới (tối thiểu 6 ký tự)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-500">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none ${
                        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isChangingPassword ? "Đang lưu..." : "Xác nhận đổi"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORM NỘP ĐƠN ĐĂNG KÝ TÁC GIẢ */}
      {showAuthorForm && (
        <ApplyAuthorship
          onRequest={handleAuthorshipSubmitted}
          onClose={() => setShowAuthorForm(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
