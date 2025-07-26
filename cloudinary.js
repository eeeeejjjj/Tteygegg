const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuration with secrets embedded
cloudinary.config({
  cloud_name: 'dadkpyl0y',
  api_key: '171679734166967',
  api_secret: 'Cyk3vLJoOvLy7DD_5685skwaoBk',
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat_app_profiles', // Folder in Cloudinary to store images
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };