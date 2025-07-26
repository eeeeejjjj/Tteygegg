const { collection, doc, getDoc, setDoc, getDocs, query, where, updateDoc, deleteDoc } = require('firebase/firestore');
const db = require('../config/firebase');

const usersCollection = collection(db, 'users');
const pendingUsersCollection = collection(db, 'pending_users');

const findUserByEmail = async (email) => {
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
};

const findUserByUsername = async (username) => {
    const q = query(usersCollection, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
};

const createPendingUser = async (userData) => {
    const userRef = doc(pendingUsersCollection, userData.email);
    await setDoc(userRef, userData);
};

const findPendingUserByEmail = async (email) => {
    const userRef = doc(pendingUsersCollection, email);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    return null;
};

const createUser = async (userData) => {
    const userRef = doc(usersCollection); // Auto-generates ID
    const newUser = {
        userId: userRef.id,
        ...userData,
        profilePictureUrl: '',
        contacts: [],
        createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, newUser);
    return newUser;
};

const deletePendingUser = async (email) => {
    const userRef = doc(pendingUsersCollection, email);
    await deleteDoc(userRef);
};

const updateUserProfilePicture = async (userId, profilePictureUrl) => {
    const userRef = doc(usersCollection, userId);
    await updateDoc(userRef, { profilePictureUrl });
};

module.exports = {
    findUserByEmail,
    findUserByUsername,
    createPendingUser,
    findPendingUserByEmail,
    createUser,
    deletePendingUser,
    updateUserProfilePicture,
};