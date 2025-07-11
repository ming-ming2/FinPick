// 📁 finpick-front/src/pages/main/LandingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Shield,
  Target,
  TrendingUp,
  Zap,
  Star,
  Users,
  Search,
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
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

  // 로딩 중일 때 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Landing 전용 Header */}
      <Header variant="landing" showProfile={true} showNav={false} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-emerald-400/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI 기반 맞춤 추천</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                AI가 추천하는
              </span>
              <br />
              맞춤형 금융상품
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              복잡한 금융 시장에서 당신만을 위한 최적의 투자 솔루션을
              찾아드립니다. 30초만에 맞춤 상품을 추천받아보세요.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all flex items-center space-x-2"
              >
                <span>지금 시작하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <span>데모 보기</span>
                <div className="w-8 h-8 border border-gray-600 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-gray-400 border-y-[4px] border-y-transparent ml-1"></div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-900/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                왜 FinPick을 선택해야 할까요?
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                기존 금융 서비스와는 다른 혁신적인 접근으로 진정한 맞춤형 추천을
                제공합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-emerald-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">중립적 분석</h3>
                <p className="text-gray-400 text-sm">
                  금융사 수수료 없이 오직 사용자 이익만을 고려한 추천
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">맞춤 상품</h3>
                <p className="text-gray-400 text-sm">
                  개인의 투자성향과 재정상황을 분석한 완전 개인화 추천
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">실시간 데이터</h3>
                <p className="text-gray-400 text-sm">
                  금융감독원 공식 API로 항상 최신 상품 정보 제공
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">30초 추천</h3>
                <p className="text-gray-400 text-sm">
                  간단한 질문으로 빠르게 최적 상품 발견
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                어떻게 작동하나요?
              </h2>
              <p className="text-gray-400">4단계만으로 완료되는 간단한 과정</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "기본 정보",
                  desc: "나이, 직업, 거주지 입력",
                },
                {
                  step: "02",
                  title: "투자 성향",
                  desc: "위험도와 투자 경험 분석",
                },
                {
                  step: "03",
                  title: "재정 상황",
                  desc: "소득과 저축 현황 파악",
                },
                {
                  step: "04",
                  title: "목표 설정",
                  desc: "투자 목적과 기간 결정",
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-900 font-bold text-lg">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full">
                      <ArrowRight className="w-6 h-6 text-gray-600 mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-gray-900/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                자주 묻는 질문
              </h2>
              <p className="text-gray-400">
                궁금한 점이 있으시면 언제든 문의해주세요
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/70 transition-colors"
                  >
                    <span className="font-medium">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-400">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 p-12 rounded-2xl border border-emerald-500/30">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                지금 바로 시작하세요
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                더 이상 복잡한 금융상품 비교에 시간을 낭비하지 마세요. AI가
                당신만을 위한 최적의 상품을 찾아드립니다.
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all"
              >
                무료로 추천받기
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Landing 전용 풀 Footer */}
      <Footer variant="landing" />
    </div>
  );
};

export default LandingPage;
