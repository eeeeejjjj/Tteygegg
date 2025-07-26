const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const initializeSocket = require('./services/socket');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();
const server = http.createServer(app);

// CORS configuration for Express and Socket.IO
const corsOptions = {
    origin: "*", // Allows all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
    cors: corsOptions,
});

// Make io instance available to routes
const { onlineUsers, socketIdToUsername } = initializeSocket(io);
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    req.socketIdToUsername = socketIdToUsername;
    next();
});

// Routes
app.get('/', (req, res) => {
    res.send('Chat App Server is running!');
});
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

const PORT = 3001; // Hardcoded port
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});