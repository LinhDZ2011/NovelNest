const User = require('../models/User');
const Novel = require('../models/Novel');
const Review = require('../models/Review');
const Post = require('../models/Post');

// Kiểm tra quyền sở hữu truyện (là tác giả của truyện) hoặc có quyền Quản trị viên (Admin)
const checkNovelOwner = async (req, res, next) => {
    try {
        const novelId = req.params.id || req.params.novelId;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(401).json({ msg: "Không tìm thấy người dùng" });
        }
        if (user.role === 'admin') {
            return next();
        }

        const novel = await Novel.findById(novelId).populate('author');
        if (!novel) {
            return res.status(404).json({ msg: "Không tìm thấy truyện" });
        }

        if (!novel.author || novel.author.user.toString() !== user._id.toString()) {
            return res.status(403).json({ msg: "Từ chối truy cập. Bạn không phải là tác giả của truyện này." });
        }

        next();
    } catch (error) {
        console.error("Check novel owner error:", error);
        return res.status(500).json({ msg: "Lỗi máy chủ khi kiểm tra quyền hạn" });
    }
};

// Kiểm tra người dùng có quyền tải lên chương mới cho tác phẩm này hay không
const checkChapterUploadPermission = async (req, res, next) => {
    try {
        const { novelId } = req.params;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(401).json({ msg: "Không tìm thấy người dùng" });
        }
        if (user.role === 'admin') {
            return next();
        }

        const novel = await Novel.findById(novelId).populate('author');
        if (!novel) {
            return res.status(404).json({ msg: "Không tìm thấy truyện" });
        }

        if (!novel.author || novel.author.user.toString() !== user._id.toString()) {
            return res.status(403).json({ msg: "Từ chối truy cập. Bạn không phải là tác giả của truyện này." });
        }

        next();
    } catch (error) {
        console.error("Check chapter upload permission error:", error);
        return res.status(500).json({ msg: "Lỗi máy chủ khi kiểm tra quyền hạn" });
    }
};

// Kiểm tra người dùng có phải chủ sở hữu đánh giá hoặc là Quản trị viên
const checkReviewOwner = async (req, res, next) => {
    try {
        const reviewId = req.params.reviewId || req.params.id;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(401).json({ msg: "Không tìm thấy người dùng" });
        }
        if (user.role === 'admin') {
            return next();
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ msg: "Không tìm thấy đánh giá" });
        }

        if (review.user.toString() !== user._id.toString()) {
            return res.status(403).json({ msg: "Từ chối truy cập. Bạn không phải chủ sở hữu của đánh giá này." });
        }

        next();
    } catch (error) {
        console.error("Check review owner error:", error);
        return res.status(500).json({ msg: "Lỗi máy chủ khi kiểm tra quyền hạn" });
    }
};

// Kiểm tra người dùng có phải tác giả của bài viết diễn đàn hoặc là Quản trị viên
const checkPostOwner = async (req, res, next) => {
    try {
        const postId = req.params.id || req.params.postId;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(401).json({ msg: "Không tìm thấy người dùng" });
        }
        if (user.role === 'admin') {
            return next();
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: "Không tìm thấy bài viết" });
        }

        if (post.user.toString() !== user._id.toString()) {
            return res.status(403).json({ msg: "Từ chối truy cập. Bạn không phải tác giả của bài viết này." });
        }

        next();
    } catch (error) {
        console.error("Check post owner error:", error);
        return res.status(500).json({ msg: "Lỗi máy chủ khi kiểm tra quyền hạn" });
    }
};

module.exports = {
    checkNovelOwner,
    checkChapterUploadPermission,
    checkChapterEditPermission: checkChapterUploadPermission,
    checkReviewOwner,
    checkPostOwner
};
