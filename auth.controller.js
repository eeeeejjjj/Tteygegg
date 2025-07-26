const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userModel = require('../models/user.model');
const transporter = require('../config/nodemailer');

// Hardcoded JWT Secret
const JWT_SECRET = "a_very_strong_and_secret_key_for_your_app_32_chars_long";
const EMAIL_USER = 'chatx.otp@gmail.com'; // Assuming this is the from email

// Generate a secure 6-digit OTP
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// Generate JWT
const generateToken = (username) => {
    return jwt.sign({ username }, JWT_SECRET, {
        expiresIn: '30d',
    });
};

const signup = async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const existingUser = await userModel.findUserByEmail(email) || await userModel.findUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email or username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await userModel.createPendingUser({ email, username, hashedPassword, otp, otpExpiresAt });

        // Send OTP email
        await transporter.sendMail({
            from: `"ChatX App" <${EMAIL_USER}>`,
            to: email,
            subject: 'Your Verification Code for ChatX',
            html: `<p>Your One-Time Password (OTP) for ChatX is: <strong>${otp}</strong></p><p>It is valid for 24 hours.</p>`,
        });

        res.status(201).json({ message: 'Signup successful. Please check your email for the OTP to verify your account.' });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
};

const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    try {
        const pendingUser = await userModel.findPendingUserByEmail(email);

        if (!pendingUser) {
            return res.status(404).json({ message: 'Verification failed. User not found or already verified.' });
        }

        if (pendingUser.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        if (new Date() > new Date(pendingUser.otpExpiresAt)) {
            return res.status(400).json({ message: 'OTP has expired.' });
        }

        const { username, hashedPassword } = pendingUser;
        const newUser = await userModel.createUser({ email, username, password: hashedPassword });

        await userModel.deletePendingUser(email);

        res.status(201).json({
            message: 'Account verified successfully!',
            token: generateToken(newUser.username),
            user: {
                userId: newUser.userId,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                message: "Login successful",
                token: generateToken(user.username),
                user: {
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    profilePictureUrl: user.profilePictureUrl,
                    contacts: user.contacts
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = { signup, verifyOtp, login };