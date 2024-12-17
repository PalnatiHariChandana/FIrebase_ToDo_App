import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDtoe_I-GbTu2EsIUat9htsrFKb9Rm2vfg",
  authDomain: "to-do-ef98f.firebaseapp.com",
  databaseURL: "https://to-do-ef98f-default-rtdb.firebaseio.com",
  projectId: "to-do-ef98f",
  storageBucket: "to-do-ef98f.firebasestorage.app",
  messagingSenderId: "129210289950",
  appId: "1:129210289950:web:ffc1786e4931b154af030f",
  measurementId: "G-K53ST11J5K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };