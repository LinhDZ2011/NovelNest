const Genre = require('../models/Genre');

const initialGenres = [
  {
    name: "Tiên Hiệp",
    slug: "tien-hiep",
    color: "#3B82F6",
    description: "Con đường tu tiên đắc đạo, nghịch thiên cải mệnh, trường sinh bất tử."
  },
  {
    name: "Kiếm Hiệp",
    slug: "kiem-hiep",
    color: "#10B981",
    description: "Thế giới võ lâm giang hồ, ân oán tình thù, hiệp khách trượng nghĩa."
  },
  {
    name: "Huyền Huyễn",
    slug: "huyen-huyen",
    color: "#8B5CF6",
    description: "Thế giới kỳ ảo rộng lớn, ma pháp, đấu khí, dị giới huyền bí."
  },
  {
    name: "Đô Thị",
    slug: "do-thi",
    color: "#F59E0B",
    description: "Cuộc sống hiện đại, thương trường, dị năng ngầm nơi đô thành náo nhiệt."
  },
  {
    name: "Khoa Huyễn",
    slug: "khoa-huyen",
    color: "#06B6D4",
    description: "Khoa học viễn tưởng, không gian vũ trụ, công nghệ tương lai và cơ giáp."
  },
  {
    name: "Trọng Sinh",
    slug: "trong-sinh",
    color: "#EC4899",
    description: "Được tái sinh làm lại cuộc đời, nắm giữ cơ duyên và kiến thức kiếp trước."
  },
  {
    name: "Võng Du",
    slug: "vong-du",
    color: "#6366F1",
    description: "Khám phá thế giới thực tế ảo, trò chơi trực tuyến, bảng nhiệm vụ và kỹ năng."
  },
  {
    name: "Linh Dị",
    slug: "linh-di",
    color: "#EF4444",
    description: "Yếu tố tâm linh, trừ ma diệt quỷ, khám phá những bí ẩn kinh dị ma mị."
  },
  {
    name: "Ngôn Tình",
    slug: "ngon-tinh",
    color: "#F43F5E",
    description: "Câu chuyện tình cảm sâu sắc, ngọt ngào hoặc trắc trở giữa các nhân vật."
  },
  {
    name: "Hài Hước",
    slug: "hai-huoc",
    color: "#EAB308",
    description: "Tình tiết dí dỏm, phong cách châm biếm thư giãn đem lại tiếng cười vui vẻ."
  }
];

const seedGenres = async () => {
  try {
    const count = await Genre.countDocuments();
    if (count === 0) {
      await Genre.insertMany(initialGenres);
      console.log('✅ Khởi tạo thành công 10 thể loại mặc định cho NovelHub');
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo thể loại mặc định:', error);
  }
};

module.exports = seedGenres;

