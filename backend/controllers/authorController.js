const Author = require('../models/Author');
const User = require('../models/User');
const AuthorRequest = require('../models/AuthorRequest');

// Người dùng gửi đơn đăng ký để trở thành tác giả
const submitAuthorRequest = async (req, res) => {
    try {
        const { userId } = req.user;
        const { penName, bio, reason } = req.body;

        if (!penName || !penName.trim()) {
            return res.status(400).json({ msg: "Vui lòng nhập bút danh mong muốn." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "Không tìm thấy người dùng." });
        }

        if (user.role === "author") {
            return res.status(400).json({ msg: "Bạn đã là tác giả trên hệ thống." });
        }

        // Kiểm tra xem bút danh đã được sử dụng bởi tác giả khác chưa
        const existingAuthor = await Author.findOne({ penName: penName.trim() });
        if (existingAuthor && existingAuthor.user.toString() !== user._id.toString()) {
            return res.status(400).json({ msg: "Bút danh này đã được sử dụng bởi tác giả khác." });
        }

        let request = await AuthorRequest.findOne({ user: userId });
        if (request) {
            if (request.status === 'pending') {
                return res.status(400).json({ msg: "Bạn đã có đơn đăng ký đang chờ xét duyệt." });
            }
            // Nếu trước đó đã bị từ chối hoặc đã duyệt, cập nhật lại trạng thái thành chờ duyệt (pending)
            request.penName = penName.trim();
            request.bio = bio ? bio.trim() : '';
            request.reason = reason ? reason.trim() : '';
            request.status = 'pending';
            request.adminNote = '';
            request.reviewedBy = undefined;
            request.reviewedAt = undefined;
            await request.save();
        } else {
            request = new AuthorRequest({
                user: userId,
                penName: penName.trim(),
                bio: bio ? bio.trim() : '',
                reason: reason ? reason.trim() : '',
                status: 'pending'
            });
            await request.save();
        }

        return res.status(200).json({
            msg: "Gửi đơn xin làm tác giả thành công! Vui lòng chờ quản trị viên phê duyệt.",
            request
        });
    } catch (error) {
        console.error('Submit author request error:', error);
        return res.status(500).json({ msg: "Lỗi máy chủ nội bộ khi gửi đơn" });
    }
};

// Người dùng lấy trạng thái đơn đăng ký tác giả của chính mình
const getMyAuthorRequest = async (req, res) => {
    try {
        const { userId } = req.user;
        const request = await AuthorRequest.findOne({ user: userId });
        return res.status(200).json(request || null);
    } catch (error) {
        console.error('Get my author request error:', error);
        return res.status(500).json({ msg: "Không thể lấy thông tin đơn tác giả" });
    }
};

// Endpoint dự phòng tương thích ngược
const applyForAuthor = async (req, res) => {
    return submitAuthorRequest(req, res);
};

const getAuthors = async (req, res) => {
    try {
        const authors = await Author.find()
            .populate('user', '-password')
            .populate('novels', 'title description');
            
        return res.status(200).json(authors);
    } catch (error) {
        console.error('Get authors error:', error);
        return res.status(500).json({ msg: "Không thể lấy danh sách tác giả" });
    }
};

const getAuthorById = async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
            .populate('user', '-password')
            .populate('novels', 'title description');

        if (!author) {
            return res.status(404).json({ msg: "Không tìm thấy tác giả" });
        }

        return res.status(200).json(author);
    } catch (error) {
        console.error('Get author by ID error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID tác giả không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể lấy thông tin tác giả" });
    }
};

const getAuthorByUserId = async (req, res) => {
    try {
        const { userId } = req.user;
        const author = await Author.findOne({ user: userId })
            .populate('user', '-password')
            .populate('novels', 'title description');

        if (!author) {
            return res.status(404).json({ msg: "Không tìm thấy tác giả" });
        }

        return res.status(200).json(author);
    } catch (error) {
        console.error('Get author by user ID error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID người dùng không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể lấy thông tin tác giả" });
    }
};

module.exports = {
    submitAuthorRequest,
    getMyAuthorRequest,
    applyForAuthor,
    getAuthors,
    getAuthorById,
    getAuthorByUserId
};
