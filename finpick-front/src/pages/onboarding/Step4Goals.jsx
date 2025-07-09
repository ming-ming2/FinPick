import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Target,
  Calendar,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Shield,
  DollarSign,
  Zap,
  Award,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModernOnboardingStep4 = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("goals"); // 'goals' or 'complete'
  const [formData, setFormData] = useState({
    primaryGoal: "",
    timeframe: "",
    targetAmount: "",
    riskPreference: "",
    preferredProducts: [],
  });
  const [completionData, setCompletionData] = useState(null);

  const goalQuestions = {
    primaryGoal: {
      title: "가장 중요한 목표를 선택해주세요",
      subtitle: "여러 목표가 있다면 가장 우선순위가 높은 것을 골라주세요",
      type: "priority",
      options: [
        {
          value: "안전한 저축",
          emoji: "🛡️",
          desc: "원금 보장하며 꾸준히 모으기",
          color: "emerald",
          products: ["예금", "적금", "CMA"],
          timeline: "즉시 시작",
        },
        {
          value: "목돈 마련",
          emoji: "🎯",
          desc: "특정 금액을 목표로 단기 적립",
          color: "blue",
          products: ["적금", "단기 펀드", "ELS"],
          timeline: "1-3년",
        },
        {
          value: "투자 수익",
          emoji: "📈",
          desc: "적극적 투자로 자산 증대",
          color: "purple",
          products: ["주식", "펀드", "ETF"],
          timeline: "3-5년",
        },
        {
          value: "노후 준비",
          emoji: "🌅",
          desc: "장기적인 노후 자금 마련",
          color: "orange",
          products: ["연금저축", "IRP", "장기 펀드"],
          timeline: "20-30년",
        },
        {
          value: "부채 관리",
          emoji: "💳",
          desc: "기존 대출 정리 및 관리",
          color: "red",
          products: ["대환대출", "신용관리"],
          timeline: "1-2년",
        },
        {
          value: "내 상황에 맞게",
          emoji: "🎨",
          desc: "AI가 종합 분석해서 추천",
          color: "cyan",
          products: ["맞춤형 포트폴리오"],
          timeline: "개인별 차이",
        },
      ],
    },
    timeframe: {
      title: "언제까지 목표를 달성하고 싶으세요?",
      subtitle: "구체적인 기간이 있으면 더 정확한 추천이 가능해요",
      type: "timeline",
      options: [
        {
          value: "6개월 이내",
          period: 0.5,
          emoji: "⚡",
          urgency: "매우 급함",
          strategy: "초단기",
        },
        {
          value: "1년 이내",
          period: 1,
          emoji: "🎯",
          urgency: "급함",
          strategy: "단기",
        },
        {
          value: "2-3년",
          period: 2.5,
          emoji: "🏗️",
          urgency: "여유",
          strategy: "중기",
        },
        {
          value: "5년 이내",
          period: 5,
          emoji: "🌳",
          urgency: "충분",
          strategy: "중장기",
        },
        {
          value: "10년 이내",
          period: 10,
          emoji: "🏔️",
          urgency: "넉넉",
          strategy: "장기",
        },
        {
          value: "10년 이상",
          period: 15,
          emoji: "🌌",
          urgency: "매우 넉넉",
          strategy: "초장기",
        },
      ],
    },
    targetAmount: {
      title: "목표 금액을 알려주세요",
      subtitle: "구체적인 금액이 있으면 맞춤 계획을 세워드려요",
      type: "amount",
      options: [
        {
          value: "500만원 미만",
          amount: 500,
          emoji: "🌱",
          level: "시작",
          monthly: 10,
        },
        {
          value: "500-1000만원",
          amount: 1000,
          emoji: "🌿",
          level: "기초",
          monthly: 30,
        },
        {
          value: "1000-3000만원",
          amount: 3000,
          emoji: "🌳",
          level: "성장",
          monthly: 100,
        },
        {
          value: "3000-5000만원",
          amount: 5000,
          emoji: "🏠",
          level: "안정",
          monthly: 200,
        },
        {
          value: "5000만원-1억원",
          amount: 10000,
          emoji: "💎",
          level: "풍부",
          monthly: 500,
        },
        {
          value: "1억원 이상",
          amount: 20000,
          emoji: "👑",
          level: "VIP",
          monthly: 1000,
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

  const generatePersonalizedResult = () => {
    // 사용자 입력 기반 개인화된 결과 생성
    const selectedGoal = goalQuestions.primaryGoal.options.find(
      (opt) => opt.value === formData.primaryGoal
    );
    const selectedTime = goalQuestions.timeframe.options.find(
      (opt) => opt.value === formData.timeframe
    );
    const selectedAmount = goalQuestions.targetAmount.options.find(
      (opt) => opt.value === formData.targetAmount
    );

    return {
      goal: selectedGoal,
      timeframe: selectedTime,
      amount: selectedAmount,
      strategy: selectedTime?.strategy || "중기",
      recommendedProducts: selectedGoal?.products || ["맞춤형 상품"],
      monthlyTarget: selectedAmount
        ? Math.round(selectedAmount.amount / (selectedTime?.period * 12 || 36))
        : 50,
      successRate: Math.min(95, 60 + (selectedTime?.period || 3) * 5),
      riskLevel:
        selectedGoal?.value === "안전한 저축"
          ? "낮음"
          : selectedGoal?.value === "투자 수익"
          ? "높음"
          : "보통",
    };
  };

  const handleComplete = () => {
    const result = generatePersonalizedResult();
    setCompletionData(result);
    setCurrentView("complete");
    console.log("온보딩 4단계 완료:", { formData, result });
  };

  // 완료 화면에서 다른 페이지로 이동
  const handleViewRecommendations = () => {
    console.log("추천 결과 보기", completionData);
    navigate("/recommendations");
  };

  const handleGoToDashboard = () => {
    console.log("대시보드로 이동");
    navigate("/dashboard");
  };

  const isFormComplete =
    formData.primaryGoal && formData.timeframe && formData.targetAmount;

  // 목표 설정 화면
  if (currentView === "goals") {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">₩</span>
            </div>
            <span className="text-lg font-bold">FinPick</span>
          </div>

          <div className="text-sm text-gray-400">4/4</div>
        </div>

        {/* Progress */}
        <div className="px-6 py-4">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-300"
              style={{ width: "100%" }}
            ></div>
          </div>
          <div className="text-right mt-2">
            <span className="text-xs text-gray-400">마지막 단계! 🎉</span>
          </div>
        </div>

        <div className="px-6 py-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                목표를 설정해주세요
              </span>
            </h1>
            <p className="text-gray-400">
              구체적인 목표가 더 정확한 추천을 만들어냅니다
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-12">
            {/* Primary Goal */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>{goalQuestions.primaryGoal.title}</span>
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {goalQuestions.primaryGoal.subtitle}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {goalQuestions.primaryGoal.options.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => handleInputChange("primaryGoal", goal.value)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all transform hover:scale-105 ${
                      formData.primaryGoal === goal.value
                        ? `border-${goal.color}-400 bg-${goal.color}-400/10 text-${goal.color}-400`
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{goal.emoji}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">
                          {goal.value}
                        </div>
                        <div className="text-sm text-gray-400 mb-3">
                          {goal.desc}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {goal.products.slice(0, 2).map((product, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-full bg-${goal.color}-400/20 text-${goal.color}-400`}
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          {goal.timeline}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe */}
            {formData.primaryGoal && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <span>{goalQuestions.timeframe.title}</span>
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {goalQuestions.timeframe.subtitle}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {goalQuestions.timeframe.options.map((time) => (
                    <button
                      key={time.value}
                      onClick={() => handleInputChange("timeframe", time.value)}
                      className={`p-5 rounded-xl border transition-all transform hover:scale-105 ${
                        formData.timeframe === time.value
                          ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{time.emoji}</div>
                        <div className="font-semibold">{time.value}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {time.strategy}
                        </div>
                        <div className="text-xs text-gray-500">
                          {time.urgency}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Target Amount */}
            {formData.timeframe && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>{goalQuestions.targetAmount.title}</span>
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {goalQuestions.targetAmount.subtitle}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {goalQuestions.targetAmount.options.map((amount) => (
                    <button
                      key={amount.value}
                      onClick={() =>
                        handleInputChange("targetAmount", amount.value)
                      }
                      className={`p-5 rounded-xl border transition-all transform hover:scale-105 ${
                        formData.targetAmount === amount.value
                          ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{amount.emoji}</div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold">{amount.value}</div>
                          <div className="text-sm text-gray-400">
                            {amount.level} 단계
                          </div>
                          <div className="text-xs text-gray-500">
                            추천 월 적립: {amount.monthly}만원
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {isFormComplete && (
            <div className="mt-12 p-6 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 rounded-2xl border border-emerald-400/20">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-emerald-400">
                  설정 완료 미리보기
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-400">목표</div>
                  <div className="font-semibold text-white">
                    {formData.primaryGoal}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">기간</div>
                  <div className="font-semibold text-white">
                    {formData.timeframe}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">금액</div>
                  <div className="font-semibold text-white">
                    {formData.targetAmount}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complete Button */}
          <div className="mt-12 pb-8">
            <button
              onClick={handleComplete}
              disabled={!isFormComplete}
              className={`w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                isFormComplete
                  ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 hover:shadow-lg transform hover:scale-105"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>FinPick 시작하기</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 완료 화면
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-16 h-16 text-gray-900" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-5 h-5 text-gray-900" />
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-20 h-1 bg-emerald-400 rounded animate-pulse"></div>
            <div
              className="w-16 h-1 bg-cyan-400 rounded animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-12 h-1 bg-blue-400 rounded animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>

        {/* Completion Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              모든 준비 완료! 🎉
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            이제 당신만의 AI 금융 어드바이저가
            <br />
            완벽하게 준비되었습니다
          </p>
        </div>

        {/* Personalized Summary */}
        {completionData && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="text-3xl mb-3">{completionData.goal?.emoji}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                당신의 목표
              </h3>
              <div className="text-emerald-400 font-medium">
                {completionData.goal?.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {completionData.timeframe?.value}까지
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                목표 금액
              </h3>
              <div className="text-emerald-400 font-medium">
                {completionData.amount?.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                월 {completionData.monthlyTarget}만원 추천
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Results */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">AI 분석 완료</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-400/10 rounded-xl border border-emerald-400/20">
              <Award className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-emerald-400">
                맞춤 상품
              </div>
              <div className="text-xs text-gray-400">
                {completionData?.recommendedProducts?.length || 3}개 발견
              </div>
            </div>
            <div className="text-center p-4 bg-blue-400/10 rounded-xl border border-blue-400/20">
              <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-400">
                리스크 분석
              </div>
              <div className="text-xs text-gray-400">
                {completionData?.riskLevel || "보통"} 위험도
              </div>
            </div>
            <div className="text-center p-4 bg-cyan-400/10 rounded-xl border border-cyan-400/20">
              <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-cyan-400">성공 확률</div>
              <div className="text-xs text-gray-400">
                {completionData?.successRate || 85}% 예상
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => console.log("맞춤 추천 보기", completionData)}
            className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 py-4 px-6 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>내 맞춤 추천 보기</span>
          </button>

          <button
            onClick={() => console.log("대시보드로 이동")}
            className="w-full border border-gray-700 text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            대시보드로 이동
          </button>
        </div>

        {/* Footer Message */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            🎉 축하합니다! 이제{" "}
            <span className="text-emerald-400">마이페이지</span>에서 언제든지
            정보를 수정할 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernOnboardingStep4;
