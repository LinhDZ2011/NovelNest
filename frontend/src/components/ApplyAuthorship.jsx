import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaFeatherAlt, FaBookOpen, FaPen, FaLightbulb } from "react-icons/fa";
import DarkModeContext from "../context/DarkModeContext";
import api from "../services/api";

const ApplyAuthorship = ({ onRequest, onClose }) => {
  const [authorFormData, setAuthorFormData] = useState({
    penName: "",
    bio: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDarkMode } = useContext(DarkModeContext);

  const handleAuthorFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!authorFormData.penName.trim()) {
      setError("Vui lòng nhập bút danh mong muốn.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/authors/request', {
        penName: authorFormData.penName.trim(),
        bio: authorFormData.bio.trim(),
        reason: authorFormData.reason.trim(),
      });
      if (onRequest) {
        onRequest();
      }
      onClose();
    } catch (err) {
      console.error("Error requesting authorship:", err);
      const msg = err.response?.data?.msg || "Không thể gửi yêu cầu đăng ký làm tác giả";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`max-w-lg w-full ${
            isDarkMode
              ? "bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800"
              : "bg-white border-gray-100"
          } rounded-2xl shadow-2xl overflow-hidden border my-8`}
        >
          {/* Header */}
          <div className={`relative p-6 pb-4 border-b ${isDarkMode ? "border-gray-800" : "border-gray-100"}`}>
            <button
              onClick={onClose}
              className={`absolute right-6 top-6 p-2 rounded-full ${
                isDarkMode
                  ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } transition-all`}
            >
              <FaTimes />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <FaFeatherAlt className="text-xl" />
              </div>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>
                Đơn xin cấp quyền Tác giả
              </h2>
            </div>
            <p className={`mt-2 text-xs md:text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              Gửi đơn đăng ký tới Quản trị viên để được cấp quyền đăng tải và sáng tác truyện trên Novel Nest.
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-6 text-sm ${
                  isDarkMode
                    ? "bg-red-900/30 text-red-300 border border-red-800"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleAuthorFormSubmit} className="space-y-4">
              <div>
                <label className={`block font-medium mb-1.5 text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <div className="flex items-center space-x-2">
                    <FaPen className="text-xs text-purple-400" />
                    <span>Bút danh sáng tác <span className="text-red-500">*</span></span>
                  </div>
                </label>
                <input
                  type="text"
                  value={authorFormData.penName}
                  onChange={(e) =>
                    setAuthorFormData({
                      ...authorFormData,
                      penName: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                    isDarkMode
                      ? "bg-gray-800/80 border-gray-700 text-white focus:border-purple-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500"
                  }`}
                  placeholder="Ví dụ: Tiêu Đỉnh, Lão Trư..."
                  required
                />
              </div>

              <div>
                <label className={`block font-medium mb-1.5 text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <div className="flex items-center space-x-2">
                    <FaBookOpen className="text-xs text-purple-400" />
                    <span>Giới thiệu bản thân (Bio)</span>
                  </div>
                </label>
                <textarea
                  value={authorFormData.bio}
                  onChange={(e) =>
                    setAuthorFormData({ ...authorFormData, bio: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                    isDarkMode
                      ? "bg-gray-800/80 border-gray-700 text-white focus:border-purple-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500"
                  }`}
                  placeholder="Đôi nét về phong cách và niềm đam mê văn học của bạn..."
                />
              </div>

              <div>
                <label className={`block font-medium mb-1.5 text-sm ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  <div className="flex items-center space-x-2">
                    <FaLightbulb className="text-xs text-purple-400" />
                    <span>Kế hoạch sáng tác / Dự án tiêu biểu</span>
                  </div>
                </label>
                <textarea
                  value={authorFormData.reason}
                  onChange={(e) =>
                    setAuthorFormData({ ...authorFormData, reason: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                    isDarkMode
                      ? "bg-gray-800/80 border-gray-700 text-white focus:border-purple-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500"
                  }`}
                  placeholder="Thể loại truyện dự kiến đăng, kinh nghiệm hoặc dự án bạn muốn chia sẻ..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-600 hover:bg-gray-100"
                  } transition-all`}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Đang gửi đơn..." : "Gửi đơn đăng ký"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplyAuthorship;
