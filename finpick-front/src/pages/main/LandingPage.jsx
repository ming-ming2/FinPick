// finpick-front/src/pages/main/FinPickLanding.jsx
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Shield,
  Target,
  TrendingUp,
  Search,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const FinPickLanding = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/recommendations");
    } else {
      navigate("/login");
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      {/* Hero + Features Combined */}
      <section className="py-8 lg:py-12">
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
                AI가 370개+ 상품 중에서 당신에게 딱 맞는 것만 골라드립니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-8 py-3 rounded-lg text-lg font-bold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  onClick={handleGetStarted}
                >
                  <span>{isAuthenticated ? "추천 받기" : "지금 시작하기"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  className="border border-gray-700 text-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition-all"
                  onClick={() => navigate("/how-to-use")}
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

            {/* Right: Demo */}
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

                <button className="w-full mt-4 bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                  상세 비교 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works & Features */}
      <section className="py-16 border-t border-gray-800/50" id="how-it-works">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: How It Works */}
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
                    gradientClass:
                      "bg-gradient-to-r from-emerald-400 to-emerald-500",
                  },
                  {
                    step: "02",
                    title: "AI 분석",
                    description: "370개+ 상품에서 최적 매칭",
                    gradientClass: "bg-gradient-to-r from-cyan-400 to-cyan-500",
                  },
                  {
                    step: "03",
                    title: "맞춤 추천",
                    description: "적합도와 이유까지 명확하게",
                    gradientClass: "bg-gradient-to-r from-blue-400 to-blue-500",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-gray-900 text-sm font-bold flex-shrink-0 ${item.gradientClass}`}
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

            {/* Right: Features */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  왜 FinPick을 선택해야 할까요?
                </span>
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: <Target className="w-8 h-8 text-emerald-400" />,
                    title: "맞춤형 추천",
                    description:
                      "AI가 분석한 당신의 프로필에 딱 맞는 상품만 추천",
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
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {feature.description}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-emerald-400 text-xs font-medium">
                          {feature.highlight}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              {isAuthenticated ? "추천 받기" : "무료로 시작하기"}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FinPickLanding;
