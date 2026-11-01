import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeContext from "../context/DarkModeContext";
import AuthContext from "../context/AuthContext";
import PostCard from "./PostCard";
import api from "../services/api";

const UserPosts = ({ posts = [], onPostDeleted }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const { loggedUser } = useContext(AuthContext);

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      if (onPostDeleted) {
        onPostDeleted(postId);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Bài viết thảo luận của bạn ({posts.length})
        </h3>
      </div>

      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center py-16 rounded-2xl border ${
            isDarkMode
              ? "bg-gray-900/60 border-gray-800 text-gray-400"
              : "bg-white border-gray-100 text-gray-500 shadow-sm"
          }`}
        >
          <p className="text-lg">Bạn chưa có bài viết nào trên diễn đàn.</p>
          <p className="text-sm text-gray-400 mt-2">
            Hãy tham gia thảo luận cùng cộng đồng độc giả tại Diễn đàn!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          <AnimatePresence>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={{
                  ...post,
                  user: post.user || loggedUser,
                }}
                currentUserId={loggedUser?._id}
                currentUserRole={loggedUser?.role}
                isDarkMode={isDarkMode}
                onLike={handleLike}
                onDelete={handleDeletePost}
                showCommentsDefault={false}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default UserPosts;
