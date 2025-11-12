// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyBWYmTXDypcROQT4KaJ-ESdd2Zo63PtdMs",
    authDomain: "quranic-2c7f5.firebaseapp.com",
    projectId: "quranic-2c7f5",
    storageBucket: "quranic-2c7f5.appspot.com",
    messagingSenderId: "223816906279",
    appId: "1:223816906279:web:8f681d4ad394a59df6c002",
    measurementId: "G-TFDTVGHQX1"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get a Firestore instance
export const db = getFirestore(app);

// Get an Auth instance
export const auth = getAuth(app);