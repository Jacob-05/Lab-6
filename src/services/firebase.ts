// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBw9cubz288QPT8qQYx-T421dt1y6-wffw",
  authDomain: "dca-lab6-a00402766.firebaseapp.com",
  projectId: "dca-lab6-a00402766",
  storageBucket: "dca-lab6-a00402766.firebasestorage.app",
  messagingSenderId: "668206951397",
  appId: "1:668206951397:web:96b38c7dd4c43f163e9d0c",
  measurementId: "G-6RL58JY800"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);