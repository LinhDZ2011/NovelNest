import { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import PostUpload from "../components/PostUpload";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeContext from "../context/DarkModeContext";
import AuthContext from "../context/AuthContext";
import LoadingScreen from "../utils/LoadingScreen";
import Footer from "../utils/Footer";
import PostCard from "../components/PostCard";
import api from "../services/api";

const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useContext(DarkModeContext);
  const { loggedUser } = useContext(AuthContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      let sortedPosts = [...response.data];
      sortedPosts.sort((a, b) => new Date(b.createdAt || b.timeStamp) - new Date(a.createdAt || a.timeStamp));
      setPosts(sortedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleLike = async (postId) => {
    if (!loggedUser?._id) return;
    try {
      const response = await api.post(`/posts/${postId}/like`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async (postId, content) => {
    if (!loggedUser?._id || !content.trim()) return;

    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: content.trim(),
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      );
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <div>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Navbar />
          <div
            className={`min-h-screen pt-24 pb-16 ${
              isDarkMode
                ? "bg-gradient-to-br from-black via-gray-950 to-gray-900 text-white"
                : "bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-900"
            }`}
          >
            <div className="max-w-4xl mx-auto px-4">
              {/* Thanh tạo bài viết mới */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${
                  isDarkMode
                    ? "bg-gray-900/90 border-gray-800"
                    : "bg-white border-gray-200"
                } rounded-2xl shadow-xl p-5 mb-8 backdrop-blur-lg border`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      loggedUser?.userimage ||
                      "https://images.unsplash.com/photo-1511367461989-f85a21fda167"
                    }
                    alt={loggedUser?.name || "Người dùng"}
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30 shadow-md"
                  />
                  <button
                    onClick={() => setShowNewPostForm(true)}
                    className={`flex-1 text-left px-5 py-3 text-sm md:text-base ${
                      isDarkMode
                        ? "bg-gray-800 hover:bg-gray-700/80 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    } rounded-xl transition-all duration-300 transform hover:-translate-y-0.5`}
                  >
                    Chia sẻ suy nghĩ hoặc chủ đề thảo luận của bạn...
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewPostForm(true)}
                    className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Đăng bài</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Danh sách bài viết diễn đàn (Template Method) */}
              <div className="space-y-6">
                <AnimatePresence>
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUserId={loggedUser?._id}
                        currentUserRole={loggedUser?.role}
                        isDarkMode={isDarkMode}
                        onLike={handleLike}
                        onDelete={handleDeletePost}
                        onAddComment={handleAddComment}
                      />
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-gray-500 text-lg">
                        Chưa có bài viết nào trên diễn đàn. Hãy là người đầu tiên mở đầu chủ đề!
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Modal đăng bài */}
            {showNewPostForm && (
              <PostUpload
                onClose={() => setShowNewPostForm(false)}
                onSuccess={() => {
                  fetchPosts();
                  setShowNewPostForm(false);
                }}
              />
            )}
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

export default ForumPage;
