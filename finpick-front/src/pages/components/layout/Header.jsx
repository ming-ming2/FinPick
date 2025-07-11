// finpick-front/src/components/layout/Header.jsx
import React, { useState } from "react";
import { ChevronDown, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { logout } from "../../../services/auth";

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/recommendations");
    } else {
      navigate("/login");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">₩</span>
            </div>
            <span className="text-xl font-bold">FinPick</span>
          </div>

          <nav className="hidden md:flex space-x-6 text-sm">
            <a
              href="#features"
              className="text-gray-400 hover:text-white transition-colors"
            >
              기능
            </a>
            <a
              href="#how-it-works"
              className="text-gray-400 hover:text-white transition-colors"
            >
              사용법
            </a>
            <a
              href="#faq"
              className="text-gray-400 hover:text-white transition-colors"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <button
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
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
                <button
                  className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
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
