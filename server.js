require('dotenv').config(); // Still useful for Render's environment variables if you switch back
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const initializeSocket = require('./services/socket');
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');

const app = express();
const server = http.createServer(app);

// =========================================================================
// === CRITICAL FIX: MORE ROBUST CORS MIDDLEWARE FOR LIVE DEPLOYMENT ===
// This replaces the old app.use(cors(corsOptions))
app.use((req, res, next) => {
    // Allow any origin to access the server
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Define the HTTP methods the server will accept
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // Define the headers the server will accept
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // The browser sends an OPTIONS request first to check the CORS policy.
    // We must respond with a 200 OK status to this preflight request.
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});
// =========================================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for WebSocket connections
        methods: ["GET", "POST"]
    },
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
    res.send('Chat App Server is running! (CORS Fix Applied)');
});
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: 'Something went wrong!' });
});

// Use the port provided by Render or default to 3001
const PORT = process.env.PORT || 3001; 
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});