const express = require('express');
const chapterRouter = express.Router();
const chapterController = require('../controllers/chapterController');
const isLoggedIn = require('../authentication/authentication');
const { checkChapterUploadPermission, checkChapterEditPermission } = require('../middlewares/ownership');

chapterRouter.get('/:novelId/chapters', isLoggedIn, chapterController.getChaptersByNovelId);
chapterRouter.get('/:novelId/chapters/:chapterId', chapterController.getChapterById);

chapterRouter.post('/:novelId/new-chapter', isLoggedIn, checkChapterUploadPermission, chapterController.uploadChapter);

// Cập nhật nội dung văn bản chương (Tác giả hoặc Quản trị viên)
chapterRouter.put('/:novelId/chapters/:chapterId', isLoggedIn, checkChapterEditPermission, chapterController.updateChapter);

module.exports = chapterRouter;
