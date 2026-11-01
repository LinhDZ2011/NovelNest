const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  penName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  novels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Thêm chỉ mục văn bản (text index) phục vụ chức năng tìm kiếm
authorSchema.index({ penName: 'text', bio: 'text' });

const Author = mongoose.model('Author', authorSchema);
module.exports = Author;
