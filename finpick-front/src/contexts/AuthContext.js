//finpick-front/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserService } from "../services/userService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          // 🔥 토큰 가져와서 localStorage에 저장
          try {
            const token = await firebaseUser.getIdToken();
            localStorage.setItem("authToken", token);
            console.log(
              "✅ AuthContext에서 토큰 저장:",
              token.substring(0, 20) + "..."
            );
          } catch (tokenError) {
            console.error("❌ 토큰 저장 실패:", tokenError);
          }

          // Firestore에서 사용자 프로필 실시간 구독
          const userDocRef = doc(db, "users", firebaseUser.uid);

          const unsubscribeProfile = onSnapshot(
            userDocRef,
            (doc) => {
              if (doc.exists()) {
                setUserProfile(doc.data());
              } else {
                // 프로필이 없으면 생성 (신규 사용자)
                UserService.createUserProfile(firebaseUser)
                  .then((profile) => {
                    setUserProfile(profile);
                  })
                  .catch((err) => {
                    console.error("프로필 생성 실패:", err);
                    setError(err.message);
                  });
              }
            },
            (err) => {
              console.error("프로필 구독 실패:", err);
              setError(err.message);
            }
          );

          // 컴포넌트 언마운트시 프로필 구독 해제
          return () => unsubscribeProfile();
        } else {
          // 🔥 로그아웃 시 토큰 제거
          localStorage.removeItem("authToken");
          console.log("✅ AuthContext에서 토큰 제거");

          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error("인증 상태 변경 처리 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  const logout = async () => {
    try {
      // 🔥 로그아웃 시 토큰 제거
      localStorage.removeItem("authToken");
      console.log("✅ 로그아웃: 토큰 제거");

      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setError(null);
    } catch (err) {
      console.error("로그아웃 실패:", err);
      setError(err.message);
      throw err;
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;

    try {
      const profile = await UserService.getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (err) {
      console.error("프로필 새로고침 실패:", err);
      setError(err.message);
    }
  };

  // 🔥 토큰 갱신 함수 추가
  const refreshToken = async () => {
    if (!user) return null;

    try {
      const token = await user.getIdToken(true); // force refresh
      localStorage.setItem("authToken", token);
      console.log(
        "✅ AuthContext에서 토큰 갱신:",
        token.substring(0, 20) + "..."
      );
      return token;
    } catch (err) {
      console.error("토큰 갱신 실패:", err);
      setError(err.message);
      return null;
    }
  };

  const value = {
    user,
    userProfile,
    isAuthenticated: !!user,
    loading,
    error,
    logout,
    refreshUserProfile,
    refreshToken, // 🔥 토큰 갱신 함수 추가
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
