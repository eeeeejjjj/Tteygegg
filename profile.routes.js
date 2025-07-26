const express = require('express');
const router = express.Router();
const { updateProfilePicture } = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');

router.put('/picture', protect, upload.single('profilePicture'), updateProfilePicture);

module.exports = router;