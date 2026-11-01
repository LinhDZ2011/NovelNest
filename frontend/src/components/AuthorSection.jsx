import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaStar, FaUsers, FaEdit, FaTrashAlt, FaTimes, FaCamera, FaTags, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeContext from "../context/DarkModeContext";
import api from "../services/api";

const AuthorSection = ({ novelsData = [], onUploadNovel, onNovelUpdated, onNovelDeleted }) => {
  const [showNovelForm, setShowNovelForm] = useState(false);
  const [editingNovel, setEditingNovel] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGenres, setEditGenres] = useState([]);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [genresList, setGenresList] = useState([]);

  const [deletingNovel, setDeletingNovel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get("/genres");
        if (Array.isArray(res.data)) {
          setGenresList(res.data);
        }
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  const handleNovelClick = (novelId) => {
    navigate(`/novel-analytics/${novelId}`);
  };

  const openEditModal = (e, novel) => {
    e.stopPropagation();
    setEditingNovel(novel);
    setEditTitle(novel.title || "");
    setEditDescription(novel.description || "");
    const initialGenres = (novel.genres || []).map((g) => (g && g._id ? g._id : g));
    setEditGenres(initialGenres);
    setEditCoverFile(null);
    setEditCoverPreview(novel.coverPhoto?.url || null);
  };

  const toggleEditGenre = (genreId) => {
    setEditGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCoverFile(file);
      setEditCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingNovel || !editTitle.trim()) return;

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("description", editDescription.trim());
      formData.append("genres", JSON.stringify(editGenres));
      if (editCoverFile) {
        formData.append("coverPhoto", editCoverFile);
      }

      const response = await api.put(`/novels/${editingNovel._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onNovelUpdated) {
        onNovelUpdated(response.data);
      }
      setEditingNovel(null);
    } catch (error) {
      console.error("Error updating novel:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openDeleteModal = (e, novel) => {
    e.stopPropagation();
    setDeletingNovel(novel);
  };

  const handleConfirmDelete = async () => {
    if (!deletingNovel) return;
    setIsDeleting(true);
    try {
      await api.delete(`/novels/${deletingNovel._id}`);
      if (onNovelDeleted) {
        onNovelDeleted(deletingNovel._id);
      }
      setDeletingNovel(null);
    } catch (error) {
      console.error("Error deleting novel:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-pink-500 bg-clip-text text-transparent">
          Tác phẩm của bạn ({novelsData.length})
        </h3>
        <button
          onClick={() => setShowNovelForm(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-amber-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          + Đăng truyện mới
        </button>
      </div>

      {novelsData.length === 0 ? (
        <div
          className={`text-center py-16 rounded-2xl border ${
            isDarkMode
              ? "bg-gray-900/60 border-gray-800 text-gray-400"
              : "bg-white border-gray-100 text-gray-500 shadow-sm"
          }`}
        >
          <FaBook className="mx-auto text-4xl mb-4 text-gray-400" />
          <p className="text-lg">
            Bắt đầu hành trình sáng tác bằng việc đăng tải tác phẩm đầu tiên của bạn!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {novelsData.map((novel) => (
            <div
              key={novel._id}
              onClick={() => handleNovelClick(novel._id)}
              className={`group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border flex flex-col cursor-pointer ${
                isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
              }`}
            >
              {/* Image Frame */}
              <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={novel?.coverPhoto?.url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f"}
                  alt={novel.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                />

                {/* Genre badges on top left */}
                {novel.genres && novel.genres.length > 0 && (
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[70%] z-10">
                    {novel.genres.slice(0, 2).map((g) => (
                      <span
                        key={g._id || g.slug}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-md backdrop-blur-sm"
                        style={{ backgroundColor: g.color || "#8B5CF6" }}
                      >
                        {g.name}
                      </span>
                    ))}
                    {novel.genres.length > 2 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/60 text-white shadow-md backdrop-blur-sm">
                        +{novel.genres.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Buttons Overlay (Sửa tiểu sử & Xóa truyện) */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <button
                    onClick={(e) => openEditModal(e, novel)}
                    title="Chỉnh sửa tiểu sử truyện / Thể loại / Thông tin tác phẩm"
                    className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-110"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={(e) => openDeleteModal(e, novel)}
                    title="Xóa truyện"
                    className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform hover:scale-110"
                  >
                    <FaTrashAlt size={14} />
                  </button>
                </div>
              </div>

              {/* Content info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors">
                    {novel.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-xs mb-4 line-clamp-3 leading-relaxed">
                    {novel.description || "Chưa có tiểu sử truyện."}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-blue-500">
                      <FaUsers /> {novel.reviews?.length || 0}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500">
                      <FaStar /> {novel.likes?.length || 0}
                    </span>
                  </div>
                  <span>{formatDate(novel.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL SỬA TIỂU SỬ TRUYỆN / THỂ LOẠI / THÔNG TIN */}
      <AnimatePresence>
        {editingNovel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingNovel(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-xl w-full p-6 md:p-8 rounded-2xl shadow-2xl border ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100 text-gray-900"
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                    <FaEdit size={20} />
                  </div>
                  <h3 className="text-xl font-bold">Chỉnh sửa thông tin tác phẩm</h3>
                </div>
                <button
                  onClick={() => setEditingNovel(null)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-5">
                {/* Ảnh bìa */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Ảnh bìa tác phẩm</label>
                  <div className="flex items-center gap-4">
                    {editCoverPreview && (
                      <img
                        src={editCoverPreview}
                        alt="Preview"
                        className="w-20 h-28 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow"
                      />
                    )}
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors">
                        <FaCamera />
                        <span>Thay đổi ảnh bìa</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP</p>
                    </div>
                  </div>
                </div>

                {/* Tên truyện */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Tên tác phẩm</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500"
                    }`}
                  />
                </div>

                {/* Cập nhật Thể loại */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <FaTags className="text-purple-400" />
                      <span>Thể loại tác phẩm</span>
                    </label>
                    <span className="text-xs text-purple-400 font-medium">
                      Đã chọn: {editGenres.length} thể loại
                    </span>
                  </div>
                  <div
                    className={`p-3 rounded-xl border max-h-36 overflow-y-auto ${
                      isDarkMode ? "bg-gray-800/40 border-gray-700" : "bg-gray-50 border-gray-200"
                    } flex flex-wrap gap-2`}
                  >
                    {genresList.map((genre) => {
                      const isSelected = editGenres.includes(genre._id);
                      return (
                        <button
                          type="button"
                          key={genre._id}
                          onClick={() => toggleEditGenre(genre._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                            isSelected
                              ? "text-white shadow-md scale-105"
                              : isDarkMode
                              ? "bg-gray-700/60 text-gray-300 hover:bg-gray-700"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }`}
                          style={isSelected ? { backgroundColor: genre.color || "#8B5CF6" } : {}}
                        >
                          {isSelected && <FaCheck size={10} />}
                          <span>{genre.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tiểu sử truyện */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Tiểu sử truyện
                  </label>
                  <textarea
                    rows={5}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Nhập tiểu sử truyện, tóm tắt diễn biến tác phẩm..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none leading-relaxed transition-all ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500"
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setEditingNovel(null)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL XÁC NHẬN NGUY HIỂM XÓA TRUYỆN */}
      <AnimatePresence>
        {deletingNovel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`max-w-md w-full p-6 rounded-2xl shadow-2xl border ${
                isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-100 text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <FaTrashAlt size={24} />
                <h4 className="text-xl font-bold">Xác nhận xóa vĩnh viễn</h4>
              </div>
              <p className="text-sm leading-relaxed mb-4 text-gray-600 dark:text-gray-300">
                Bạn có chắc chắn muốn xóa tác phẩm <strong className="text-red-500">&quot;{deletingNovel.title}&quot;</strong>?
              </p>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 mb-6">
                ⚠️ Mọi chương truyện và đánh giá liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục.
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeletingNovel(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL UPLOAD NOVEL */}
      {showNovelForm && onUploadNovel && (
        <div
          onClick={() => setShowNovelForm(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          {onUploadNovel(showNovelForm, () => setShowNovelForm(false))}
        </div>
      )}
    </div>
  );
};

export default AuthorSection;
