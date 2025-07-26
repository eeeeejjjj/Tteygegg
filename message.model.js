const { collection, query, where, getDocs, addDoc, deleteDoc, doc } = require('firebase/firestore');
const db = require('../config/firebase');

const messagesCollection = collection(db, 'pendingMessages');

const saveOfflineMessage = async (messageData) => {
    await addDoc(messagesCollection, {
        ...messageData,
        createdAt: new Date().toISOString(),
    });
};

const getPendingMessagesForUser = async (username) => {
    const q = query(messagesCollection, where("to", "==", username));
    const querySnapshot = await getDocs(q);
    const messages = [];
    querySnapshot.forEach((doc) => {
        messages.push({ messageId: doc.id, ...doc.data() });
    });
    return messages;
};

const deletePendingMessage = async (messageId) => {
    const messageRef = doc(messagesCollection, messageId);
    await deleteDoc(messageRef);
};

module.exports = {
    saveOfflineMessage,
    getPendingMessagesForUser,
    deletePendingMessage,
};