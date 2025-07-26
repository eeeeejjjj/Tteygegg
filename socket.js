const jwt = require('jsonwebtoken');
const messageModel = require('../models/message.model');
const { deliverPendingMessages } = require('../controllers/chat.controller');

// Hardcoded JWT Secret
const JWT_SECRET = "a_very_strong_and_secret_key_for_your_app_32_chars_long";

// In-memory stores
const onlineUsers = {}; // { username: socketId }
const socketIdToUsername = {}; // { socketId: username }
const missedCalls = {}; // { username: ['caller1', 'caller2'] }

const initializeSocket = (io) => {

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('authenticate', (token) => {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                const { username } = decoded;

                console.log(`User ${username} authenticated with socket ${socket.id}`);
                onlineUsers[username] = socket.id;
                socketIdToUsername[socket.id] = username;
                
                socket.emit('authenticated', { status: 'success' });

                deliverPendingMessages(io, socket, username);
                if (missedCalls[username] && missedCalls[username].length > 0) {
                    missedCalls[username].forEach(caller => {
                        socket.emit('missed_call', { from: caller });
                    });
                    delete missedCalls[username];
                }

            } catch (error) {
                console.log(`Authentication failed for socket ${socket.id}:`, error.message);
                socket.emit('unauthorized', { message: 'Authentication failed.' });
                socket.disconnect();
            }
        });

        socket.on('private_message', async (data) => {
            const { to, message } = data;
            const from = socketIdToUsername[socket.id];

            if (!from) return;

            const recipientSocketId = onlineUsers[to];

            const messagePayload = {
                from,
                to,
                type: message.type,
                content: message.content,
                timestamp: new Date().toISOString()
            };

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('private_message', messagePayload);
            } else {
                console.log(`User ${to} is offline. Caching message from ${from}.`);
                await messageModel.saveOfflineMessage({
                    from,
                    to,
                    type: message.type,
                    content: message.content,
                    cloudinaryPublicId: message.cloudinaryPublicId || null,
                });
            }
        });

        const handleWebrtcEvent = (eventName) => {
            socket.on(eventName, (data) => {
                const { to, ...payload } = data;
                const from = socketIdToUsername[socket.id];
                const recipientSocketId = onlineUsers[to];

                if (recipientSocketId) {
                    io.to(recipientSocketId).emit(eventName, { from, ...payload });
                } else if (eventName === 'webrtc_offer') {
                    if (!missedCalls[to]) {
                        missedCalls[to] = [];
                    }
                    if (!missedCalls[to].includes(from)) {
                        missedCalls[to].push(from);
                    }
                    socket.emit('call_failed', { to, reason: 'User is offline' });
                }
            });
        };

        handleWebrtcEvent('webrtc_offer');
        handleWebrtcEvent('webrtc_answer');
        handleWebrtcEvent('webrtc_ice_candidate');

        socket.on('disconnect', () => {
            const username = socketIdToUsername[socket.id];
            if (username) {
                console.log(`User ${username} disconnected.`);
                delete onlineUsers[username];
                delete socketIdToUsername[socket.id];
            }
        });
    });

    return { onlineUsers, socketIdToUsername };
};

module.exports = initializeSocket;