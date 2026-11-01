const express = require('express');
const authorRouter = express.Router();
const authorController = require('../controllers/authorController');
const isLoggedIn = require('../authentication/authentication');

authorRouter.get('/', isLoggedIn, authorController.getAuthors);
authorRouter.get('/dashboard', isLoggedIn, authorController.getAuthorById);
authorRouter.get('/author-dashboard', isLoggedIn, authorController.getAuthorByUserId);

// Các tuyến đường nộp và kiểm tra đơn đăng ký tác giả
authorRouter.post('/request', isLoggedIn, authorController.submitAuthorRequest);
authorRouter.get('/my-request', isLoggedIn, authorController.getMyAuthorRequest);
authorRouter.post('/applyAuthorship', isLoggedIn, authorController.applyForAuthor);

module.exports = authorRouter;
