const User = require('../models/User');

/**
 * Middleware phân quyền Role-Based Access Control (RBAC)
 * @param  {...string} allowedRoles Các vai trò được phép truy cập
 */
const authorizeRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ msg: "Truy cập bị từ chối. Vui lòng đăng nhập." });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(401).json({ msg: "Không tìm thấy người dùng." });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ 
                    msg: `Từ chối truy cập. Yêu cầu quyền: [${allowedRoles.join(', ')}]. Quyền hiện tại của bạn: [${user.role}].` 
                });
            }

            req.userDoc = user;
            next();
        } catch (error) {
            console.error('Authorize roles error:', error);
            return res.status(500).json({ msg: "Lỗi máy chủ khi kiểm tra quyền hạn" });
        }
    };
};

module.exports = authorizeRoles;
