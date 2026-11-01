const mongoose = require('mongoose');

const novelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  coverPhoto: {
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  },
  introVideo: {
    url: {
      type: String,
    },
    publicId: {
      type: String,
    }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  },
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre'
  }],
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {
  timestamps: true
});

// Thêm chỉ mục văn bản (text index) phục vụ chức năng tìm kiếm
novelSchema.index({ title: 'text', description: 'text' });
// Chỉ mục lọc theo thể loại
novelSchema.index({ genres: 1 });

const Novel = mongoose.model('Novel', novelSchema);
module.exports = Novel;
