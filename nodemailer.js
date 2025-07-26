const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chatx.otp@gmail.com', // Assuming this is the email address
        pass: 'ppyyplylefyteuxj', // Your Google App Password with spaces removed
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Nodemailer configuration error:', error);
    } else {
        console.log('Nodemailer is ready to send emails.');
    }
});

module.exports = transporter;