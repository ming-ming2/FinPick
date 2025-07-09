import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Target,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModernOnboardingStep2 = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("intro"); // 'intro', 'quiz', 'result'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState({});
  const [totalScore, setTotalScore] = useState(0);

  // 화면 변경 시 스크롤 상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // 질문 변경 시 스크롤 상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentQuestion]);

  const questions = [
    {
      id: "experience",
      title: "투자 경험이 얼마나 되시나요?",
      subtitle: "정직하게 답변해주세요. 초보여도 괜찮아요! 😊",
      type: "cards",
      options: [
        {
          value: "완전 초보",
          score: 1,
          emoji: "🌱",
          desc: "투자는 처음이에요",
          color: "emerald",
          detail: "예적금만 해봤어요",
        },
        {
          value: "1-2년",
          score: 2,
          emoji: "📚",
          desc: "조금씩 배우고 있어요",
          color: "blue",
          detail: "펀드 정도 경험 있음",
        },
        {
          value: "3-5년",
          score: 3,
          emoji: "💼",
          desc: "어느 정도 경험 있어요",
          color: "purple",
          detail: "주식도 해봤어요",
        },
        {
          value: "5년 이상",
          score: 4,
          emoji: "🏆",
          desc: "투자 고수예요",
          color: "yellow",
          detail: "다양한 상품 경험",
        },
      ],
    },
    {
      id: "riskTolerance",
      title: "100만원을 투자했는데 한 달 후 90만원이 됐다면?",
      subtitle: "실제 상황을 상상해보고 답변해주세요",
      type: "scenario",
      options: [
        {
          value: "즉시 팔고 안전한 곳으로",
          score: 1,
          emoji: "😰",
          desc: "손실은 절대 안돼요",
          reaction: "매우 보수적 성향",
        },
        {
          value: "걱정되지만 조금 더 기다려보기",
          score: 2,
          emoji: "😟",
          desc: "불안하지만 참아볼게요",
          reaction: "보수적 성향",
        },
        {
          value: "시장 상황을 분석해보기",
          score: 3,
          emoji: "🤔",
          desc: "냉정하게 판단할게요",
          reaction: "균형적 성향",
        },
        {
          value: "오히려 더 사볼 기회로 보기",
          score: 4,
          emoji: "😎",
          desc: "기회라고 생각해요",
          reaction: "적극적 성향",
        },
      ],
    },
    {
      id: "returnExpectation",
      title: "1년 후 기대하는 수익률은?",
      subtitle: "현실적으로 생각해보세요",
      type: "slider",
      options: [
        {
          value: "2-3%",
          score: 1,
          emoji: "🛡️",
          desc: "안전이 최우선",
          color: "green",
        },
        {
          value: "5-7%",
          score: 2,
          emoji: "⚖️",
          desc: "적당한 수익",
          color: "blue",
        },
        {
          value: "10-15%",
          score: 3,
          emoji: "📈",
          desc: "적극적 수익",
          color: "purple",
        },
        {
          value: "20% 이상",
          score: 4,
          emoji: "🚀",
          desc: "고수익 추구",
          color: "red",
        },
      ],
    },
    {
      id: "investmentPeriod",
      title: "투자 기간은 보통 얼마나 생각하세요?",
      subtitle: "목표 달성까지의 시간을 고려해보세요",
      type: "timeline",
      options: [
        {
          value: "1년 미만",
          score: 1,
          emoji: "⚡",
          desc: "빠른 결과",
          period: "단기",
        },
        {
          value: "1-3년",
          score: 2,
          emoji: "🎯",
          desc: "목표 지향",
          period: "중기",
        },
        {
          value: "3-5년",
          score: 3,
          emoji: "🏗️",
          desc: "자산 구축",
          period: "중장기",
        },
        {
          value: "5년 이상",
          score: 4,
          emoji: "🌳",
          desc: "장기 성장",
          period: "장기",
        },
      ],
    },
    {
      id: "knowledge",
      title: "다음 중 알고 있는 용어는?",
      subtitle: "복수 선택 가능해요 (모르면 패스해도 OK)",
      type: "knowledge",
      options: [
        { value: "ETF", score: 0.5, emoji: "📊", desc: "상장지수펀드" },
        { value: "리밸런싱", score: 0.5, emoji: "⚖️", desc: "포트폴리오 조정" },
        { value: "P/E 비율", score: 0.5, emoji: "🔢", desc: "주가수익비율" },
        {
          value: "달러 코스트 애버리징",
          score: 0.5,
          emoji: "💰",
          desc: "분할 매수 전략",
        },
        { value: "복리 효과", score: 0.3, emoji: "📈", desc: "이자의 이자" },
        { value: "모르겠어요", score: 0, emoji: "🤷", desc: "솔직한 선택" },
      ],
    },
  ];

  const handleAnswer = (questionId, answer, score) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: { answer, score },
    }));

    setTotalScore((prev) => {
      const newScore = prev + score;
      if (formData[questionId]) {
        return newScore - formData[questionId].score;
      }
      return newScore;
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentView("result");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // 결과 화면에서 다음 단계로 이동
  const handleGoToNextStep = () => {
    console.log("2단계 완료:", {
      formData,
      totalScore,
      riskLevel: calculateRiskLevel(totalScore),
    });
    navigate("/onboarding/step3");
  };

  const calculateRiskLevel = (score) => {
    if (score <= 6)
      return {
        level: 5,
        name: "초안전형",
        description: "원금 보장이 최우선",
        emoji: "🛡️",
        color: "emerald",
        products: ["예금", "적금", "MMF"],
      };
    if (score <= 10)
      return {
        level: 4,
        name: "안전형",
        description: "안정성 중시, 약간의 변동 감내",
        emoji: "🌿",
        color: "blue",
        products: ["채권형 펀드", "예금", "금융상품"],
      };
    if (score <= 14)
      return {
        level: 3,
        name: "위험중립형",
        description: "안정성과 수익성의 균형",
        emoji: "⚖️",
        color: "purple",
        products: ["혼합형 펀드", "ETF", "리츠"],
      };
    if (score <= 18)
      return {
        level: 2,
        name: "위험형",
        description: "적극적 투자, 변동성 감내 가능",
        emoji: "📈",
        color: "orange",
        products: ["주식형 펀드", "개별 주식", "ETF"],
      };
    return {
      level: 1,
      name: "초고위험형",
      description: "고수익 추구, 높은 변동성 감내",
      emoji: "🚀",
      color: "red",
      products: ["성장주", "테마주", "파생상품"],
    };
  };

  // 인트로 화면
  if (currentView === "intro") {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-gray-900" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                투자 성향 파악하기
              </span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              5개의 간단한 질문으로
              <br />
              당신만의 투자 DNA를 찾아드릴게요
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">약 2분 소요</span>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <Target className="w-5 h-5 text-emerald-400" />
              <span className="text-gray-300">
                정확한 상품 추천을 위해 필요해요
              </span>
            </div>
          </div>

          <button
            onClick={() => setCurrentView("quiz")}
            className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 py-4 px-6 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (currentView === "result") {
    const riskLevel = calculateRiskLevel(totalScore);

    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div
              className={`w-24 h-24 bg-${riskLevel.color}-400/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-${riskLevel.color}-400/30`}
            >
              <span className="text-4xl">{riskLevel.emoji}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              당신은{" "}
              <span className={`text-${riskLevel.color}-400`}>
                {riskLevel.name}
              </span>
            </h1>
            <p className="text-gray-400 text-lg">{riskLevel.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-white">투자 성향</div>
              <div className={`text-${riskLevel.color}-400 text-sm`}>
                {riskLevel.name}
              </div>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-white">위험 등급</div>
              <div className={`text-${riskLevel.color}-400 text-sm`}>
                {riskLevel.level}등급
              </div>
            </div>
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-white">점수</div>
              <div className={`text-${riskLevel.color}-400 text-sm`}>
                {totalScore}점
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-6 mb-8 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4 text-white">
              추천 상품 유형
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {riskLevel.products.map((product, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 bg-${riskLevel.color}-400/20 text-${riskLevel.color}-400 rounded-full text-sm border border-${riskLevel.color}-400/30`}
                >
                  {product}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleGoToNextStep}
            className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 py-4 px-6 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            다음 단계로
          </button>
        </div>
      </div>
    );
  }

  // 퀴즈 화면
  const currentQ = questions[currentQuestion];
  const isAnswered = formData[currentQ.id];
  const progress = ((currentQuestion + 1) / questions.length) * 25 + 25; // 25% ~ 50%

  const renderQuestion = () => {
    switch (currentQ.type) {
      case "cards":
        return (
          <div className="grid md:grid-cols-2 gap-4">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleAnswer(currentQ.id, option.value, option.score)
                }
                className={`p-6 rounded-2xl border-2 text-left transition-all transform hover:scale-105 ${
                  formData[currentQ.id]?.answer === option.value
                    ? `border-${option.color}-400 bg-${option.color}-400/10 text-${option.color}-400`
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="text-3xl mb-3">{option.emoji}</div>
                <div className="font-semibold mb-2">{option.value}</div>
                <div className="text-sm text-gray-400">{option.desc}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {option.detail}
                </div>
              </button>
            ))}
          </div>
        );

      case "scenario":
        return (
          <div className="space-y-3">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleAnswer(currentQ.id, option.value, option.score)
                }
                className={`w-full p-5 rounded-xl border text-left transition-all ${
                  formData[currentQ.id]?.answer === option.value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{option.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{option.value}</div>
                    <div className="text-sm text-gray-400">{option.desc}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {option.reaction}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case "slider":
        return (
          <div className="space-y-4">
            {currentQ.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() =>
                  handleAnswer(currentQ.id, option.value, option.score)
                }
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center space-x-4 ${
                  formData[currentQ.id]?.answer === option.value
                    ? `border-${option.color}-400 bg-${option.color}-400/10 text-${option.color}-400`
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl">{option.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold">{option.value}</div>
                  <div className="text-sm text-gray-400">{option.desc}</div>
                </div>
                <div
                  className={`w-16 h-2 bg-${option.color}-400/30 rounded-full relative`}
                >
                  <div
                    className={`w-${Math.min((index + 1) * 4, 16)} h-2 bg-${
                      option.color
                    }-400 rounded-full`}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        );

      case "timeline":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentQ.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() =>
                  handleAnswer(currentQ.id, option.value, option.score)
                }
                className={`p-4 rounded-xl border transition-all transform hover:scale-105 ${
                  formData[currentQ.id]?.answer === option.value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="font-semibold text-sm">{option.value}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {option.period}
                </div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        );

      case "knowledge":
        return (
          <div className="grid md:grid-cols-2 gap-3">
            {currentQ.options.map((option) => {
              const isSelected = Array.isArray(formData[currentQ.id]?.answer)
                ? formData[currentQ.id].answer.includes(option.value)
                : false;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    const currentAnswers = Array.isArray(
                      formData[currentQ.id]?.answer
                    )
                      ? formData[currentQ.id].answer
                      : [];

                    let newAnswers, newScore;
                    if (isSelected) {
                      newAnswers = currentAnswers.filter(
                        (a) => a !== option.value
                      );
                      newScore =
                        (formData[currentQ.id]?.score || 0) - option.score;
                    } else {
                      newAnswers = [...currentAnswers, option.value];
                      newScore =
                        (formData[currentQ.id]?.score || 0) + option.score;
                    }

                    handleAnswer(currentQ.id, newAnswers, newScore);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{option.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {option.value}
                      </div>
                      <div className="text-xs text-gray-400">{option.desc}</div>
                    </div>
                    {isSelected && <Sparkles className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <button
          onClick={
            currentQuestion > 0 ? handlePrevious : () => setCurrentView("intro")
          }
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-sm">₩</span>
          </div>
          <span className="text-lg font-bold">FinPick</span>
        </div>

        <div className="text-sm text-gray-400">2/4</div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4">
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>
            {currentQuestion + 1} / {questions.length}
          </span>
          <span>{Math.round(progress)}% 완료</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {currentQ.title}
          </h1>
          <p className="text-gray-400">{currentQ.subtitle}</p>
        </div>

        {renderQuestion()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6">
          {currentQuestion > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              이전
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className={`ml-auto px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
              isAnswered
                ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 hover:shadow-lg"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>
              {currentQuestion === questions.length - 1 ? "결과 보기" : "다음"}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Current Score Display */}
        {totalScore > 0 && (
          <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">현재 성향</div>
              <div className="text-emerald-400 font-semibold">
                {calculateRiskLevel(totalScore).name} ({totalScore}점)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernOnboardingStep2;
