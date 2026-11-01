const jwt = require("jsonwebtoken");
const User = require('../models/User');
const secret_key = process.env.jwt_secret;

const signupUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send("Yêu cầu không hợp lệ. Vui lòng điền đầy đủ thông tin.");
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                msg: "Email này đã được đăng ký tài khoản..."
            });
        }

        const newUser = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role: "user",
            authProvider: "local",
            userimage: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'
        });

        await newUser.save();

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json(userResponse);
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ msg: "Lỗi máy chủ nội bộ" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                msg: "Vui lòng nhập đầy đủ thông tin đăng nhập..."
            });
        }

        const identifier = email.trim();
        // Hỗ trợ đăng nhập linh hoạt bằng cả email hoặc tên đăng nhập (ví dụ: Admin123)
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { name: identifier }
            ]
        });

        if (!user) {
            return res.status(400).json({
                msg: "Tài khoản hoặc email không tồn tại trên hệ thống..."
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                msg: "Mật khẩu không chính xác..."
            });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, secret_key, { expiresIn: '1d' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // Thời hạn 1 ngày
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            msg: "Đăng nhập thành công...",
            token,
            userId: user._id,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ msg: "Lỗi máy chủ nội bộ" });
    }
};

const logoutUser = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    return res.status(200).json({
        msg: "Đăng xuất thành công..."
    });
};

module.exports = {
    signupUser,
    loginUser,
    logoutUser
};
