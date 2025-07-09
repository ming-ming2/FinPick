import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  PiggyBank,
  CreditCard,
  TrendingDown,
  Sparkles,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModernOnboardingStep3 = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    monthlyIncome: "",
    monthlyExpense: "",
    currentSavings: "",
    monthlyInvestment: "",
    existingDebt: "",
    creditRating: "",
    emergencyFund: "",
    savingsGoal: "",
  });
  const [financialHealth, setFinancialHealth] = useState(null);

  const sections = [
    {
      id: "income",
      title: "수입과 지출을 알려주세요 💰",
      subtitle: "정확한 추천을 위해 솔직하게 답변해주세요",
      questions: ["monthlyIncome", "monthlyExpense", "monthlyInvestment"],
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      id: "assets",
      title: "현재 자산 현황이 궁금해요 🏦",
      subtitle: "보유 자산과 부채를 확인해주세요",
      questions: ["currentSavings", "existingDebt", "creditRating"],
      icon: <PiggyBank className="w-6 h-6" />,
    },
    {
      id: "goals",
      title: "목표와 계획을 세워볼까요? 🎯",
      subtitle: "마지막 단계예요!",
      questions: ["emergencyFund", "savingsGoal"],
      icon: <Sparkles className="w-6 h-6" />,
    },
  ];

  const questions = {
    monthlyIncome: {
      label: "월 평균 소득",
      type: "range",
      required: true,
      options: [
        { value: "200만원 미만", range: [0, 200], emoji: "🌱", color: "blue" },
        {
          value: "200-300만원",
          range: [200, 300],
          emoji: "🌿",
          color: "green",
        },
        {
          value: "300-500만원",
          range: [300, 500],
          emoji: "🌳",
          color: "emerald",
        },
        {
          value: "500-700만원",
          range: [500, 700],
          emoji: "💼",
          color: "purple",
        },
        {
          value: "700-1000만원",
          range: [700, 1000],
          emoji: "💎",
          color: "yellow",
        },
        {
          value: "1000만원 이상",
          range: [1000, 9999],
          emoji: "👑",
          color: "orange",
        },
      ],
    },
    monthlyExpense: {
      label: "월 평균 지출",
      type: "range",
      required: true,
      options: [
        { value: "100만원 미만", range: [0, 100], emoji: "💚", color: "green" },
        {
          value: "100-200만원",
          range: [100, 200],
          emoji: "💛",
          color: "yellow",
        },
        {
          value: "200-300만원",
          range: [200, 300],
          emoji: "🧡",
          color: "orange",
        },
        { value: "300-500만원", range: [300, 500], emoji: "❤️", color: "red" },
        {
          value: "500만원 이상",
          range: [500, 9999],
          emoji: "💜",
          color: "purple",
        },
      ],
    },
    monthlyInvestment: {
      label: "월 투자/저축 가능 금액",
      type: "investment",
      required: false,
      options: [
        {
          value: "10만원 미만",
          amount: 10,
          emoji: "🐣",
          desc: "소액부터 시작",
        },
        { value: "10-30만원", amount: 30, emoji: "🌱", desc: "꾸준한 적립" },
        { value: "30-50만원", amount: 50, emoji: "🌿", desc: "적극적 저축" },
        { value: "50-100만원", amount: 100, emoji: "🌳", desc: "목표 지향적" },
        { value: "100-200만원", amount: 200, emoji: "💎", desc: "고액 투자자" },
        { value: "200만원 이상", amount: 300, emoji: "👑", desc: "VIP 투자자" },
      ],
    },
    currentSavings: {
      label: "현재 보유 자산",
      type: "assets",
      required: true,
      options: [
        { value: "500만원 미만", amount: 500, emoji: "🥚", level: "시작 단계" },
        {
          value: "500-1000만원",
          amount: 1000,
          emoji: "🐣",
          level: "기초 형성",
        },
        {
          value: "1000-3000만원",
          amount: 3000,
          emoji: "🌱",
          level: "성장 단계",
        },
        {
          value: "3000-5000만원",
          amount: 5000,
          emoji: "🌿",
          level: "안정 단계",
        },
        {
          value: "5000만원-1억원",
          amount: 10000,
          emoji: "🌳",
          level: "풍부한 자산",
        },
        {
          value: "1억원 이상",
          amount: 20000,
          emoji: "💎",
          level: "고액 자산가",
        },
      ],
    },
    existingDebt: {
      label: "기존 대출/부채",
      type: "debt",
      required: false,
      options: [
        {
          value: "없음",
          amount: 0,
          emoji: "✨",
          status: "부채 FREE",
          color: "emerald",
        },
        {
          value: "1000만원 미만",
          amount: 1000,
          emoji: "😊",
          status: "양호",
          color: "blue",
        },
        {
          value: "1000-3000만원",
          amount: 3000,
          emoji: "😐",
          status: "보통",
          color: "yellow",
        },
        {
          value: "3000-5000만원",
          amount: 5000,
          emoji: "😟",
          status: "주의",
          color: "orange",
        },
        {
          value: "5000만원-1억원",
          amount: 10000,
          emoji: "😰",
          status: "위험",
          color: "red",
        },
        {
          value: "1억원 이상",
          amount: 20000,
          emoji: "🚨",
          status: "고위험",
          color: "red",
        },
      ],
    },
    creditRating: {
      label: "신용등급",
      type: "credit",
      required: true,
      options: [
        {
          value: "1-2등급",
          score: 950,
          emoji: "👑",
          desc: "최우수",
          color: "emerald",
        },
        {
          value: "3-4등급",
          score: 800,
          emoji: "💎",
          desc: "우수",
          color: "blue",
        },
        {
          value: "5-6등급",
          score: 650,
          emoji: "⭐",
          desc: "양호",
          color: "yellow",
        },
        {
          value: "7등급 이하",
          score: 500,
          emoji: "⚠️",
          desc: "관리 필요",
          color: "red",
        },
        {
          value: "모름",
          score: 700,
          emoji: "❓",
          desc: "확인 필요",
          color: "gray",
        },
      ],
    },
    emergencyFund: {
      label: "비상자금 준비 현황",
      type: "emergency",
      required: false,
      options: [
        {
          value: "없음",
          months: 0,
          emoji: "🚨",
          status: "위험",
          advice: "최우선 준비 필요",
        },
        {
          value: "1개월 생활비",
          months: 1,
          emoji: "😰",
          status: "부족",
          advice: "3개월까지 늘려주세요",
        },
        {
          value: "3개월 생활비",
          months: 3,
          emoji: "😊",
          status: "기본",
          advice: "좋은 시작이에요",
        },
        {
          value: "6개월 생활비",
          months: 6,
          emoji: "😄",
          status: "안전",
          advice: "훌륭한 준비상태",
        },
        {
          value: "1년 생활비",
          months: 12,
          emoji: "🤩",
          status: "완벽",
          advice: "매우 안전해요",
        },
        {
          value: "충분히 준비됨",
          months: 18,
          emoji: "👑",
          status: "VIP",
          advice: "최고 수준이에요",
        },
      ],
    },
    savingsGoal: {
      label: "주요 저축/투자 목표",
      type: "goal",
      required: false,
      options: [
        {
          value: "비상자금 마련",
          priority: "high",
          emoji: "🛡️",
          timeline: "즉시",
        },
        {
          value: "주택 구입 자금",
          priority: "high",
          emoji: "🏠",
          timeline: "2-5년",
        },
        {
          value: "결혼 자금",
          priority: "medium",
          emoji: "💒",
          timeline: "1-3년",
        },
        {
          value: "자녀 교육비",
          priority: "high",
          emoji: "🎓",
          timeline: "10-20년",
        },
        {
          value: "노후 자금",
          priority: "high",
          emoji: "🌅",
          timeline: "20-30년",
        },
        { value: "여행 자금", priority: "low", emoji: "✈️", timeline: "1-2년" },
        {
          value: "사업 자금",
          priority: "medium",
          emoji: "💼",
          timeline: "2-5년",
        },
        {
          value: "특별한 목표 없음",
          priority: "low",
          emoji: "🤷",
          timeline: "유연",
        },
      ],
    },
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateFinancialHealth = () => {
    if (!formData.monthlyIncome || !formData.monthlyExpense) return null;

    const income = getNumericValue(formData.monthlyIncome);
    const expense = getNumericValue(formData.monthlyExpense);
    const surplus = income - expense;
    const savingsRate = income > 0 ? (surplus / income) * 100 : 0;

    let status, color, emoji, advice;

    if (savingsRate >= 30) {
      status = "매우 우수";
      color = "emerald";
      emoji = "🌟";
      advice = "완벽한 재정 관리를 하고 계세요!";
    } else if (savingsRate >= 20) {
      status = "우수";
      color = "blue";
      emoji = "💙";
      advice = "훌륭한 저축 습관이에요!";
    } else if (savingsRate >= 10) {
      status = "양호";
      color = "yellow";
      emoji = "😊";
      advice = "안정적인 재정 상태예요.";
    } else if (savingsRate >= 0) {
      status = "보통";
      color = "orange";
      emoji = "😐";
      advice = "지출 관리가 필요해요.";
    } else {
      status = "주의";
      color = "red";
      emoji = "😰";
      advice = "수입 증대나 지출 절약이 필요해요.";
    }

    return { surplus, savingsRate, status, color, emoji, advice };
  };

  const getNumericValue = (rangeString) => {
    if (!rangeString) return 0;
    const matches = rangeString.match(/(\d+)/g);
    if (!matches) return 0;
    return parseInt(matches[0]);
  };

  useEffect(() => {
    setFinancialHealth(calculateFinancialHealth());
  }, [formData.monthlyIncome, formData.monthlyExpense]);

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // 모든 섹션 완료되면 다음 온보딩 페이지로
      console.log("3단계 완료:", formData, { financialHealth });
      navigate("/onboarding/step4");
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      navigate("/onboarding/step2"); // 이전 온보딩 페이지로
    }
  };

  const currentQuestions = sections[currentSection].questions;
  const requiredAnswered = currentQuestions
    .filter((q) => questions[q].required)
    .every((q) => formData[q]);

  const renderQuestion = (questionKey) => {
    const question = questions[questionKey];
    const value = formData[questionKey];

    switch (question.type) {
      case "range":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  value === option.value
                    ? `border-${option.color}-400 bg-${option.color}-400/10 text-${option.color}-400`
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{option.emoji}</div>
                  <div className="text-left">
                    <div className="font-semibold">{option.value}</div>
                    <div className="text-xs text-gray-400">
                      월 {option.range[0]}-
                      {option.range[1] === 9999 ? "∞" : option.range[1]}만원
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case "investment":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`p-4 rounded-xl border transition-all transform hover:scale-105 ${
                  value === option.value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl mb-2">{option.emoji}</div>
                <div className="font-medium text-sm">{option.value}</div>
                <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        );

      case "assets":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`p-5 rounded-xl border-2 text-left transition-all transform hover:scale-105 ${
                  value === option.value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{option.emoji}</div>
                  <div>
                    <div className="font-semibold">{option.value}</div>
                    <div className="text-sm text-gray-400">{option.level}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case "debt":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  value === option.value
                    ? `border-${option.color}-400 bg-${option.color}-400/10 text-${option.color}-400`
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{option.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{option.value}</div>
                    <div className="text-sm text-gray-400">{option.status}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case "credit":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`p-5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  value === option.value
                    ? `border-${option.color}-400 bg-${option.color}-400/10 text-${option.color}-400`
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="font-semibold">{option.value}</div>
                  <div className="text-sm text-gray-400">{option.desc}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    점수: {option.score}
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case "emergency":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  value === option.value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{option.emoji}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{option.value}</div>
                    <div className="text-sm text-gray-400">{option.advice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{option.status}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        );

      case "goal":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`p-4 rounded-xl border text-left transition-all transform hover:scale-105 ${
                  value === option.value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{option.emoji}</div>
                  <div className="flex-1">
                    <div className="font-medium">{option.value}</div>
                    <div className="text-xs text-gray-400">
                      {option.timeline}
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      option.priority === "high"
                        ? "bg-red-400"
                        : option.priority === "medium"
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }`}
                  ></div>
                </div>
              </button>
            ))}
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
            currentSection > 0
              ? handlePrevious
              : () => navigate("/onboarding/step2")
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

        <div className="text-sm text-gray-400">3/4</div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4">
        <div className="flex items-center space-x-2 mb-3">
          {sections.map((_, index) => (
            <div key={index} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  index <= currentSection
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                    : "bg-gray-800"
                }`}
              ></div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>
            섹션 {currentSection + 1}/{sections.length}
          </span>
          <span>
            {Math.round(((currentSection + 1) / sections.length) * 25 + 50)}%
            완료
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-400/10 rounded-2xl mb-4">
            {sections[currentSection].icon}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {sections[currentSection].title}
          </h1>
          <p className="text-gray-400">{sections[currentSection].subtitle}</p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {currentQuestions.map((questionKey) => (
            <div key={questionKey} className="space-y-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold">
                  {questions[questionKey].label}
                </h3>
                {questions[questionKey].required && (
                  <span className="text-emerald-400 text-sm">*</span>
                )}
                {formData[questionKey] && (
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
              </div>
              {renderQuestion(questionKey)}
            </div>
          ))}
        </div>

        {/* Financial Health Display */}
        {financialHealth && currentSection === 0 && (
          <div className="mt-8 p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold">재정 건전성 분석</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">{financialHealth.emoji}</div>
                <div
                  className={`font-semibold text-${financialHealth.color}-400`}
                >
                  {financialHealth.status}
                </div>
                <div className="text-xs text-gray-400">종합 평가</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {financialHealth.surplus > 0 ? "+" : ""}
                  {financialHealth.surplus}만원
                </div>
                <div className="text-xs text-gray-400">월 잉여자금</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {financialHealth.savingsRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">저축률</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
              <div className="text-sm text-gray-300">
                {financialHealth.advice}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8">
          {currentSection > 0 ? (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              이전 섹션
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNext}
            disabled={!requiredAnswered}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
              requiredAnswered
                ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 hover:shadow-lg transform hover:scale-105"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>
              {currentSection === sections.length - 1
                ? "마지막 단계로"
                : "다음 섹션"}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              개인정보 보호
            </span>
          </div>
          <p className="text-xs text-gray-400">
            입력하신 모든 정보는{" "}
            <span className="text-emerald-400">256bit SSL 암호화</span>로
            보호되며, 오직 맞춤형 추천에만 사용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernOnboardingStep3;
