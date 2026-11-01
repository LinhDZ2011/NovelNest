const User = require('../models/User');
const Novel = require('../models/Novel');
const escapeRegex = require('../utils/escapeRegex');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password')
            .populate('posts', 'title content')
            .populate('reviews', 'reviewTitle reviewContent')
            .populate('likedNovels', 'title');
            
        return res.status(200).json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        return res.status(500).json({ message: 'Không thể lấy danh sách người dùng' });
    }
};

const getUserByName = async (req, res) => {
    try {
        const safeName = escapeRegex(req.params.name);
        const users = await User.find(
            { name: { $regex: new RegExp(safeName, 'i') } },
            '-password'
        )
        .populate('posts', 'title content')
        .populate('reviews', 'reviewTitle reviewContent')
        .populate('likedNovels', 'title');

        if (users.length > 0) {
            return res.status(200).json(users);
        } else {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
    } catch (error) {
        console.error('Get user by name error:', error);
        return res.status(500).json({ message: 'Không thể lấy thông tin người dùng' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId, '-password')
            .populate('posts', 'title content image createdAt likes')
            .populate('reviews', 'reviewTitle reviewContent')
            .populate('likedNovels', 'title coverPhoto description');

        if (user) {
            return res.status(200).json(user);
        }
        
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
    } catch (error) {
        console.error('Get user by ID error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Định dạng ID người dùng không hợp lệ' });
        }
        return res.status(500).json({ message: 'Không thể lấy thông tin người dùng' });
    }
};

const getLikedNovels = async (req, res) => {
    try {
        const { userId } = req.user;
        const user = await User.findById(userId, 'likedNovels');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const likedNovelIds = user.likedNovels;
        const likedNovels = await Novel.find({ _id: { $in: likedNovelIds } })
            .populate('author', '-user.password')
            .populate('chapters', 'chapterNumber chapterName')
            .populate({
                path: 'reviews',
                select: 'reviewTitle reviewContent likes',
                populate: {
                    path: 'user',
                    select: '-password'
                }
            });

        return res.status(200).json(likedNovels);
    } catch (error) {
        console.error('Get liked novels error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Định dạng ID người dùng không hợp lệ' });
        }
        return res.status(500).json({ message: 'Không thể lấy danh sách truyện đã thích' });
    }
};

// Cập nhật thông tin hồ sơ người dùng (Tên hiển thị)
const updateProfile = async (req, res) => {
    try {
        const { userId } = req.user;
        const { name } = req.body;

        if (!name || name.trim().length < 3) {
            return res.status(400).json({ message: "Tên hiển thị phải có ít nhất 3 ký tự" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        user.name = name.trim();
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            message: "Cập nhật thông tin thành công",
            user: userResponse
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật thông tin" });
    }
};

// Cập nhật ảnh đại diện người dùng
const updateAvatar = async (req, res) => {
    try {
        const { userId } = req.user;

        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: "Vui lòng chọn hình ảnh để tải lên" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        user.userimage = req.file.path;
        await user.save();

        return res.status(200).json({
            message: "Cập nhật ảnh đại diện thành công",
            userimage: user.userimage
        });
    } catch (error) {
        console.error('Update avatar error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ khi cập nhật ảnh đại diện" });
    }
};

// Đổi mật khẩu tài khoản
const changePassword = async (req, res) => {
    try {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // Chặn đổi mật khẩu nếu đăng nhập bằng Google
        if (user.authProvider === 'google') {
            return res.status(400).json({
                message: "Bạn đang đăng nhập bằng tài khoản Google. Mật khẩu được bảo vệ an toàn bởi Google và không thể thay đổi tại đây."
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới" });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không chính xác" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ message: "Đổi mật khẩu thành công!" });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ message: "Lỗi máy chủ khi đổi mật khẩu" });
    }
};

module.exports = {
    getAllUsers,
    getUserByName,
    getUserById,
    getLikedNovels,
    updateProfile,
    updateAvatar,
    changePassword
};
