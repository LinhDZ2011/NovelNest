const Review = require("../models/Review");
const Novel = require("../models/Novel");
const User = require("../models/User");
const { toggleDocumentLike, toggleSubdocumentLike } = require("../utils/likeHelper");

// Hàm trợ giúp nội bộ để populate dữ liệu đánh giá
const populateReviewQuery = (query) => {
    return query
        .populate("user", "-password")
        .populate({
            path: "replies.user",
            select: "-password",
        });
};

// Hàm nội bộ lấy tất cả đánh giá của một tác phẩm
const fetchReviewsForNovel = async (novelId) => {
    return populateReviewQuery(Review.find({ novel: novelId })).sort({ createdAt: -1 });
};

// Thêm mới một bài đánh giá cho tác phẩm
const addReview = async (req, res) => {
    try {
        const { userId } = req.user;
        const { reviewTitle, reviewContent } = req.body;
        const novelId = req.params.novelId;

        // Kiểm tra các trường bắt buộc
        if (!reviewTitle || !reviewContent) {
            return res
                .status(400)
                .json({ msg: "Vui lòng nhập đầy đủ tiêu đề và nội dung đánh giá" });
        }

        // Kiểm tra người dùng tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Không tìm thấy người dùng" });
        }

        // Kiểm tra truyện tồn tại
        const novel = await Novel.findById(novelId);
        if (!novel) {
            return res.status(404).json({ msg: "Không tìm thấy truyện" });
        }

        // Tạo bản ghi đánh giá mới
        const review = new Review({
            user: userId,
            novel: novelId,
            reviewTitle,
            reviewContent,
            likes: [],
            replies: [],
        });

        // Lưu đánh giá vào DB
        await review.save();

        // Thêm tham chiếu đánh giá vào truyện và người dùng
        await Novel.findByIdAndUpdate(novelId, { $push: { reviews: review._id } });
        await User.findByIdAndUpdate(userId, { $push: { reviews: review._id } });

        // Populate thông tin người dùng trước khi gửi phản hồi
        await review.populate("user", "-password");

        return res.status(201).json(review);
    } catch (error) {
        console.error("Add review error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể gửi đánh giá" });
    }
};

// Lấy tất cả đánh giá của một tác phẩm
const getNovelReviews = async (req, res) => {
    try {
        const reviews = await fetchReviewsForNovel(req.params.novelId);
        return res.status(200).json(reviews);
    } catch (error) {
        console.error("Get novel reviews error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID truyện không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể lấy danh sách đánh giá" });
    }
};

// Thêm phản hồi vào một đánh giá
const addReplyToReview = async (req, res) => {
    try {
        const { userId } = req.user;
        const { content } = req.body;
        const { reviewId } = req.params;

        if (!content || !userId) {
            return res.status(400).json({ msg: "Vui lòng nhập nội dung phản hồi" });
        }

        // Kiểm tra người dùng tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Không tìm thấy người dùng" });
        }

        // Tìm bài đánh giá
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ msg: "Không tìm thấy đánh giá" });
        }

        // Thêm phản hồi vào mảng replies của đánh giá
        review.replies.push({
            content,
            user: userId,
            likes: [],
        });

        await review.save();

        // Populate thông tin người dùng trong các câu trả lời
        await review.populate("replies.user", "-password");

        return res.status(200).json(review);
    } catch (error) {
        console.error("Add reply error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể gửi câu trả lời" });
    }
};

// Thích hoặc bỏ thích một đánh giá
const toggleReviewLike = async (req, res) => {
    try {
        const { userId } = req.user;
        const { reviewId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "Yêu cầu có mã người dùng" });
        }

        const result = await toggleDocumentLike(Review, reviewId, userId);
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Toggle review like error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể thích đánh giá" });
    }
};

// Thích hoặc bỏ thích một câu trả lời trong đánh giá
const toggleReplyLike = async (req, res) => {
    try {
        const { userId } = req.user;
        const { reviewId, replyId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "Yêu cầu có mã người dùng" });
        }

        const result = await toggleSubdocumentLike(Review, reviewId, 'replies', replyId, userId);
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error("Toggle reply like error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể thích câu trả lời" });
    }
};

// Xóa một đánh giá
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Tìm bài đánh giá
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ msg: "Không tìm thấy đánh giá" });
        }

        // Dọn dẹp các tham chiếu mồ côi
        // 1. Xóa khỏi mảng reviews của truyện
        if (review.novel) {
            await Novel.findByIdAndUpdate(review.novel, {
                $pull: { reviews: review._id }
            });
        }

        // 2. Xóa khỏi mảng reviews của người dùng
        await User.updateMany(
            { reviews: review._id },
            { $pull: { reviews: review._id } }
        );

        // 3. Xóa bản ghi đánh giá
        await review.deleteOne();

        return res.status(200).json({ msg: "Xóa đánh giá thành công" });
    } catch (error) {
        console.error("Delete review error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID đánh giá không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể xóa đánh giá" });
    }
};

// Lấy thông tin một đánh giá cụ thể theo ID
const getReviewsById = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const review = await populateReviewQuery(Review.findById(reviewId));

        if (!review) {
            return res.status(404).json({ msg: "Không tìm thấy đánh giá" });
        }

        return res.status(200).json(review);
    } catch (error) {
        console.error("Get review by ID error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID đánh giá không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể lấy thông tin đánh giá" });
    }
};

// Lấy tất cả đánh giá của một tác phẩm cụ thể
const getReviewsByNovelId = async (req, res) => {
    try {
        const { novelId } = req.params;
        const reviews = await fetchReviewsForNovel(novelId);
        return res.status(200).json(reviews);
    } catch (error) {
        console.error("Get reviews by novel ID error:", error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Định dạng ID truyện không hợp lệ" });
        }
        return res.status(500).json({ msg: "Không thể lấy danh sách đánh giá" });
    }
};

module.exports = {
    addReview,
    getNovelReviews,
    getReviewsByNovelId,
    getReviewsById,
    addReplyToReview,
    toggleReviewLike,
    toggleReplyLike,
    deleteReview,
};
