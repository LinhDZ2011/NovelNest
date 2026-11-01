const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/adminController');
const isLoggedIn = require('../authentication/authentication');
const authorizeRoles = require('../middlewares/authorizeRoles');

// Áp dụng xác thực đăng nhập và kiểm tra quyền Quản trị viên cho toàn bộ route admin
adminRouter.use(isLoggedIn, authorizeRoles('admin'));

// Tuyến đường thống kê hệ thống
adminRouter.get('/stats', adminController.getAdminStats);

// Tuyến đường quản lý đơn xin làm tác giả
adminRouter.get('/author-requests', adminController.getAuthorRequests);
adminRouter.put('/author-requests/:id/review', adminController.reviewAuthorRequest);

// Tuyến đường kiểm duyệt truyện
adminRouter.get('/novels', adminController.getAdminNovels);

// Tuyến đường kiểm duyệt bài viết diễn đàn
adminRouter.get('/posts', adminController.getAdminPosts);

// Tuyến đường quản lý người dùng
adminRouter.get('/users', adminController.getAdminUsers);
adminRouter.put('/users/:id/role', adminController.updateUserRole);

module.exports = adminRouter;
