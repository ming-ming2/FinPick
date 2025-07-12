import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

const API_BASE_URL = "http://localhost:8000/api";

// Google 로그인 provider
const googleProvider = new GoogleAuthProvider();

// 이메일/비밀번호 로그인
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await userCredential.user.getIdToken();

    // 🔥 토큰을 localStorage에 저장
    localStorage.setItem("authToken", token);
    console.log("✅ 토큰 저장 완료:", token.substring(0, 20) + "...");

    // 백엔드에 토큰 검증 요청
    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return { user: userCredential.user, token, userData };
    }

    throw new Error("Token verification failed");
  } catch (error) {
    throw error;
  }
};

// Google 로그인
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();

    // 🔥 토큰을 localStorage에 저장
    localStorage.setItem("authToken", token);
    console.log("✅ Google 토큰 저장 완료:", token.substring(0, 20) + "...");

    // 백엔드에 토큰 검증 요청
    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return { user: result.user, token, userData };
    }

    throw new Error("Token verification failed");
  } catch (error) {
    throw error;
  }
};

// 회원가입
export const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await userCredential.user.getIdToken();

    // 🔥 토큰을 localStorage에 저장
    localStorage.setItem("authToken", token);
    console.log("✅ 회원가입 토큰 저장 완료:", token.substring(0, 20) + "...");

    return { user: userCredential.user, token };
  } catch (error) {
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    // 🔥 localStorage에서 토큰 제거
    localStorage.removeItem("authToken");
    console.log("✅ 토큰 제거 완료");

    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// 토큰 갱신 함수 추가
export const refreshAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true); // force refresh
      localStorage.setItem("authToken", token);
      console.log("✅ 토큰 갱신 완료:", token.substring(0, 20) + "...");
      return token;
    }
    return null;
  } catch (error) {
    console.error("❌ 토큰 갱신 실패:", error);
    return null;
  }
};

// 로그인 상태 변경 감지
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
