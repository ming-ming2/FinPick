// finpick-front/src/firebase.js
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

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 인증 및 Firestore 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);

// 개발 환경에서 설정 확인
if (import.meta.env.DEV) {
  console.log("🔥 Firebase 클라이언트 초기화 완료");
  console.log("📋 Project ID:", firebaseConfig.projectId);
}
