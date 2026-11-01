import { useState, useContext, useRef } from "react";
import api from "../services/api";
import { FaTimes, FaCloudUploadAlt, FaCropAlt, FaTrashAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeContext from "../context/DarkModeContext";
import ImageCropModal from "./ImageCropModal";

const PostUpload = ({ onSuccess, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [rawImageFile, setRawImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const { isDarkMode } = useContext(DarkModeContext);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRawImageFile(file);
      setNewPost((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      // Tự động mở modal cắt ảnh thủ công để người dùng căn chỉnh giống mạng xã hội
      setIsCropModalOpen(true);
    }
  };

  const handleCropComplete = (croppedFile, croppedUrl) => {
    setNewPost((prev) => ({ ...prev, image: croppedFile }));
    setImagePreview(croppedUrl);
  };

  const handleRemoveImage = () => {
    setRawImageFile(null);
    setNewPost((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    if (newPost.image) {
      formData.append("image", newPost.image);
    }
    try {
      await api.post("/posts", formData);
      setNewPost({ title: "", content: "", image: null });
      setImagePreview(null);
      setRawImageFile(null);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Không thể tạo bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`w-full max-w-2xl ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-900 to-gray-800"
                : "bg-gradient-to-br from-white to-gray-50"
            } p-8 rounded-2xl shadow-2xl transform transition-all overflow-hidden max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-8">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-2"
              >
                <FaCloudUploadAlt className={`text-2xl ${isDarkMode ? "text-blue-400" : "text-blue-800"}`} />
                <h2 className={`text-3xl font-extrabold bg-gradient-to-r ${
                  isDarkMode
                    ? "from-white to-blue-400"
                    : "from-black to-blue-800"
                } bg-clip-text text-transparent`}>
                  Tạo bài viết mới
                </h2>
              </motion.div>
              <button
                onClick={onClose}
                className={`absolute top-0 right-0 p-2 rounded-full transition-all duration-300 ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2"
              >
                <FaTimes className="text-lg" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmitPost} className="space-y-6">
              <div className="group">
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Tiêu đề bài viết
                </label>
                <div className={`relative rounded-xl overflow-hidden ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } shadow-sm`}>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        title: e.target.value,
                      })
                    }
                    className={`w-full p-4 pr-12 outline-none transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-800 text-white placeholder-gray-500"
                        : "bg-white text-gray-900 placeholder-gray-400"
                    } focus:ring-2 focus:ring-blue-500`}
                    placeholder="Nhập tiêu đề bài viết..."
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Nội dung bài viết
                </label>
                <div className={`relative rounded-xl overflow-hidden ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } shadow-sm`}>
                  <textarea
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        content: e.target.value,
                      })
                    }
                    className={`w-full p-4 min-h-[90px] outline-none transition-all duration-300 ${
                      isDarkMode
                        ? "bg-gray-800 text-white placeholder-gray-500"
                        : "bg-white text-gray-900 placeholder-gray-400"
                    } focus:ring-2 focus:ring-blue-500`}
                    placeholder="Chia sẻ suy nghĩ của bạn..."
                    required
                  />
                </div>
              </div>

              {/* VÙNG TẢI LÊN VÀ CẮT XÉN HÌNH ẢNH THỦ CÔNG */}
              <div className="group">
                <label className={`block font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Hình ảnh đính kèm
                </label>

                {!imagePreview ? (
                  <div className={`relative rounded-xl border-2 border-dashed ${
                    isDarkMode ? "border-gray-700 bg-gray-800/40 hover:bg-gray-800/80" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  } p-6 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2 group/upload`}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FaCloudUploadAlt className={`text-4xl ${isDarkMode ? "text-blue-400 group-hover/upload:scale-110" : "text-blue-600 group-hover/upload:scale-110"} transition-transform`} />
                    <span className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Nhấp hoặc kéo thả để tải lên hình ảnh
                    </span>
                    <span className="text-xs text-gray-400">
                      Hỗ trợ JPG, PNG, WEBP • Bạn có thể cắt xén thủ công theo tỉ lệ tùy ý
                    </span>
                  </div>
                ) : (
                  <div className={`relative rounded-2xl overflow-hidden border ${
                    isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"
                  } p-3 flex flex-col sm:flex-row items-center gap-4`}>
                    <div className="relative w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center">
                      <img
                        src={imagePreview}
                        alt="Xem trước ảnh đã cắt"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-2 w-full">
                      <p className="text-xs font-semibold text-green-500 flex items-center gap-1">
                        ✓ Ảnh đã sẵn sàng để đăng
                      </p>
                      <p className="text-xs text-gray-400">
                        Bạn có thể cắt lại khung hình theo ý muốn hoặc chọn hình ảnh khác.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsCropModalOpen(true)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <FaCropAlt /> Cắt lại ảnh
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600/10 hover:bg-red-600/20 text-red-500 dark:text-red-400 border border-red-500/20 flex items-center gap-1.5 transition-colors"
                        >
                          <FaTrashAlt /> Xóa ảnh
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium
                    ${
                      isSubmitting
                        ? "opacity-75 cursor-not-allowed"
                        : "hover:shadow-lg transform hover:-translate-y-0.5"
                    }
                    transition-all duration-300`}
                >
                  {isSubmitting ? "Đang đăng..." : "Đăng bài"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* MODAL CẮT XÉN ẢNH THỦ CÔNG */}
      {isCropModalOpen && rawImageFile && (
        <ImageCropModal
          file={rawImageFile}
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          onCropComplete={handleCropComplete}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default PostUpload;
