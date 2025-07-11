// 📁 finpick-front/src/components/Header.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LogOut,
  User,
  Settings,
  Bell,
  ChevronDown,
  Home,
  TrendingUp,
  Target,
  BarChart3,
} from "lucide-react";

const Header = ({
  showProfile = true,
  showNav = true,
  className = "",
  variant = "default", // "default", "minimal", "landing"
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  // 네비게이션 메뉴 설정
  const navItems = [
    { path: "/dashboard", name: "대시보드", icon: Home },
    { path: "/recommendations", name: "상품추천", icon: TrendingUp },
    { path: "/mypage", name: "마이페이지", icon: User },
    { path: "/analytics", name: "분석", icon: BarChart3 },
  ];

  // 현재 페이지 체크
  const isActivePage = (path) => location.pathname === path;

  // 랜딩 페이지용 헤더
  if (variant === "landing") {
    return (
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50 ${className}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-3">
            <div
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform"
            >
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
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400 hidden sm:block">
                    {userProfile?.nickname || user.email?.split("@")[0]}님
                  </span>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    대시보드
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  시작하기
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 미니멀 헤더 (로그인 페이지 등)
  if (variant === "minimal") {
    return (
      <header className={`py-6 ${className}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform w-fit"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">₩</span>
            </div>
            <span className="text-xl font-bold">FinPick</span>
          </div>
        </div>
      </header>
    );
  }

  // 기본 헤더 (앱 내부용)
  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50 ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          {/* 로고 */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">₩</span>
            </div>
            <span className="text-xl font-bold">FinPick</span>
          </div>

          {/* 네비게이션 메뉴 */}
          {showNav && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActivePage(item.path)
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
          )}

          {/* 프로필 영역 */}
          {showProfile && user && (
            <div className="flex items-center space-x-4">
              {/* 알림 아이콘 */}
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </button>

              {/* 프로필 드롭다운 */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-400 to-cyan-400 p-0.5">
                    <div className="w-full h-full rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="프로필"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">
                      {userProfile?.nickname || user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-400">
                      {userProfile?.investmentProfile?.riskLevel?.name ||
                        "투자 입문자"}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* 드롭다운 메뉴 */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-2 z-50">
                    {/* 프로필 정보 */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="font-medium">{userProfile?.nickname}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded">
                          {userProfile?.investmentProfile?.riskLevel?.emoji}{" "}
                          {userProfile?.investmentProfile?.riskLevel?.name}
                        </span>
                      </div>
                    </div>

                    {/* 메뉴 아이템들 */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate("/mypage");
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-800 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span>마이페이지</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate("/settings");
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-800 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span>설정</span>
                      </button>

                      <hr className="my-2 border-gray-700" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-800 transition-colors text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 로그인 안 한 경우 */}
          {showProfile && !user && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/login")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                로그인
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-4 py-2 rounded-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                시작하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 네비게이션 (선택사항) */}
      {showNav && (
        <div className="md:hidden border-t border-gray-800">
          <div className="flex items-center justify-around py-2">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                  isActivePage(item.path) ? "text-emerald-400" : "text-gray-400"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
