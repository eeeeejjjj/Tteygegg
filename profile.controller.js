const userModel = require('../models/user.model');

const updateProfilePicture = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        const userId = req.user.id;
        const profilePictureUrl = req.file.path;

        await userModel.updateUserProfilePicture(userId, profilePictureUrl);

        const { contacts } = req.user;
        const onlineUsers = req.onlineUsers;
        const io = req.io;

        if (contacts && contacts.length > 0) {
            contacts.forEach(contactUsername => {
                const recipientSocketId = onlineUsers[contactUsername];
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('profile_updated', {
                        username: req.user.username,
                        newProfilePictureUrl: profilePictureUrl,
                    });
                }
            });
        }
        
        res.json({
            message: 'Profile picture updated successfully.',
            profilePictureUrl: profilePictureUrl,
        });
    } catch (error) {
        console.error('Profile picture update error:', error);
        res.status(500).json({ message: 'Server error while updating profile picture.' });
    }
};

module.exports = { updateProfilePicture };