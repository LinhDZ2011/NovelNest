const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinaryConfig = require('../utils/cloudinaryConfig');
cloudinaryConfig(cloudinary);

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverPhoto') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover photos!'), false);
    }
  } else if (file.fieldname === 'introVideo') {
    const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format! Please upload MP4, WebM, or OGG video.'), false);
    }
  } else if (file.fieldname === 'image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for posts!'), false);
    }
  } else if (file.fieldname === 'avatar') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatar!'), false);
    }
  } else {
    cb(new Error('Unknown field name!'), false);
  }
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      if (file.fieldname === 'coverPhoto') return 'novel-hub/novelcovers';
      if (file.fieldname === 'introVideo') return 'novel-hub/introduction-videos';
      if (file.fieldname === 'avatar') return 'novel-hub/avatars';
      return 'novel-hub/posts';
    },
    public_id: () => uuidv4(),
    resource_type: (req, file) => 
      file.fieldname === 'introVideo' ? 'video' : 'image',
    format: (req, file) => file.mimetype.split('/')[1],
    transformation: (req, file) => {
      if (file.fieldname === 'coverPhoto') {
        return [
          { height: 600, width: 400, crop: 'fill' },
          { quality: 'auto' }
        ];
      }
      if (file.fieldname === 'avatar') {
        return [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ];
      }
      if (file.fieldname === 'image') {
        return [
          { max_width: 2048, max_height: 2048, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ];
      }
      return [{ quality: 'auto' }];
    }
  }
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // Giới hạn 50MB
  }
});

module.exports = upload;
