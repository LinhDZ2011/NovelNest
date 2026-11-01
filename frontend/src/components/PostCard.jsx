import { useState } from "react";
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaTimes, FaExpand } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PostCard Component (Template Method Pattern)
 * Định nghĩa bộ khung chuẩn hóa cho hiển thị bài viết trên cả Diễn đàn và Profile:
 * 1. Header: Avatar -> Tên + Ngày tháng -> Nút Xóa bài (nếu có quyền)
 * 2. Thân bài viết: Tiêu đề -> Nội dung văn bản
 * 3. Khung hình ảnh đính kèm: Auto-fit responsive frame (không vỡ, không cắt xén)
 * 4. Chân tương tác: Lượt thích, Bình luận & Khung thảo luận
 */
const PostCard = ({
  post,
  currentUserId,
  currentUserRole,
  isDarkMode,
  onLike,
  onDelete,
  onAddComment,
  showCommentsDefault = false,
}) => {
  const [showComments, setShowComments] = useState(showCommentsDefault);
  const [commentText, setCommentText] = useState("");
  const [showLightbox, setShowLightbox] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = Boolean(
    currentUserId &&
    (currentUserRole === "admin" ||
      post?.user?._id === currentUserId ||
      post?.user === currentUserId)
  );

  const isLiked = Boolean(
    currentUserId &&
    Array.isArray(post?.likes) &&
    post.likes.some((id) => (typeof id === "object" ? id._id === currentUserId : id === currentUserId))
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (onAddComment) {
      onAddComment(post._id, commentText.trim());
      setCommentText("");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(post._id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Delete post error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`w-full rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden ${
          isDarkMode
            ? "bg-gray-900/90 border-gray-800 text-white"
            : "bg-white border-gray-200/80 text-gray-900"
        }`}
      >
        <div className="p-5 md:p-6">
          {/* 1. HEADER BÀI VIẾT */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={
                    post?.user?.userimage ||
                    "https://images.unsplash.com/photo-1511367461989-f85a21fda167"
                  }
                  alt={post?.user?.name || "Người dùng"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/40 shadow-md"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-base md:text-lg truncate">
                    {post?.user?.name || "Thành viên ẩn danh"}
                  </span>
                  {post?.user?.role === "admin" && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      🛡️ Admin
                    </span>
                  )}
                  {post?.user?.role === "author" && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                      ⭐ Tác giả
                    </span>
                  )}
                  {(!post?.user?.role || post?.user?.role === "user") && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      📖 Độc giả
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  📅 {formatDate(post?.createdAt || post?.timeStamp)}
                </p>
              </div>
            </div>

            {/* Nút Xóa bài viết */}
            {canDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(true)}
                title="Xóa bài viết này"
                className="p-2 rounded-lg text-red-500 hover:text-white hover:bg-red-500/90 transition-colors flex items-center justify-center"
              >
                <FaTrash size={15} />
              </motion.button>
            )}
          </div>

          {/* 2. THÂN BÀI VIẾT (TIÊU ĐỀ & NỘI DUNG) */}
          <div className="mb-4">
            {post?.title && (
              <h3 className="text-lg md:text-xl font-bold mb-2 leading-snug">
                {post.title}
              </h3>
            )}
            <p
              className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              {post?.content}
            </p>
          </div>

          {/* 3. HÌNH ẢNH ĐÍNH KÈM (AUTO-FIT RESPONSIVE FRAME) */}
          {post?.image?.url && (
            <div className="relative group w-full my-4 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center max-h-[380px] md:max-h-[500px]">
              <img
                src={post.image.url}
                alt={post.title || "Hình ảnh đính kèm"}
                onClick={() => setShowLightbox(true)}
                className="max-w-full max-h-[380px] md:max-h-[500px] w-auto h-auto object-contain rounded-xl cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <button
                onClick={() => setShowLightbox(true)}
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80"
                title="Phóng to ảnh"
              >
                <FaExpand size={14} />
              </button>
            </div>
          )}

          {/* 4. CHÂN BÀI VIẾT (TƯƠNG TÁC) */}
          <div
            className={`flex items-center justify-between pt-3 mt-4 border-t ${
              isDarkMode ? "border-gray-800" : "border-gray-100"
            }`}
          >
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLike && onLike(post._id)}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
              >
                {isLiked ? (
                  <FaHeart className="text-red-500 text-lg" />
                ) : (
                  <FaRegHeart
                    className={`text-lg ${
                      isDarkMode
                        ? "text-gray-400 hover:text-red-400"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                  />
                )}
                <span className={isLiked ? "text-red-500 font-semibold" : ""}>
                  {post?.likes?.length || 0}
                </span>
              </motion.button>

              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  showComments
                    ? "text-blue-500"
                    : isDarkMode
                    ? "text-gray-400 hover:text-blue-400"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <FaComment className="text-base" />
                <span>{post?.comments?.length || 0} bình luận</span>
              </button>
            </div>
          </div>

          {/* PHẦN BÌNH LUẬN (KHI EXPANDED) */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-800 space-y-3"
              >
                {/* Form nhập bình luận */}
                {currentUserId && onAddComment && (
                  <form onSubmit={handleCommentSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Viết bình luận của bạn..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className={`flex-1 px-4 py-2 text-sm rounded-xl border outline-none transition-all ${
                        isDarkMode
                          ? "bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      Gửi
                    </button>
                  </form>
                )}

                {/* Danh sách bình luận */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {post?.comments && post.comments.length > 0 ? (
                    post.comments.map((comment, idx) => (
                      <div
                        key={comment._id || idx}
                        className={`p-3 rounded-xl text-sm ${
                          isDarkMode ? "bg-gray-800/60" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={
                              comment?.user?.userimage ||
                              "https://images.unsplash.com/photo-1511367461989-f85a21fda167"
                            }
                            alt={comment?.user?.name || "Người dùng"}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-semibold text-xs">
                            {comment?.user?.name || "Thành viên"}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {formatDate(comment?.createdAt)}
                          </span>
                        </div>
                        <p
                          className={`pl-8 whitespace-pre-wrap ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {comment.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-2">
                      Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLightbox(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <FaTimes size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={post.image.url}
              alt={post.title}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL XÁC NHẬN XÓA BÀI VIẾT */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl shadow-2xl border ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100 text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <FaTrash size={24} />
                <h4 className="text-xl font-bold">Xác nhận xóa bài viết</h4>
              </div>
              <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                Bạn có chắc chắn muốn xóa bài viết này không? Bài viết và tất cả bình luận sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PostCard;
