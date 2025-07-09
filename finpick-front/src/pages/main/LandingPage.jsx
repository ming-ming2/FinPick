import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Shield,
  Target,
  TrendingUp,
  Star,
  Users,
  CreditCard,
  Search,
  Zap,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NicknameModal from "../components/NicknameModal";

const FinPickLanding = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [showNicknameModal, setShowNicknameModal] = useState(false); // 닉네임 모달 상태
  const [userNickname, setUserNickname] = useState(""); // 사용자 닉네임
  const [showProfileMenu, setShowProfileMenu] = useState(false); // 프로필 메뉴

  // 페이지 로드 시 로그인 상태 확인 (실제로는 localStorage나 Context에서 가져올 예정)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromOnboarding = urlParams.get("from") === "onboarding";
    const storedLoginState = localStorage.getItem("isLoggedIn");

    if (fromOnboarding && storedLoginState === "true") {
      setIsLoggedIn(true);
      setShowNicknameModal(true); // 온보딩에서 왔으면 닉네임 모달 띄우기
    } else if (storedLoginState === "true") {
      setIsLoggedIn(true);
      setUserNickname(localStorage.getItem("userNickname") || "사용자");
    }
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // 네비게이션 핸들러들
  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/recommendations"); // 로그인된 상태면 추천 페이지로
    } else {
      navigate("/login"); // 로그인 안된 상태면 로그인 페이지로
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserNickname("");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userNickname");
    setShowProfileMenu(false);
  };

  const handleNicknameSubmit = (nickname) => {
    setUserNickname(nickname);
    setShowNicknameModal(false);
    localStorage.setItem("userNickname", nickname);
    // 여기서 실제 API 호출해서 닉네임 저장
  };

  const handleNicknameModalClose = () => {
    setShowNicknameModal(false);
    setUserNickname("사용자"); // 기본값 설정
  };

  const faqData = [
    {
      question: "정말 광고 없이 중립적으로 추천해주나요?",
      answer:
        "네, FinPick은 금융사로부터 수수료를 받지 않습니다. 오직 사용자에게 가장 적합한 상품만을 추천합니다.",
    },
    {
      question: "추천 기준은 무엇인가요?",
      answer:
        "금리, 가입조건, 사용자 프로필, 투자성향 등을 종합적으로 분석하여 AI가 맞춤 추천을 제공합니다.",
    },
    {
      question: "추천 상품은 어떻게 업데이트되나요?",
      answer:
        "금융감독원 공식 API를 통해 실시간으로 최신 상품 정보를 업데이트합니다.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 닉네임 모달 */}
      <NicknameModal
        isOpen={showNicknameModal}
        onClose={handleNicknameModalClose}
        onSubmit={handleNicknameSubmit}
      />

      {/* Header */}
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
              {isLoggedIn ? (
                // 로그인된 상태
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
                      <span>{userNickname}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700 py-1">
                        <button
                          onClick={() => setShowNicknameModal(true)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          닉네임 변경
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
                // 로그인 안된 상태
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

      {/* Hero + Features Combined */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Sparkles className="w-3 h-3 text-emerald-400 mr-2" />
                <span className="text-emerald-400 text-xs font-medium">
                  AI 기반 맞춤형 금융 추천
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  나에게 딱 맞는
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  금융상품 찾기
                </span>
              </h1>

              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                복잡한 조건 입력 없이 자연어로 말해보세요.
                <br />
                AI가 340개+ 상품 중에서 당신에게 딱 맞는 것만 골라드립니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-8 py-3 rounded-lg text-lg font-bold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  onClick={handleGetStarted}
                >
                  <span>{isLoggedIn ? "추천 받기" : "지금 시작하기"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border border-gray-700 text-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition-all">
                  사용법 보기
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>5.0 평점</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>10,000+ 사용자</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>100% 중립</span>
                </div>
              </div>
            </div>

            {/* Right: How It Works */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  3단계로 끝나는 간단한 과정
                </span>
              </h2>

              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "목적 입력",
                    description: "자연어로 원하는 것을 말해보세요",
                    color: "emerald",
                  },
                  {
                    step: "02",
                    title: "AI 분석",
                    description: "340개+ 상품에서 최적 매칭",
                    color: "cyan",
                  },
                  {
                    step: "03",
                    title: "맞춤 추천",
                    description: "적합도와 이유까지 명확하게",
                    color: "blue",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 rounded-lg flex items-center justify-center text-gray-900 text-sm font-bold flex-shrink-0`}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                왜 FinPick을 선택해야 할까요?
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              기존 금융 서비스와는 다른 차별화된 경험을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-8 h-8 text-emerald-400" />,
                title: "맞춤형 추천",
                description: "AI가 분석한 당신의 프로필에 딱 맞는 상품만 추천",
                highlight: "95% 적합도",
              },
              {
                icon: <Shield className="w-8 h-8 text-cyan-400" />,
                title: "100% 중립",
                description: "광고 없이 오직 사용자를 위한 객관적 추천",
                highlight: "수수료 없음",
              },
              {
                icon: <Zap className="w-8 h-8 text-blue-400" />,
                title: "빠른 결과",
                description: "복잡한 조건 입력 없이 30초 만에 추천 완료",
                highlight: "30초 완료",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-400 text-xs font-medium">
                    {feature.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                자주 묻는 질문
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800/30 rounded-2xl border border-gray-700/50"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {faq.question}
                  </h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50 mt-12">
            <h3 className="text-2xl font-bold text-white mb-4">
              지금 바로 시작해보세요
            </h3>
            <p className="text-gray-400 mb-6">
              이미 수천 명이 FinPick으로 더 나은 금융 상품을 찾았습니다
            </p>
            <button
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-8 py-3 rounded-lg text-lg font-bold hover:shadow-lg transition-all"
              onClick={handleGetStarted}
            >
              {isLoggedIn ? "추천 받기" : "무료로 시작하기"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">₩</span>
              </div>
              <span className="text-xl font-bold">FinPick</span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              AI 기반 맞춤형 금융상품 추천 서비스
            </p>
            <p className="text-gray-500 text-xs">
              © 2025 FinPick. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FinPickLanding;
