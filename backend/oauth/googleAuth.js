const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const secret_key = process.env.jwt_secret;

const googleAuthController = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, msg: "Không tìm thấy token xác thực" });
    }

    try {
      // Lấy thông tin người dùng trực tiếp từ Google API bằng access token
      const googleUserInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { email, sub: googleId, name, picture } = googleUserInfo.data;

      if (!email) {
        return res.status(400).json({ success: false, msg: "Google không cung cấp địa chỉ email" });
      }

      // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
      let user = await User.findOne({ email });

      if (user) {
        user.password = googleId + secret_key;
        user.userimage = picture || user.userimage;
        user.name = name || user.name;
        user.authProvider = 'google';
        await user.save();
      } else {
        const password = googleId + secret_key; // Tạo mật khẩu ngẫu nhiên an toàn
        user = new User({
          name,
          email,
          password,
          role: 'user',
          authProvider: 'google',
          userimage: picture,
        });
        await user.save();
      }

      // Khởi tạo mã JWT token
      const authToken = jwt.sign(
        { userId: user._id, role: user.role },
        secret_key,
        { expiresIn: '1d' }
      );

      // Thiết lập cookie an toàn
      res.cookie("token", authToken);

      // Chuẩn bị dữ liệu phản hồi (loại bỏ trường password)
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(200).json({
        success: true,
        msg: "Đăng nhập bằng tài khoản Google thành công",
        token: authToken,
        userId: user._id,
        user: userResponse,
      });

    } catch (googleError) {
      console.error('Google API Error:', googleError.response?.data || googleError.message);
      return res.status(401).json({ 
        success: false, 
        msg: "Xác thực token Google thất bại",
        error: process.env.NODE_ENV !== 'production' ? googleError.message : undefined
      });
    }

  } catch (error) {
    console.error('Auth controller error:', error);

    // Gửi thông tin lỗi chi tiết trong môi trường phát triển (development)
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({
        success: false,
        msg: "Quá trình xác thực thất bại",
        error: error.message,
        stack: error.stack,
      });
    }

    // Phản hồi lỗi chung cho môi trường production
    return res.status(500).json({
      success: false,
      msg: "Quá trình xác thực thất bại",
    });
  }
};

module.exports = googleAuthController;
module.exports.googleAuthController = googleAuthController;
