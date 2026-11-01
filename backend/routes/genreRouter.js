const express = require('express');
const genreRouter = express.Router();
const genreController = require('../controllers/genreController');
const isLoggedIn = require('../authentication/authentication');
const authorizeRoles = require('../middlewares/authorizeRoles');

// Các tuyến đường công khai
genreRouter.get('/', genreController.getAllGenres);
genreRouter.get('/:slug', genreController.getGenreBySlug);

// Các tuyến đường quản trị dành riêng cho Admin
genreRouter.post('/', isLoggedIn, authorizeRoles('admin'), genreController.createGenre);
genreRouter.put('/:id', isLoggedIn, authorizeRoles('admin'), genreController.updateGenre);
genreRouter.delete('/:id', isLoggedIn, authorizeRoles('admin'), genreController.deleteGenre);

module.exports = genreRouter;

