const express = require('express');
const postRouter = express.Router();
const postController = require('../controllers/postController');
const isLoggedIn = require('../authentication/authentication');
const upload = require('../middlewares/cloudinaryStore');
const { checkPostOwner } = require('../middlewares/ownership');

// Tuyến đường lấy dữ liệu bài viết (GET)
postRouter.get('/', postController.getAllPosts);
postRouter.get('/:id', postController.getPostById);
postRouter.get('/user/user-posts', isLoggedIn, postController.getPostsByUserId);

// Tuyến đường tạo mới và tương tác bài viết (POST)
postRouter.post('/', upload.single('image'), isLoggedIn, postController.addPosts);
postRouter.post('/:postId/comments', isLoggedIn, postController.addCommentToPost);
postRouter.post('/:postId/like', isLoggedIn, postController.togglePostLike);
postRouter.post('/:postId/comments/:commentId/like', isLoggedIn, postController.toggleCommentLike);

// Tuyến đường xóa bài viết (DELETE - tác giả hoặc admin)
postRouter.delete('/:id', isLoggedIn, checkPostOwner, postController.deletePost);

module.exports = postRouter;
