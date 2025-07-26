const messageModel = require('../models/message.model');
const { cloudinary } = require('../config/cloudinary');

const deliverPendingMessages = async (io, socket, username) => {
    try {
        const messages = await messageModel.getPendingMessagesForUser(username);
        if (messages.length === 0) return;

        console.log(`Delivering ${messages.length} pending messages to ${username}`);

        for (const msg of messages) {
            socket.emit('pending_message', msg, async (ack) => {
                if (ack === 'ok') {
                    console.log(`Message ${msg.messageId} delivered to ${username}. Deleting.`);
                    await messageModel.deletePendingMessage(msg.messageId);

                    if (msg.type === 'media' && msg.cloudinaryPublicId) {
                        await cloudinary.uploader.destroy(msg.cloudinaryPublicId);
                        console.log(`Deleted media ${msg.cloudinaryPublicId} from Cloudinary.`);
                    }
                }
            });
        }
    } catch (error) {
        console.error(`Error delivering pending messages for ${username}:`, error);
    }
};

module.exports = { deliverPendingMessages };