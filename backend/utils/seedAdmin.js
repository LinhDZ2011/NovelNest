const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = 'Admin123@novelhub.com';
    const adminName = 'Admin123';
    const adminPassword = 'Admin123';

    let admin = await User.findOne({
      $or: [
        { email: adminEmail.toLowerCase() },
        { name: adminName }
      ]
    });

    if (!admin) {
      admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        authProvider: 'local',
        userimage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
      });
      await admin.save();
      console.log('✅ Khởi tạo tài khoản Admin mặc định thành công: Admin123 / Admin123');
    } else {
      let needsSave = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        needsSave = true;
      }
      if (admin.authProvider !== 'local') {
        admin.authProvider = 'local';
        needsSave = true;
      }
      if (needsSave) {
        await admin.save();
        console.log('✅ Đã cập nhật quyền admin cho tài khoản:', admin.email);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo tài khoản Admin:', error);
  }
};

module.exports = seedAdmin;
