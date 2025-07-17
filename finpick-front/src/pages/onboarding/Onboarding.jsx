// finpick-front/src/pages/onboarding/Onboarding.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { UserService } from "../../services/userService";

const Onboarding = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 📊 간소화된 질문 데이터 (5개 핵심 질문)
  const questions = [
    {
      id: "age",
      type: "single",
      title: "나이대를 선택해주세요",
      subtitle: "상품 가입 조건 확인을 위해 필요해요",
      options: [
        { value: "20대", emoji: "🎓", desc: "사회 초년생" },
        { value: "30대", emoji: "💼", desc: "커리어 성장기" },
        { value: "40대", emoji: "🏠", desc: "안정적 자산 형성" },
        { value: "50대 이상", emoji: "👑", desc: "자산 관리 중심" },
      ],
    },
    {
      id: "goal",
      type: "single",
      title: "가장 중요한 목표는?",
      subtitle: "하나만 선택해주세요",
      options: [
        { value: "안전하게 돈 모으기", emoji: "🛡️", desc: "원금보장 중심" },
        { value: "목돈 만들기", emoji: "🎯", desc: "특정 목표 달성" },
        { value: "투자로 수익내기", emoji: "📈", desc: "적극적 투자" },
        { value: "돈 빌리기", emoji: "💳", desc: "대출 상품 필요" },
      ],
    },
    {
      id: "amount",
      type: "single",
      title: "얼마나 생각하고 계세요?",
      subtitle: "월 단위로 편하게 선택해주세요",
      options: [
        { value: "월 10만원", emoji: "💰", desc: "부담 없이 시작" },
        { value: "월 30만원", emoji: "💵", desc: "꾸준히 모으기" },
        { value: "월 50만원", emoji: "💸", desc: "적극적 저축" },
        { value: "월 100만원 이상", emoji: "💎", desc: "목돈 만들기" },
      ],
    },
    {
      id: "period",
      type: "single",
      title: "언제까지 목표를 달성하고 싶나요?",
      subtitle: "투자 기간을 선택해주세요",
      options: [
        { value: "1년 이내", emoji: "⚡", desc: "단기 목표" },
        { value: "2-3년", emoji: "🎯", desc: "중기 목표" },
        { value: "3-5년", emoji: "🏗️", desc: "장기 목표" },
        { value: "5년 이상", emoji: "🌳", desc: "초장기 목표" },
      ],
    },
    {
      id: "risk",
      type: "single",
      title: "원금 손실 가능성에 대해 어떻게 생각하세요?",
      subtitle: "솔직하게 답변해주세요",
      options: [
        { value: "절대 안돼요", emoji: "🛡️", desc: "안전이 최우선" },
        { value: "조금은 괜찮아요", emoji: "⚖️", desc: "적당한 위험 감수" },
        { value: "수익을 위해서라면", emoji: "🚀", desc: "적극적 투자" },
      ],
    },
  ];

  const totalSteps = questions.length;

  // 🎯 답변 선택 핸들러
  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // 자동으로 다음 질문으로 넘어감
    if (currentStep < totalSteps - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      // 마지막 질문이면 완료 처리
      handleComplete();
    }
  };

  // 📝 온보딩 완료 처리
  const handleComplete = () => {
    console.log("온보딩 완료:", answers);

    // 완료 화면으로 전환
    setCurrentStep(totalSteps);
  };

  // ⬅️ 이전 단계로
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // 🎉 완료 화면
  if (currentStep >= totalSteps) {
    const getPersonalizedMessage = () => {
      const age = answers.age?.value || "";
      const goal = answers.goal?.value || "";

      if (goal.includes("안전하게")) {
        return `${age} 안전 투자자님을 위한 맞춤 상품들을 준비했어요! 📋`;
      } else if (goal.includes("목돈")) {
        return `${age} 목표 달성형 투자자님! 체계적인 계획을 세워드릴게요 🎯`;
      } else if (goal.includes("투자")) {
        return `${age} 적극적 투자자님! 수익성 높은 상품들을 찾아드릴게요 📈`;
      } else if (goal.includes("빌리기")) {
        return `${age} 대출 상품을 찾으시는군요! 최적 조건을 비교해드릴게요 💳`;
      }
      return `${age} 투자자님만을 위한 특별한 추천을 준비했어요! ✨`;
    };

    const questionLabels = {
      age: "나이대",
      goal: "목표",
      amount: "금액",
      period: "기간",
      risk: "투자성향",
    };

    return (
      <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
        {/* 배경 그라데이션 효과 */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-gray-950 to-cyan-900/20" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-center min-h-screen px-4 py-8">
          {/* 🎨 반응형 중앙 정렬 컨테이너 */}
          <div className="text-center max-w-xs lg:max-w-md w-full mx-auto">
            {/* 완료 아이콘 */}
            <div className="relative mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-400/25">
                <CheckCircle className="w-8 h-8 text-gray-900" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-sm">✨</span>
              </div>
            </div>

            {/* 메인 메시지 */}
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              프로필 설정 완료!
            </h1>

            <p className="text-sm text-gray-300 mb-6 leading-relaxed px-2">
              {getPersonalizedMessage()}
            </p>

            {/* 선택 내용 카드 */}
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700/50">
              <h3 className="text-xs font-medium text-emerald-400 mb-3 flex items-center">
                <span className="mr-1">📝</span>
                설정하신 내용
              </h3>
              <div className="space-y-2">
                {Object.entries(answers).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                  >
                    <span className="text-gray-400 text-xs font-medium">
                      {questionLabels[key]}
                    </span>
                    <span className="text-white text-xs font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      {value.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 분석 중 표시 */}
            <div className="bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-lg p-3 mb-6 border border-emerald-400/20">
              <div className="flex items-center justify-center space-x-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <div
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
              <p className="text-emerald-400 text-xs mt-2 font-medium">
                {isSaving
                  ? "Firebase에 프로필 저장 중..."
                  : "AI가 379개 금융상품을 분석하고 있어요"}
              </p>
            </div>

            {/* 액션 버튼 */}
            <button
              onClick={() => (window.location.href = "/recommendations")}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 py-3 rounded-lg font-bold text-base hover:from-emerald-500 hover:to-cyan-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "저장 중..." : "맞춤 추천 받기 🎯"}
            </button>

            {/* 하단 메시지 */}
            <p className="text-xs text-gray-500 mt-3">
              언제든지 설정을 변경할 수 있어요
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* 🎨 반응형 중앙 정렬 컨테이너 */}
      <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-4xl">
        {/* 🎨 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <button
            onClick={handlePrevious}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gray-900" />
            </div>
            <span className="text-lg font-bold">FinPick</span>
          </div>

          <div className="text-sm text-gray-400">
            {currentStep + 1}/{totalSteps}
          </div>
        </div>

        {/* 📊 진행률 바 */}
        <div className="px-6 py-4">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 🔥 메인 질문 화면 */}
        <div
          className={`flex-1 px-6 py-8 transition-all duration-300 ${
            isTransitioning
              ? "opacity-50 transform translate-x-4"
              : "opacity-100 transform translate-x-0"
          }`}
        >
          {/* 질문 제목 */}
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              {currentQuestion.title}
            </h1>
            <p className="text-gray-400 text-lg lg:text-xl">
              {currentQuestion.subtitle}
            </p>
          </div>

          {/* 선택지 - PC에서는 2열 그리드 */}
          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option)}
                className="w-full p-6 bg-gray-800/50 hover:bg-gray-800 rounded-2xl 
                         border border-gray-700/50 hover:border-emerald-400/50 
                         transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                         text-left group"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl lg:text-4xl">{option.emoji}</div>
                  <div className="flex-1">
                    <div className="text-xl lg:text-2xl font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
                      {option.value}
                    </div>
                    <div className="text-gray-400 text-sm lg:text-base">
                      {option.desc}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 🎯 현재 선택된 답변 표시 (이전 질문들) */}
          {currentStep > 0 && (
            <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-400">
                  지금까지 선택한 내용
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(answers).map(([key, value]) => (
                  <span
                    key={key}
                    className="px-3 py-1 bg-emerald-400/20 text-emerald-400 rounded-full text-sm"
                  >
                    {value.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
