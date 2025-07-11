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
import { useOnboarding } from "../../hooks/useOnboarding"; // useOnboarding 훅 추가

const ModernOnboardingStep2 = () => {
  const navigate = useNavigate();
  const { saveStep2, loading, error } = useOnboarding(); // useOnboarding 훅 사용

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
          value: "전혀 없음", // '완전 초보'를 '전혀 없음'으로 변경 (수정된 부분의 scoreMap과 일치시키기 위함)
          score: 1,
          emoji: "🌱",
          desc: "투자는 처음이에요",
          color: "emerald",
          detail: "예적금만 해봤어요",
        },
        {
          value: "1년 미만", // 추가 (수정된 부분의 scoreMap과 일치시키기 위함)
          score: 1,
          emoji: "🐣",
          desc: "시작한 지 얼마 안 됐어요",
          color: "emerald",
          detail: "소액 투자를 해봤어요",
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
          value: "매우 불안함", // '즉시 팔고 안전한 곳으로'를 '매우 불안함'으로 변경 (수정된 부분의 scoreMap과 일치시키기 위함)
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
          value: "어느 정도 감내", // '시장 상황을 분석해보기'를 '어느 정도 감내'로 변경 (수정된 부분의 scoreMap과 일치시키기 위함)
          score: 3,
          emoji: "🤔",
          desc: "냉정하게 판단할게요",
          reaction: "균형적 성향",
        },
        {
          value: "크게 걱정하지 않음", // '오히려 더 사볼 기회로 보기'를 '크게 걱정하지 않음'으로 변경 (수정된 부분의 scoreMap과 일치시키기 위함)
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
          value: "1-3%", // '2-3%'를 '1-3%'로 변경 (수정된 부분의 scoreMap과 일치시키기 위함)
          score: 1,
          emoji: "🛡️",
          desc: "안전이 최우선",
          color: "green",
        },
        {
          value: "3-5%", // 추가 (수정된 부분의 scoreMap과 일치시키기 위함)
          score: 2,
          emoji: "📈",
          desc: "적당한 수익 추구",
          color: "blue",
        },
        {
          value: "5-7%",
          score: 2,
          emoji: "⚖️",
          desc: "적당한 수익",
          color: "blue",
        },
        {
          value: "7-10%", // 추가 (수정된 부분의 scoreMap과 일치시키기 위함)
          score: 3,
          emoji: "🚀",
          desc: "꽤 높은 수익",
          color: "purple",
        },
        {
          value: "10% 이상", // '10-15%'와 '20% 이상'을 통합하고 '10% 이상'으로 변경 (수정된 부분의 scoreMap과 일치시키기 위함)
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
          value: "1년 이내", // '1년 미만'을 '1년 이내'로 변경 (수정된 부분의 scoreMap과 일치시키기 위함)
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
      id: "investmentKnowledge", // 'knowledge'를 'investmentKnowledge'로 변경 (수정된 부분과 일치시키기 위함)
      title: "다음 중 알고 있는 용어는?",
      subtitle: "복수 선택 가능해요 (모르면 패스해도 OK)",
      type: "knowledge",
      options: [
        { value: "ETF", score: 1, emoji: "📊", desc: "상장지수펀드" }, // score를 1로 변경 (수정된 부분은 length로 계산하므로 단일 항목당 점수를 1로 가정)
        { value: "리밸런싱", score: 1, emoji: "⚖️", desc: "포트폴리오 조정" },
        { value: "P/E 비율", score: 1, emoji: "🔢", desc: "주가수익비율" },
        {
          value: "달러 코스트 애버리징",
          score: 1,
          emoji: "💰",
          desc: "분할 매수 전략",
        },
        { value: "복리 효과", score: 1, emoji: "📈", desc: "이자의 이자" },
        // "모르겠어요" 옵션은 지식 점수에 반영되지 않으므로 제거하거나 score를 0으로 유지
      ],
    },
  ];

  // 수정된 부분의 getScoreForAnswer 로직을 통합 (knowledge는 예외 처리)
  const getScoreForAnswer = (questionId, answer) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return 0;

    if (questionId === "investmentKnowledge") {
      // knowledge는 선택된 항목 수 자체가 점수가 되므로, 여기서는 사용되지 않음
      // handleAnswer에서 직접 처리
      return 0;
    }

    const option = question.options.find((opt) => opt.value === answer);
    return option ? option.score : 0;
  };

  // 수정된 부분의 calculateTotalScore 로직을 통합
  // 이 함수는 최종 점수 계산 시 사용되며, handleAnswer에서 실시간 totalScore를 업데이트하는 방식과 함께 동작
  const calculateFinalTotalScore = () => {
    let score = 0;
    score += getScoreForAnswer("experience", formData.experience?.answer);
    score += getScoreForAnswer("riskTolerance", formData.riskTolerance?.answer);
    score += getScoreForAnswer(
      "returnExpectation",
      formData.returnExpectation?.answer
    );
    score += getScoreForAnswer(
      "investmentPeriod",
      formData.investmentPeriod?.answer
    );
    // investmentKnowledge는 선택된 항목의 길이를 점수로 사용
    score += formData.investmentKnowledge?.answer?.length || 0;
    return score;
  };

  const handleAnswer = (questionId, answer, score) => {
    setFormData((prev) => {
      const newFormData = { ...prev };
      let newScoreForQuestion = 0;

      if (questionId === "investmentKnowledge") {
        // investmentKnowledge는 배열로 처리
        const currentAnswers = Array.isArray(prev[questionId]?.answer)
          ? prev[questionId].answer
          : [];
        const isSelected = currentAnswers.includes(answer);
        let updatedAnswers;

        if (isSelected) {
          updatedAnswers = currentAnswers.filter((a) => a !== answer);
        } else {
          updatedAnswers = [...currentAnswers, answer];
        }
        newScoreForQuestion = updatedAnswers.length; // 지식 질문은 선택된 개수만큼 점수
        newFormData[questionId] = {
          answer: updatedAnswers,
          score: newScoreForQuestion,
        };
      } else {
        // 일반 질문은 단일 선택
        newScoreForQuestion = score;
        newFormData[questionId] = { answer, score: newScoreForQuestion };
      }

      // 전체 totalScore 업데이트 로직
      let recalculatedTotal = 0;
      for (const q of questions) {
        if (newFormData[q.id]) {
          if (q.id === "investmentKnowledge") {
            recalculatedTotal += newFormData[q.id].answer?.length || 0;
          } else {
            const option = q.options.find(
              (opt) => opt.value === newFormData[q.id].answer
            );
            recalculatedTotal += option ? option.score : 0;
          }
        }
      }
      setTotalScore(recalculatedTotal);

      return newFormData;
    });
  };

  const handleNextQuestion = () => {
    // 이름 변경: handleNext -> handleNextQuestion
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

  // 결과 화면에서 다음 단계로 이동 (saveStep2 로직 통합)
  const handleGoToNextStep = async () => {
    // 최종 점수와 데이터 구조를 수정된 부분에 맞게 구성
    const investmentProfileData = {
      experience: {
        answer: formData.experience?.answer,
        score: getScoreForAnswer("experience", formData.experience?.answer),
      },
      riskTolerance: {
        answer: formData.riskTolerance?.answer,
        score: getScoreForAnswer(
          "riskTolerance",
          formData.riskTolerance?.answer
        ),
      },
      returnExpectation: {
        answer: formData.returnExpectation?.answer,
        score: getScoreForAnswer(
          "returnExpectation",
          formData.returnExpectation?.answer
        ),
      },
      investmentPeriod: {
        answer: formData.investmentPeriod?.answer,
        score: getScoreForAnswer(
          "investmentPeriod",
          formData.investmentPeriod?.answer
        ),
      },
      investmentKnowledge: {
        answers: formData.investmentKnowledge?.answer || [],
        score: formData.investmentKnowledge?.answer?.length || 0, // knowledge는 선택된 항목 수
      },
      totalScore: totalScore, // 현재 계산된 totalScore 사용
    };

    console.log("2단계 완료 및 저장 시도:", investmentProfileData);

    const success = await saveStep2(investmentProfileData);

    if (success) {
      console.log("2단계 완료 및 저장 성공:", investmentProfileData);
      navigate("/onboarding/step3");
    } else {
      alert("저장에 실패했습니다. 다시 시도해주세요.");
      console.error("2단계 저장 실패:", error);
    }
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

  // 로딩 오버레이
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-950 bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-white text-lg flex items-center">
          <svg
            className="animate-spin h-6 w-6 mr-3 text-emerald-400"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          저장 중...
        </div>
      </div>
    );
  }

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
  // knowledge 질문의 경우, formData[currentQ.id]?.answer가 배열이므로 length로 확인
  const isAnswered =
    currentQ.id === "investmentKnowledge"
      ? (formData[currentQ.id]?.answer?.length || 0) > 0
      : !!formData[currentQ.id]?.answer;
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

      case "knowledge": // 'knowledge' -> 'investmentKnowledge'에 대응
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
                    handleAnswer(currentQ.id, option.value, option.score); // handleAnswer에서 배열 처리
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
            onClick={handleNextQuestion} // handleNextQuestion으로 변경
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
