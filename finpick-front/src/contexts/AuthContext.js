import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChange } from "../services/auth";

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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // 로그인 상태
        const idToken = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(idToken);

        // 로컬 스토리지에 상태 저장
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", firebaseUser.email);
      } else {
        // 로그아웃 상태
        setUser(null);
        setToken(null);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
