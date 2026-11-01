const User = require('../models/User');
const Author = require('../models/Author');
const Novel = require('../models/Novel');
const Post = require('../models/Post');
const AuthorRequest = require('../models/AuthorRequest');
const Genre = require('../models/Genre');

// Lấy dữ liệu thống kê tổng quan hệ thống cho Admin
const getAdminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalAuthors,
            totalNovels,
            totalPosts,
            totalGenres,
            pendingRequests,
            recentNovels,
            recentPosts
        ] = await Promise.all([
            User.countDocuments(),
            Author.countDocuments(),
            Novel.countDocuments(),
            Post.countDocuments(),
            Genre.countDocuments(),
            AuthorRequest.countDocuments({ status: 'pending' }),
            Novel.find().populate('author', 'penName').populate('genres', 'name slug color').sort({ createdAt: -1 }).limit(5),
            Post.find().populate('user', 'name userimage').sort({ createdAt: -1 }).limit(5)
        ]);

        return res.status(200).json({
            totalUsers,
            totalAuthors,
            totalNovels,
            totalPosts,
            totalGenres,
            pendingRequests,
            recentNovels,
            recentPosts
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        return res.status(500).json({ msg: "Không thể lấy dữ liệu thống kê quản trị" });
    }
};

// Lấy danh sách các đơn yêu cầu tác giả kèm bộ lọc trạng thái tùy chọn
const getAuthorRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            filter.status = status;
        }

        const requests = await AuthorRequest.find(filter)
            .populate('user', 'name email userimage role authProvider createdAt')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json(requests);
    } catch (error) {
        console.error('Get author requests error:', error);
        return res.status(500).json({ msg: "Không thể lấy danh sách đơn yêu cầu" });
    }
};

// Phê duyệt hoặc từ chối đơn yêu cầu tác giả
const reviewAuthorRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;
        const adminId = req.user.userId;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: "Trạng thái phê duyệt không hợp lệ ('approved' hoặc 'rejected')" });
        }

        const request = await AuthorRequest.findById(id).populate('user');
        if (!request) {
            return res.status(404).json({ msg: "Không tìm thấy đơn yêu cầu tác giả" });
        }

        request.status = status;
        request.adminNote = adminNote ? adminNote.trim() : '';
        request.reviewedBy = adminId;
        request.reviewedAt = new Date();
        await request.save();

        if (status === 'approved') {
            // Cập nhật vai trò user thành author
            const user = await User.findById(request.user._id || request.user);
            if (user) {
                user.role = 'author';
                await user.save();
            }

            // Tạo hồ sơ Author nếu chưa tồn tại
            let author = await Author.findOne({ user: request.user._id || request.user });
            if (!author) {
                author = new Author({
                    user: request.user._id || request.user,
                    penName: request.penName,
                    bio: request.bio || '',
                    novels: []
                });
                await author.save();
            } else {
                author.penName = request.penName;
                if (request.bio) author.bio = request.bio;
                await author.save();
            }
        }

        return res.status(200).json({
            msg: status === 'approved' ? "Đã phê duyệt đơn tác giả thành công" : "Đã từ chối đơn tác giả",
            request
        });
    } catch (error) {
        console.error('Review author request error:', error);
        return res.status(500).json({ msg: "Lỗi máy chủ khi duyệt đơn tác giả" });
    }
};

// Lấy danh sách toàn bộ truyện phục vụ kiểm duyệt của Admin (kèm Thể loại)
const getAdminNovels = async (req, res) => {
    try {
        const novels = await Novel.find()
            .populate('author', 'penName user')
            .populate('genres', 'name slug color')
            .populate('chapters', 'chapterNumber chapterName')
            .populate('reviews', 'reviewTitle reviewContent')
            .sort({ createdAt: -1 });

        return res.status(200).json(novels);
    } catch (error) {
        console.error('Get admin novels error:', error);
        return res.status(500).json({ msg: "Không thể lấy danh sách truyện quản trị" });
    }
};

// Lấy danh sách toàn bộ bài viết diễn đàn phục vụ kiểm duyệt của Admin
const getAdminPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name email userimage role')
            .populate('comments.user', 'name userimage')
            .sort({ createdAt: -1 });

        return res.status(200).json(posts);
    } catch (error) {
        console.error('Get admin posts error:', error);
        return res.status(500).json({ msg: "Không thể lấy danh sách bài viết quản trị" });
    }
};

// Lấy danh sách toàn bộ người dùng để quản lý
const getAdminUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password')
            .populate('posts', 'title')
            .populate('reviews', 'reviewTitle')
            .sort({ createdAt: -1 });

        return res.status(200).json(users);
    } catch (error) {
        console.error('Get admin users error:', error);
        return res.status(500).json({ msg: "Không thể lấy danh sách người dùng quản trị" });
    }
};

// Quản trị viên cập nhật vai trò người dùng trực tiếp
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'author', 'admin'].includes(role)) {
            return res.status(400).json({ msg: "Vai trò không hợp lệ" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "Không tìm thấy người dùng" });
        }

        user.role = role;
        await user.save();

        if (role === 'author') {
            const existingAuthor = await Author.findOne({ user: user._id });
            if (!existingAuthor) {
                const newAuthor = new Author({
                    user: user._id,
                    penName: user.name,
                    bio: 'Tác giả sáng tác tại NovelHub',
                    novels: []
                });
                await newAuthor.save();
            }
        }

        return res.status(200).json({
            msg: `Đã cập nhật vai trò thành [${role}] cho người dùng ${user.name}`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update user role error:', error);
        return res.status(500).json({ msg: "Lỗi máy chủ khi cập nhật vai trò người dùng" });
    }
};

module.exports = {
    getAdminStats,
    getAuthorRequests,
    reviewAuthorRequest,
    getAdminNovels,
    getAdminPosts,
    getAdminUsers,
    updateUserRole
};
