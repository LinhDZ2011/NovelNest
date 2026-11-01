const Genre = require('../models/Genre');
const Novel = require('../models/Novel');
const escapeRegex = require('../utils/escapeRegex');
const { generateSlug } = require('../utils/slugHelper');

// Lấy danh sách toàn bộ thể loại (kèm số lượng tác phẩm tương ứng)
const getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.aggregate([
      {
        $lookup: {
          from: 'novels',
          localField: '_id',
          foreignField: 'genres',
          as: 'novels'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          color: 1,
          createdAt: 1,
          updatedAt: 1,
          novelCount: { $size: '$novels' }
        }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);

    return res.status(200).json(genres);
  } catch (error) {
    console.error('Get all genres error:', error);
    return res.status(500).json({ msg: "Không thể lấy danh sách thể loại" });
  }
};

// Lấy thông tin thể loại theo slug kèm danh sách truyện thuộc thể loại đó
const getGenreBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const genre = await Genre.findOne({ slug: slug.toLowerCase().trim() });
    if (!genre) {
      return res.status(404).json({ msg: "Không tìm thấy thể loại yêu cầu" });
    }

    const novels = await Novel.find({ genres: genre._id })
      .populate('author', 'penName user')
      .populate('genres', 'name slug color')
      .populate('chapters', 'chapterNumber chapterName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      genre,
      novels,
      totalNovels: novels.length
    });
  } catch (error) {
    console.error('Get genre by slug error:', error);
    return res.status(500).json({ msg: "Không thể lấy thông tin thể loại" });
  }
};

// Tạo thể loại mới (Admin)
const createGenre = async (req, res) => {
  try {
    const { name, description, color, slug: customSlug } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Tên thể loại là bắt buộc" });
    }

    const cleanName = name.trim();
    const finalSlug = customSlug && customSlug.trim() ? generateSlug(customSlug) : generateSlug(cleanName);

    if (!finalSlug) {
      return res.status(400).json({ msg: "Không thể tạo mã định danh (slug) từ tên thể loại" });
    }

    // Kiểm tra trùng lặp tên hoặc slug
    const existing = await Genre.findOne({
      $or: [
        { name: new RegExp('^' + escapeRegex(cleanName) + '$', 'i') },
        { slug: finalSlug }
      ]
    });

    if (existing) {
      return res.status(400).json({ msg: "Thể loại hoặc đường dẫn slug này đã tồn tại trong hệ thống" });
    }

    const newGenre = new Genre({
      name: cleanName,
      slug: finalSlug,
      description: description ? description.trim() : '',
      color: color && color.trim() ? color.trim() : '#8B5CF6'
    });

    await newGenre.save();
    return res.status(201).json({
      ...newGenre.toObject(),
      novelCount: 0
    });
  } catch (error) {
    console.error('Create genre error:', error);
    return res.status(500).json({ msg: "Không thể tạo thể loại mới" });
  }
};

// Cập nhật thể loại (Admin)
const updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, slug: customSlug } = req.body;

    const genre = await Genre.findById(id);
    if (!genre) {
      return res.status(404).json({ msg: "Không tìm thấy thể loại cần cập nhật" });
    }

    if (name && name.trim()) {
      const cleanName = name.trim();
      const newSlug = customSlug && customSlug.trim() ? generateSlug(customSlug) : generateSlug(cleanName);

      // Kiểm tra trùng lặp với thể loại khác
      const conflict = await Genre.findOne({
        _id: { $ne: genre._id },
        $or: [
          { name: new RegExp('^' + escapeRegex(cleanName) + '$', 'i') },
          { slug: newSlug }
        ]
      });

      if (conflict) {
        return res.status(400).json({ msg: "Tên hoặc slug thể loại đã bị trùng với một thể loại khác" });
      }

      genre.name = cleanName;
      genre.slug = newSlug;
    }

    if (description !== undefined) {
      genre.description = description.trim();
    }

    if (color && color.trim()) {
      genre.color = color.trim();
    }

    await genre.save();

    // Đếm số lượng truyện hiện tại của thể loại
    const novelCount = await Novel.countDocuments({ genres: genre._id });

    return res.status(200).json({
      ...genre.toObject(),
      novelCount
    });
  } catch (error) {
    console.error('Update genre error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Định dạng ID thể loại không hợp lệ' });
    }
    return res.status(500).json({ msg: "Không thể cập nhật thể loại" });
  }
};

// Xóa an toàn thể loại và dọn dẹp liên kết trong các truyện (Admin)
const deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await Genre.findById(id);
    if (!genre) {
      return res.status(404).json({ msg: "Không tìm thấy thể loại cần xóa" });
    }

    // Tự động gỡ ID thể loại khỏi mảng genres của các tác phẩm đang gắn thể loại này
    const updateResult = await Novel.updateMany(
      { genres: genre._id },
      { $pull: { genres: genre._id } }
    );

    await genre.deleteOne();

    return res.status(200).json({
      msg: `Đã xóa thể loại "${genre.name}" thành công và dọn dẹp liên kết trong ${updateResult.modifiedCount} tác phẩm.`,
      deletedId: id
    });
  } catch (error) {
    console.error('Delete genre error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Định dạng ID thể loại không hợp lệ' });
    }
    return res.status(500).json({ msg: "Không thể xóa thể loại" });
  }
};

module.exports = {
  getAllGenres,
  getGenreBySlug,
  createGenre,
  updateGenre,
  deleteGenre
};

