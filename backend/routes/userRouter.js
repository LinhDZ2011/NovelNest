const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const isLoggedIn = require('../authentication/authentication');
const upload = require('../middlewares/cloudinaryStore');

userRouter.get('/', isLoggedIn, userController.getAllUsers);
userRouter.get('/name/:name', isLoggedIn, userController.getUserByName);
userRouter.get('/me', isLoggedIn, userController.getUserById);
userRouter.get('/liked-novels', isLoggedIn, userController.getLikedNovels);

// Tuyến đường cập nhật thông tin cá nhân và bảo mật
userRouter.put('/profile', isLoggedIn, userController.updateProfile);
userRouter.put('/avatar', isLoggedIn, upload.single('avatar'), userController.updateAvatar);
userRouter.put('/change-password', isLoggedIn, userController.changePassword);

module.exports = userRouter;
