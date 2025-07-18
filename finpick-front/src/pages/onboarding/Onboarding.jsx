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
  const [isSaving, setIsSaving] = useState(false); // This state isn't used, consider removing if not needed.
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [completionStatus, setCompletionStatus] = useState("saving"); // 'saving', 'success', 'error'

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

  // 🎯 답변 선택 핸들러 - 🎉 즉석 완료 애니메이션 스타일
  const handleAnswer = async (questionId, answer) => {
    const updatedAnswers = {
      ...answers,
      [questionId]: answer,
    };

    // 상태 업데이트
    setAnswers(updatedAnswers);

    // 자동으로 다음 질문으로 넘어감
    if (currentStep < totalSteps - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      // 🎉 마지막 질문! 즉석 완료 애니메이션 실행
      setShowCompletionAnimation(true);
      setCompletionStatus("saving");

      try {
        // 🔥 Firebase 저장
        console.log("💾 즉석 저장 시작...");
        // Ensure user and user.uid exist before calling UserService
        if (user && user.uid) {
          await UserService.saveOnboardingAnswers(user.uid, updatedAnswers);
        } else {
          throw new Error("User not authenticated or UID not available.");
        }

        // 🎉 성공 애니메이션
        setCompletionStatus("success");

        // 2초 후 추천 페이지로 이동
        setTimeout(() => {
          window.location.href = "/recommendations";
        }, 2000);
      } catch (error) {
        console.error("❌ 저장 실패:", error);
        setCompletionStatus("error");

        // 에러 시 3초 후 다시 시도 옵션 제공
        setTimeout(() => {
          setShowCompletionAnimation(false);
        }, 3000);
      }
    }
  };

  // 🎉 즉석 완료 애니메이션 컴포넌트
  const CompletionOverlay = () => {
    if (!showCompletionAnimation) return null;

    return (
      <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl z-50 flex items-center justify-center">
        <div className="text-center">
          {/* 메인 애니메이션 아이콘 */}
          <div className="relative mb-8">
            {completionStatus === "saving" && (
              <div className="w-24 h-24 mx-auto">
                <div className="w-24 h-24 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
              </div>
            )}

            {completionStatus === "success" && (
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-12 h-12 text-gray-900" />
              </div>
            )}

            {completionStatus === "error" && (
              <div className="w-24 h-24 mx-auto bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-3xl text-white">❌</span>
              </div>
            )}
          </div>

          {/* 메시지 */}
          <div className="space-y-4">
            {completionStatus === "saving" && (
              <>
                <h2 className="text-2xl font-bold text-white">
                  설정을 저장하고 있어요
                </h2>
                <p className="text-gray-400">잠시만 기다려주세요...</p>
              </>
            )}

            {completionStatus === "success" && (
              <>
                <h2 className="text-3xl font-bold text-white mb-2">🎉 완료!</h2>
                <p className="text-xl text-emerald-400 font-semibold">
                  프로필 설정이 완료되었어요
                </p>
                <p className="text-gray-400">맞춤 추천을 준비하고 있어요</p>
              </>
            )}

            {completionStatus === "error" && (
              <>
                <h2 className="text-2xl font-bold text-white">
                  저장에 실패했어요
                </h2>
                <p className="text-gray-400">다시 시도해주세요</p>
                <button
                  onClick={() => setShowCompletionAnimation(false)}
                  className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  다시 시도
                </button>
              </>
            )}
          </div>

          {/* 진행 점들 */}
          {completionStatus === "saving" && (
            <div className="flex items-center justify-center space-x-1 mt-8">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ⬅️ 이전 단계로
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Define currentQuestion and progress before the return statement
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* 🎉 즉석 완료 애니메이션 오버레이 */}
      <CompletionOverlay />

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
                disabled={showCompletionAnimation}
                className="w-full p-6 bg-gray-800/50 hover:bg-gray-800 rounded-2xl
                               border border-gray-700/50 hover:border-emerald-400/50
                               transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                               text-left group disabled:opacity-50 disabled:cursor-not-allowed"
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
