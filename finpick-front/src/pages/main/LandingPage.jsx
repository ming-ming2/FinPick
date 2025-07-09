import React, { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinPickLanding = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // 네비게이션 핸들러들
  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login"); // 로그인 버튼 클릭 시 로그인 페이지로 이동
  };

  const handleGetRecommendation = () => {
    navigate("/recommendation"); // '지금 추천받기' 버튼 클릭 시 추천 페이지로 이동
  };

  const handleHowItWorks = () => {
    navigate("/how-it-works"); // '사용법 보기' 버튼 클릭 시 사용법 페이지로 이동
  };

  const handleViewDetails = () => {
    navigate("/details"); // '상세 비교 보기' 버튼 클릭 시 상세 비교 페이지로 이동
  };

  const handleFreeRecommendation = () => {
    navigate("/recommendation"); // '무료로 추천받기' 버튼 클릭 시 추천 페이지로 이동
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
              <button
                className="text-gray-400 hover:text-white text-sm transition-colors"
                onClick={handleLogin} // 로그인 버튼에 handleLogin 핸들러 연결
              >
                로그인
              </button>
              <button
                className="bg-white text-gray-900 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all"
                onClick={handleGetStarted} // 시작하기 버튼에 handleGetStarted 핸들러 연결
              >
                시작하기
              </button>
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

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  className="group bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center"
                  onClick={handleGetRecommendation} // 지금 추천받기 버튼에 handleGetRecommendation 핸들러 연결
                >
                  지금 추천받기
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  className="border border-gray-700 text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
                  onClick={handleHowItWorks} // 사용법 보기 버튼에 handleHowItWorks 핸들러 연결
                >
                  사용법 보기
                </button>
              </div>

              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Zap className="w-4 h-4" />, text: "30초 추천" },
                  { icon: <Shield className="w-4 h-4" />, text: "중립적 분석" },
                  { icon: <Target className="w-4 h-4" />, text: "맞춤 상품" },
                  {
                    icon: <TrendingUp className="w-4 h-4" />,
                    text: "실시간 데이터",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm text-gray-400"
                  >
                    <div className="text-emerald-400">{item.icon}</div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Interactive Demo */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-500">FinPick AI</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-2">입력 예시:</div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-300 text-sm">
                          "월 50만원씩 2년간 안전하게 모으고 싶어요"
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-2">
                      AI 추천 결과:
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white/5 border border-gray-700/50 rounded-xl p-3 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-white text-sm mb-1">
                              KB국민은행 정기적금
                            </div>
                            <div className="text-xs text-gray-400">
                              월 50만원 • 24개월
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-1"></div>
                              <span className="text-xs text-emerald-400">
                                적합도 98%
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-400">
                              3.2%
                            </div>
                            <div className="text-xs text-gray-500">연이율</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 border border-gray-700/50 rounded-xl p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-white text-sm mb-1">
                              신한은행 쌓이는적금
                            </div>
                            <div className="text-xs text-gray-400">
                              월 50만원 • 24개월
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-1"></div>
                              <span className="text-xs text-cyan-400">
                                적합도 92%
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-cyan-400">
                              3.0%
                            </div>
                            <div className="text-xs text-gray-500">연이율</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full mt-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all"
                  onClick={handleViewDetails} // 상세 비교 보기 버튼에 handleViewDetails 핸들러 연결
                >
                  상세 비교 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works + Social Proof */}
      <section className="py-16 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* How It Works */}
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

            {/* Social Proof */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6">
                사용자들의 이야기
              </h3>
              <div className="space-y-4">
                {[
                  {
                    name: "김민수",
                    role: "직장인",
                    content: "30초 만에 딱 맞는 예금 상품 찾았어요!",
                    rating: 5,
                  },
                  {
                    name: "이지은",
                    role: "프리랜서",
                    content: "복잡한 조건 비교 없이 바로 추천받아서 편해요.",
                    rating: 5,
                  },
                  {
                    name: "박준호",
                    role: "대학생",
                    content: "금융 초보도 이해하기 쉽게 설명해줘요.",
                    rating: 5,
                  },
                ].map((review, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                          <span className="text-gray-900 font-bold text-xs">
                            {review.name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">
                            {review.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {review.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">"{review.content}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section className="py-16 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                자주 묻는 질문
              </span>
            </h2>
          </div>

          <div className="space-y-3 mb-12">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800/30 rounded-xl border border-gray-700/30 overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700/20 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-white">{faq.question}</span>
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
          <div className="text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-4">
              지금 바로 시작해보세요
            </h3>
            <p className="text-gray-400 mb-6">
              이미 수천 명이 FinPick으로 더 나은 금융 상품을 찾았습니다
            </p>
            <button
              className="bg-white text-gray-900 px-8 py-3 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all"
              onClick={handleFreeRecommendation} // 무료로 추천받기 버튼에 handleFreeRecommendation 핸들러 연결
            >
              무료로 추천받기
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
