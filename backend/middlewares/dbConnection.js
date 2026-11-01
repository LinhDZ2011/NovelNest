const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Xử lý các sự kiện lỗi phát sinh sau khi đã kết nối
        mongoose.connection.on('error', (err) => {
            console.error(`Lỗi kết nối MongoDB: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('Mất kết nối MongoDB. Đang thử kết nối lại...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('Đã kết nối lại thành công với MongoDB');
        });

        // Xử lý đóng kết nối an toàn khi tiến trình ứng dụng kết thúc
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('Đã đóng kết nối MongoDB khi tắt ứng dụng');
                process.exit(0);
            } catch (err) {
                console.error('Lỗi khi đóng kết nối MongoDB:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error(`Lỗi kết nối cơ sở dữ liệu MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
