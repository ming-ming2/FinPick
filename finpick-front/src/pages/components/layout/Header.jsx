// finpick-front/src/pages/components/layout/Header.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
import { User, LogOut, ChevronDown, Sparkles } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isAuthenticated = !!user;

  const handleLogin = () => {
    navigate("/login");
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/recommendations");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
      console.log("✅ 로그아웃 성공");
      navigate("/");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
    }
  };

  return (
    <header className="bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src="/logo.png"
                alt="FinPick"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">FinPick</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate("/how-to-use")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              이용방법
            </button>
            <button
              onClick={() => navigate("/about")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              서비스 소개
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* 🔥 모바일에서 시작하기 버튼 숨김 */}
                <button
                  className="hidden md:inline-block bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                  onClick={handleGetStarted}
                >
                  시작하기
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    <span>{user?.displayName || user?.email || "사용자"}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700 py-1">
                      <button
                        onClick={() => {
                          navigate("/mypage");
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                      >
                        프로필
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                  onClick={handleLogin}
                >
                  로그인
                </button>
                {/* 🔥 모바일에서 시작하기 버튼 숨김 */}
                <button
                  className="hidden md:inline-block bg-white text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
                  onClick={handleGetStarted}
                >
                  시작하기
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
