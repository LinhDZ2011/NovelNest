const Novel = require('../models/Novel');
const Chapter = require('../models/Chapter');
const Review = require('../models/Review');
const User = require('../models/User');
const Author = require('../models/Author');

/**
 * NovelManagementFacade (Facade Pattern)
 * Ẩn giấu sự phức tạp của quá trình xóa truyện và dọn dẹp các quan hệ liên tầng
 */
class NovelManagementFacade {
    /**
     * Xóa hoàn toàn một tác phẩm truyện cùng tất cả tài nguyên liên quan
     * @param {string} novelId 
     * @returns {Promise<boolean>}
     */
    static async deleteNovelCompletely(novelId) {
        const novel = await Novel.findById(novelId);
        if (!novel) {
            throw new Error('Không tìm thấy truyện cần xóa');
        }

        // 1. Tìm các review của truyện và xóa tham chiếu trong User.reviews
        const reviewsToDelete = await Review.find({ novel: novel._id }, '_id');
        const reviewIds = reviewsToDelete.map(r => r._id);
        if (reviewIds.length > 0) {
            await User.updateMany(
                { reviews: { $in: reviewIds } },
                { $pull: { reviews: { $in: reviewIds } } }
            );
            await Review.deleteMany({ novel: novel._id });
        }

        // 2. Xóa novelId khỏi likedNovels của mọi người dùng
        await User.updateMany(
            { likedNovels: novel._id },
            { $pull: { likedNovels: novel._id } }
        );

        // 3. Xóa toàn bộ các chương (Chapter) thuộc truyện
        await Chapter.deleteMany({ novel: novel._id });

        // 4. Xóa novelId khỏi danh sách novels của tác giả
        if (novel.author) {
            await Author.findByIdAndUpdate(novel.author, {
                $pull: { novels: novel._id }
            });
        }

        // 5. Xóa truyện khỏi cơ sở dữ liệu
        await novel.deleteOne();

        return true;
    }
}

module.exports = NovelManagementFacade;
