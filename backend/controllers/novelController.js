const mongoose = require('mongoose');
const Novel = require('../models/Novel');
const Author = require('../models/Author');
const Chapter = require('../models/Chapter');
const Review = require('../models/Review');
const User = require('../models/User');
const Genre = require('../models/Genre');
const escapeRegex = require('../utils/escapeRegex');
const { toggleDocumentLike } = require('../utils/likeHelper');
const NovelManagementFacade = require('../utils/NovelManagementFacade');

// Helper chuẩn hóa danh sách genres từ req.body (xử lý JSON string, array, chuỗi phân tách dấu phẩy)
const parseGenresInput = (genresInput) => {
    if (!genresInput) return [];
    if (Array.isArray(genresInput)) {
        return genresInput.filter(Boolean);
    }
    if (typeof genresInput === 'string') {
        const trimmed = genresInput.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
            if (parsed) return [parsed];
        } catch {
            return trimmed.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    return [];
};

// Hàm trợ giúp populate các trường mặc định của truyện
const defaultNovelPopulate = (query) => {
    return query
        .populate('author', '-user.password')
        .populate('genres', 'name slug color description')
        .populate('chapters', 'chapterNumber chapterName')
        .populate({
            path: 'reviews',
            select: 'reviewTitle reviewContent likes',
            populate: {
                path: 'user',
                select: '-password'
            }
        });
};

const createNovel = async (req, res) => {
    try {
        const { title, description, authorId, genres } = req.body;

        if (!title || !description || !authorId) {
            return res.status(400).json({ msg: "Vui lòng nhập đầy đủ tiêu đề, mô tả và thông tin tác giả" });
        }

        const author = await Author.findById(authorId);
        if (!author) {
            return res.status(404).json({ msg: "Không tìm thấy tác giả" });
        }

        const coverPhoto = req.files?.coverPhoto ? {
            url: req.files.coverPhoto[0].path,
            publicId: req.files.coverPhoto[0].filename
        } : null;

        const introVideo = req.files?.introVideo ? {
            url: req.files.introVideo[0].path,
            publicId: req.files.introVideo[0].filename
        } : null;

        if (!coverPhoto) {
            return res.status(400).json({ msg: "Ảnh bìa truyện là bắt buộc" });
        }

        const parsedGenres = parseGenresInput(genres);

        const novel = new Novel({
            title: title.trim(),
            description: description.trim(),
            author: authorId,
            coverPhoto,
            introVideo,
            genres: parsedGenres,
            chapters: [],
            reviews: [],
            likes: []
        });

        await novel.save();

        author.novels.push(novel._id);
        await author.save();

        const populatedNovel = await defaultNovelPopulate(Novel.findById(novel._id));
        return res.status(201).json(populatedNovel);
    } catch (error) {
        console.error('Create novel error:', error);
        return res.status(500).json({ msg: "Không thể tạo truyện mới" });
    }
};

const getAllNovels = async (req, res) => {
    try {
        const novels = await defaultNovelPopulate(Novel.find()).sort({ createdAt: -1 });
        return res.status(200).json(novels);
    } catch (error) {
        console.error('Get all novels error:', error);
        return res.status(500).json({ msg: "Không thể lấy danh sách truyện" });
    }
};

const getNovelById = async (req, res) => {
    try {
        const novel = await defaultNovelPopulate(Novel.findById(req.params.id));
        if (!novel) {
            return res.status(404).json({ msg: "Không tìm thấy truyện" });
        }
        return res.status(200).json(novel);
    } catch (error) {
        console.error('Get novel by ID error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID truyện không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể lấy thông tin truyện" });
    }
};

const getNovelsByAuthor = async (req, res) => {
    try {
        const novels = await defaultNovelPopulate(Novel.find({ author: req.params.authorId }))
            .sort({ createdAt: -1 });

        return res.status(200).json(novels);
    } catch (error) {
        console.error('Get novels by author error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID tác giả không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể lấy danh sách truyện của tác giả" });
    }
};

// Cập nhật thông tin tác phẩm (Tiêu đề, tóm tắt cốt truyện, thể loại, ảnh bìa, video giới thiệu)
const updateNovel = async (req, res) => {
    try {
        const { title, description, genres } = req.body;
        const novelId = req.params.id;

        const novel = await Novel.findById(novelId);
        if (!novel) {
            return res.status(404).json({ msg: "Không tìm thấy truyện" });
        }

        if (title) novel.title = title.trim();
        if (description) novel.description = description.trim();
        if (genres !== undefined) {
            novel.genres = parseGenresInput(genres);
        }
        if (req.files?.coverPhoto) {
            novel.coverPhoto = {
                url: req.files.coverPhoto[0].path,
                publicId: req.files.coverPhoto[0].filename
            };
        }
        if (req.files?.introVideo) {
            novel.introVideo = {
                url: req.files.introVideo[0].path,
                publicId: req.files.introVideo[0].filename
            };
        }

        await novel.save();

        const updatedNovel = await defaultNovelPopulate(Novel.findById(novel._id));
        return res.status(200).json(updatedNovel);
    } catch (error) {
        console.error('Update novel error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID truyện không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể cập nhật truyện" });
    }
};

// Xóa hoàn toàn truyện bằng NovelManagementFacade (Facade Pattern)
const deleteNovel = async (req, res) => {
    try {
        const novelId = req.params.id;
        await NovelManagementFacade.deleteNovelCompletely(novelId);
        return res.status(200).json({ msg: "Xóa truyện thành công" });
    } catch (error) {
        console.error('Delete novel error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID truyện không hợp lệ' });
        }
        if (error.message === 'Không tìm thấy truyện cần xóa') {
            return res.status(404).json({ msg: error.message });
        }
        return res.status(500).json({ msg: "Không thể xóa truyện" });
    }
};

// Thích hoặc bỏ thích một tác phẩm truyện
const toggleNovelLike = async (req, res) => {
    try {
        const { userId } = req.user;
        const { novelId } = req.params;
        if (!userId) {
            return res.status(400).json({ msg: "Yêu cầu có mã người dùng" });
        }

        const result = await toggleDocumentLike(Novel, novelId, userId, { field: 'likedNovels' });
        if (result.status !== 200) {
            return res.status(result.status).json({ msg: result.msg });
        }

        return res.status(200).json(result.data);
    } catch (error) {
        console.error('Toggle novel like error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Định dạng ID không hợp lệ' });
        }
        return res.status(500).json({ msg: "Không thể thích truyện" });
    }
};

// Hàm khử dấu tiếng Việt hoàn chỉnh
const removeVietnameseTones = (str) => {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd');
};

// Chuẩn hóa văn bản tìm kiếm: chữ thường + không dấu
const normalizeSearchText = (str) => {
    return removeVietnameseTones(str).toLowerCase().trim();
};

// Chuẩn hóa viết liền không dấu (dùng cho trường hợp: tiennghich)
const toCompactText = (str) => {
    return normalizeSearchText(str).replace(/\s+/g, '');
};

// Tìm kiếm truyện thông minh (Theo tên truyện, tên tác giả, hỗ trợ không dấu, viết liền, tiền tố, kết hợp lọc theo Thể loại)
const searchNovels = async (req, res) => {
    try {
        const query = req.query.query || req.query.q;
        const genreParam = req.query.genre;

        const hasQuery = Boolean(query && query.trim());
        const hasGenre = Boolean(genreParam && genreParam.trim());

        if (!hasQuery && !hasGenre) {
            return res.status(200).json([]);
        }

        // Lấy danh sách truyện và populate đầy đủ thông tin tác giả, thể loại, chương
        const allNovels = await Novel.find()
            .populate('author', 'penName bio user')
            .populate('genres', 'name slug color description')
            .populate('chapters', 'chapterNumber chapterName');

        let filteredNovels = allNovels;

        // 1. Lọc theo thể loại (nếu có tham số genre: slug hoặc ID)
        if (hasGenre) {
            const targetGenre = genreParam.trim().toLowerCase();
            filteredNovels = filteredNovels.filter((novel) => {
                if (!novel.genres || !Array.isArray(novel.genres)) return false;
                return novel.genres.some((g) => {
                    const gSlug = (g.slug || '').toLowerCase();
                    const gId = g._id ? g._id.toString() : '';
                    return gSlug === targetGenre || gId === targetGenre;
                });
            });
        }

        // 2. Lọc theo từ khóa tìm kiếm (nếu có tham số query)
        if (hasQuery) {
            const rawQuery = query.trim().toLowerCase();
            const normQuery = normalizeSearchText(rawQuery);
            const compactQuery = toCompactText(rawQuery);

            filteredNovels = filteredNovels.filter((novel) => {
                const rawTitle = (novel.title || '').toLowerCase();
                const normTitle = normalizeSearchText(novel.title || '');
                const compactTitle = toCompactText(novel.title || '');

                const rawAuthor = (novel.author?.penName || '').toLowerCase();
                const normAuthor = normalizeSearchText(novel.author?.penName || '');
                const compactAuthor = toCompactText(novel.author?.penName || '');

                const combinedNorm = `${normTitle} ${normAuthor}`;
                const combinedCompact = `${compactTitle}${compactAuthor}`;

                // Khớp tiêu đề truyện (có dấu, không dấu, viết liền, tiền tố)
                const matchTitle =
                    rawTitle.includes(rawQuery) ||
                    normTitle.includes(normQuery) ||
                    compactTitle.includes(compactQuery) ||
                    normTitle.startsWith(normQuery);

                // Khớp tên tác giả (có dấu, không dấu, viết liền)
                const matchAuthor =
                    rawAuthor.includes(rawQuery) ||
                    normAuthor.includes(normQuery) ||
                    compactAuthor.includes(compactQuery);

                // Khớp chuỗi kết hợp truyện + tác giả
                const matchCombined =
                    combinedNorm.includes(normQuery) ||
                    combinedCompact.includes(compactQuery);

                return matchTitle || matchAuthor || matchCombined;
            });

            // Sắp xếp độ liên quan: Ưu tiên tên truyện bắt đầu bằng từ khóa lên đầu
            filteredNovels.sort((a, b) => {
                const aNorm = normalizeSearchText(a.title || '');
                const bNorm = normalizeSearchText(b.title || '');
                const aStarts = aNorm.startsWith(normQuery);
                const bStarts = bNorm.startsWith(normQuery);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return 0;
            });
        }

        return res.status(200).json(filteredNovels.slice(0, 50));
    } catch (error) {
        console.error('Search novels error:', error);
        return res.status(500).json({ msg: "Không thể tìm kiếm truyện" });
    }
};

module.exports = {
    createNovel,
    getAllNovels,
    getNovelById,
    getNovelsByAuthor,
    updateNovel,
    deleteNovel,
    toggleNovelLike,
    searchNovels
};
