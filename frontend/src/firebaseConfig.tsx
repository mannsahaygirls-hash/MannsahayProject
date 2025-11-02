// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC90YNOzxpfppXj5nwIUgvCQpNTY6_uShw",
  authDomain: "mann-be355.firebaseapp.com",
  projectId: "mann-be355",
  storageBucket: "mann-be355.firebasestorage.app",
  messagingSenderId: "828595776161",
  appId: "1:828595776161:web:95462285fccc5e398adee0",
  measurementId: "G-Y6XBNT90H3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export for use across app
export const auth = getAuth(app);
export const db = getFirestore(app);