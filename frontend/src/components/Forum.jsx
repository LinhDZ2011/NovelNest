import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeContext from "../context/DarkModeContext";
import { FaComments, FaHeart, FaUser, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

function Forum() {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      const sortedPosts = response.data
        .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
        .slice(0, 3);
      setPosts(sortedPosts);
    } catch (err) {
      setError("Không thể tải danh sách bài viết");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [posts]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? posts.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === posts.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-[300px] md:h-[400px] ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      } rounded-xl`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-10 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <p>{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`text-center py-10 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        <p>Hiện chưa có bài viết nào</p>
      </div>
    );
  }

  const currentPost = posts[currentIndex];
  const postImageUrl = currentPost?.image?.url;

  return (
    <div className={`relative overflow-hidden rounded-xl ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    } transition-colors duration-300`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="group relative h-[300px] md:h-[400px] rounded-xl overflow-hidden cursor-pointer"
          onClick={() => navigate("/forum")}
        >
          {/* Background Image: Làm mờ hình ảnh đính kèm bài viết giống WeeklyBest (Ảnh 2) */}
          <div className="absolute inset-0 overflow-hidden">
            {postImageUrl ? (
              <img
                src={postImageUrl}
                alt={currentPost.title || "Hình nền bài viết"}
                className="w-full h-full object-cover filter blur-md scale-110 transform transition-transform duration-700 group-hover:scale-115"
              />
            ) : (
              <div
                className={`w-full h-full ${
                  isDarkMode
                    ? "bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950"
                    : "bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100"
                }`}
              />
            )}
            {/* Lớp phủ gradient làm mờ để chữ luôn sắc nét và dễ đọc */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50" />
          </div>

          {/* Nội dung bài viết */}
          <div className="relative h-full flex items-center p-6 md:p-10 z-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full">
              {/* Ảnh thu nhỏ đại diện (Thumbnail card) nếu bài viết có ảnh đính kèm */}
              {postImageUrl && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="hidden sm:block flex-shrink-0 w-32 h-32 md:w-44 md:h-52 rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-black/40"
                >
                  <img
                    src={postImageUrl}
                    alt={currentPost.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              )}

              <div className="flex flex-col gap-3 md:gap-4 w-full md:max-w-xl text-white">
                {/* Thông tin tác giả */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
                    <FaComments className="text-lg md:text-xl" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-200">
                    <FaUser className="text-gray-400" />
                    <span>bởi {currentPost.user?.name || "Ẩn danh"}</span>
                  </div>
                </motion.div>

                {/* Tiêu đề & Nội dung */}
                <div>
                  <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-3xl font-extrabold mb-2 md:mb-3 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent line-clamp-1"
                  >
                    {currentPost.title}
                  </motion.h3>

                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm md:text-base text-gray-200 line-clamp-2 md:line-clamp-3 leading-relaxed mb-4"
                  >
                    {currentPost.content}
                  </motion.p>
                </div>

                {/* Thống kê tương tác */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-6 text-sm text-gray-300"
                >
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-red-500" />
                    <span>{currentPost.likes?.length || 0} lượt thích</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaComments className="text-blue-400" />
                    <span>{currentPost.comments?.length || 0} bình luận</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Navigation Controls: Tự động ẩn khi không hover, hiện lên khi di chuột vào (group-hover) */}
          <div className="hidden md:flex absolute inset-y-0 left-0 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              aria-label="Bài viết trước"
              className="p-3 m-4 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-xl border border-white/20 active:scale-95"
            >
              <FaChevronLeft size={20} />
            </button>
          </div>
          <div className="hidden md:flex absolute inset-y-0 right-0 items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Bài viết tiếp theo"
              className="p-3 m-4 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-xl border border-white/20 active:scale-95"
            >
              <FaChevronRight size={20} />
            </button>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {posts.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                aria-label={`Chuyển đến bài viết ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'w-6 bg-white shadow-md'
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Forum;
