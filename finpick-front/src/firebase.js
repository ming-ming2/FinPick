import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4iyLasJh-eAS2ycDs3uPLCpUNXyBRHTU",
  authDomain: "finpick-e11a2.firebaseapp.com",
  projectId: "finpick-e11a2",
  storageBucket: "finpick-e11a2.firebasestorage.app",
  messagingSenderId: "945243288094",
  appId: "1:945243288094:web:d98fcb29e7f2f2a7e7740f",
  measurementId: "G-YZ3HJCZLBH",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
