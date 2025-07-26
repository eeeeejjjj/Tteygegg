const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

// Hardcoded JWT Secret
const JWT_SECRET = "a_very_strong_and_secret_key_for_your_app_32_chars_long";

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from the token (excluding the password)
            req.user = await userModel.findUserByUsername(decoded.username);
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            delete req.user.password;

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };