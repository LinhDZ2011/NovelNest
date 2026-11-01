const Post = require("../models/Post");
const User = require("../models/User");
const { toggleDocumentLike, toggleSubdocumentLike } = require("../utils/likeHelper");

// Tạo bài viết mới
const addPosts = async (req, res) => {
    try {
        const { userId } = req.user;
        const { title, content } = req.body;

        if (!title || !content) {
            return res
                .status(400)
                .json({ msg: "Vui lòng nhập đầy đủ tiêu đề và nội dung" });
        }

        if (!req.file) {
            return res.status(400).json({ msg: "Vui lòng chọn tệp hình ảnh" });
        }

        // Kiểm tra người dùng tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Không tìm thấy người dùng" });
        }

        const post = new Post({
            title,
            content,
            image: {
                url: req.file.path,
                publicId: req.file.filename
            },
            user: userId,
            likes: [],
            comments: [],
        });

        // Lưu bài viết
        await post.save();

        // Thêm tham chiếu bài viết vào mảng posts của người dùng
        if (!user.posts) user.posts = [];
        user.posts.push(post._id);
        await user.save();

        // Nạp thông tin người dùng trước khi gửi phản hồi
        await post.populate("user", "-password");

        return res.status(201).json(post);
    } catch (error) {
        console.error("Add post error:", error);
        if (error.message.includes('image')) {
            return res.status(400).json({ msg: "Định dạng hoặc dung lượng hình ảnh không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể tạo bài viết" });
    }
};

// Lấy tất cả bài viết kèm dữ liệu người dùng và bình luận
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "-password")
            .populate("comments.user", "-password")
            .sort({ createdAt: -1 });

        return res.status(200).json(posts);
    } catch (error) {
        console.error("Get all posts error:", error);
        return res.status(500).json({ msg: "Không thể lấy danh sách bài viết" });
    }
};

// Thêm bình luận vào bài viết
const addCommentToPost = async (req, res) => {
    try {
        const { userId } = req.user;
        const { content } = req.body;
        const { postId } = req.params;

        if (!content) {
            return res.status(400).json({ msg: "Vui lòng nhập nội dung bình luận" });
        }

        // Kiểm tra người dùng tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Không tìm thấy người dùng" });
        }

        // Tìm kiếm bài viết
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ msg: "Không tìm thấy bài viết" });
        }

        // Thêm bình luận vào bài viết
        post.comments.push({
            content,
            user: userId,
            likes: [],
        });

        await post.save();

        // Nạp thông tin người dùng trong bình luận
        await post.populate("comments.user", "-password");

        return res.status(200).json(post);
    } catch (error) {
        console.error("Add comment error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể gửi bình luận" });
    }
};

// Lấy thông tin bài viết cụ thể theo ID
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "-password")
            .populate("comments.user", "-password");

        if (!post) {
            return res.status(404).json({ msg: "Không tìm thấy bài viết" });
        }

        return res.status(200).json(post);
    } catch (error) {
        console.error("Get post by ID error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID bài viết không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể lấy thông tin bài viết" });
    }
};

// Lấy tất cả bài viết của một người dùng cụ thể
const getPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.user;
        const posts = await Post.find({ user: userId })
            .populate("user", "-password")
            .populate("comments.user", "-password")
            .sort({ createdAt: -1 });

        return res.status(200).json(posts);
    } catch (error) {
        console.error("Get posts by user ID error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID người dùng không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể lấy danh sách bài viết" });
    }
};

const togglePostLike = async (req, res) => {
    try {
        const { userId } = req.user;
        const { postId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "Yêu cầu có mã người dùng" });
        }

        const result = await toggleDocumentLike(Post, postId, userId);
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Toggle post like error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể thích bài viết" });
    }
};

// Thích hoặc bỏ thích bình luận
const toggleCommentLike = async (req, res) => {
    try {
        const { userId } = req.body;
        const { postId, commentId } = req.params;

        // Kiểm tra tính hợp lệ của dữ liệu đầu vào
        if (!userId) {
            return res.status(400).json({ msg: "Yêu cầu có mã người dùng" });
        }

        const result = await toggleSubdocumentLike(Post, postId, 'comments', commentId, userId);
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Toggle comment like error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể thích bình luận" });
    }
};

// Xóa bài viết
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ msg: "Không tìm thấy bài viết" });
        }

        // Dọn dẹp tham chiếu trong User.posts
        await User.findByIdAndUpdate(post.user, {
            $pull: { posts: post._id }
        });

        await post.deleteOne();

        return res.status(200).json({ msg: "Xóa bài viết thành công" });
    } catch (error) {
        console.error("Delete post error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID bài viết không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể xóa bài viết" });
    }
};

module.exports = {
    addPosts,
    getAllPosts,
    addCommentToPost,
    getPostById,
    getPostsByUserId,
    togglePostLike,
    toggleCommentLike,
    deletePost
};
