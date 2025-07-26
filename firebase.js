const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// Your web app's Firebase configuration with secrets embedded
const firebaseConfig = {
  apiKey: "AIzaSyAIXm9_iJMGQKXd7fL4WVckq85CQQPH3eQ",
  authDomain: "chattrix-d2897.firebaseapp.com",
  projectId: "chattrix-d2897",
  storageBucket: "chattrix-d2897.appspot.com", // This should be chattrix-d2897.firebaseapp.com if that's the domain
  messagingSenderId: "630181045497",
  appId: "1:630181045497:web:0eaf3cb598712ad19c2e28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase Firestore connected successfully.");

module.exports = db;