require('dotenv').config();

const express = require('express');
const app = express();
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cors = require('cors');
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
    credentials: true
}));
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/introduction-videos', express.static(path.join(__dirname, 'public', 'introduction-videos')));

// Kết nối cơ sở dữ liệu MongoDB & Khởi tạo tài khoản Admin + Thể loại mặc định
const connectDB = require('./middlewares/dbConnection');
const seedAdmin = require('./utils/seedAdmin');
const seedGenres = require('./utils/seedGenres');

connectDB().then(async () => {
    await seedAdmin();
    await seedGenres();
});

const port = process.env.PORT || 5000;

const userRouter = require('./routes/userRouter');
const authRouter = require('./routes/authRouter');
const postRouter = require('./routes/postRouter');
const authorRouter = require('./routes/authorRouter');
const novelRouter = require('./routes/novelRouter');
const gAuthRouter = require('./routes/googleAuthRouter');
const chapterRouter = require('./routes/chapterRouter');
const novelReviewsRouter = require('./routes/novelReviewsRouter');
const adminRouter = require('./routes/adminRouter');
const genreRouter = require('./routes/genreRouter');

// Các tuyến đường API hệ thống
app.use('/api/auth', authRouter);
app.use('/api/oauth', gAuthRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/authors', authorRouter);
app.use('/api/novels', novelRouter);
app.use('/api/chapters', chapterRouter);
app.use('/api/novel-reviews', novelReviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/genres', genreRouter);

// Điểm kiểm tra trạng thái hoạt động của server (Health check)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server đang hoạt động bình thường' });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Đã có lỗi xảy ra từ máy chủ!' });
});

// Khởi chạy máy chủ HTTP
const server = app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});

// Xử lý các Promise bị từ chối chưa được bắt (Unhandled Rejection)
process.on('unhandledRejection', (err) => {
    console.error('Lỗi Unhandled Promise Rejection:', err);
    // Đóng server và thoát tiến trình an toàn
    server.close(() => process.exit(1));
});
