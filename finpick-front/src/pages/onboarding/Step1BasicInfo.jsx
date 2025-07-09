import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  User,
  MapPin,
  Briefcase,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModernOnboardingStep1 = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    occupation: "",
    jobStability: "",
    residence: "",
    housingType: "",
    maritalStatus: "",
    dependents: "",
  });

  const sections = [
    {
      id: "basic",
      title: "안녕하세요! 👋",
      subtitle: "먼저 기본 정보부터 알아볼까요?",
      questions: ["age", "gender", "occupation"],
    },
    {
      id: "lifestyle",
      title: "라이프스타일을 알려주세요 🏠",
      subtitle: "더 정확한 추천을 위해 필요해요",
      questions: ["residence", "housingType", "maritalStatus"],
    },
  ];

  const questions = {
    age: {
      label: "연령대",
      icon: <Calendar className="w-5 h-5" />,
      type: "buttons",
      options: [
        { value: "20대", emoji: "🎓", desc: "사회 초년생" },
        { value: "30대", emoji: "💼", desc: "커리어 성장기" },
        { value: "40대", emoji: "🏡", desc: "안정적 자산 형성기" },
        { value: "50대 이상", emoji: "🎯", desc: "은퇴 준비기" },
      ],
    },
    gender: {
      label: "성별",
      icon: <User className="w-5 h-5" />,
      type: "toggle",
      options: [
        { value: "남성", emoji: "👨" },
        { value: "여성", emoji: "👩" },
      ],
    },
    occupation: {
      label: "직업",
      icon: <Briefcase className="w-5 h-5" />,
      type: "cards",
      options: [
        { value: "회사원", emoji: "💼", desc: "안정적 월급" },
        { value: "공무원", emoji: "🏛️", desc: "높은 안정성" },
        { value: "자영업", emoji: "🏪", desc: "변동적 수입" },
        { value: "프리랜서", emoji: "💻", desc: "자유로운 스케줄" },
        { value: "학생", emoji: "🎓", desc: "미래 투자" },
        { value: "기타", emoji: "🤷", desc: "특별한 상황" },
      ],
    },
    residence: {
      label: "거주지역",
      icon: <MapPin className="w-5 h-5" />,
      type: "map",
      options: [
        { value: "서울", emoji: "🏙️", desc: "높은 생활비" },
        { value: "경기/인천", emoji: "🏘️", desc: "수도권" },
        { value: "부산/경남", emoji: "🌊", desc: "영남권" },
        { value: "대구/경북", emoji: "🏔️", desc: "영남 내륙" },
        { value: "광주/전라", emoji: "🌾", desc: "호남권" },
        { value: "대전/충청", emoji: "🏞️", desc: "충청권" },
        { value: "강원/제주", emoji: "⛰️", desc: "관광지역" },
        { value: "기타", emoji: "📍", desc: "기타 지역" },
      ],
    },
    housingType: {
      label: "주거 형태",
      icon: <span className="text-lg">🏠</span>,
      type: "visual",
      options: [
        { value: "자가", emoji: "🏠", desc: "내 집", color: "emerald" },
        { value: "전세", emoji: "🏡", desc: "전세금 보증", color: "blue" },
        { value: "월세", emoji: "🏢", desc: "월 임대료", color: "yellow" },
        { value: "기타", emoji: "🏘️", desc: "기타 형태", color: "gray" },
      ],
    },
    maritalStatus: {
      label: "결혼 여부",
      icon: <span className="text-lg">💑</span>,
      type: "toggle",
      options: [
        { value: "미혼", emoji: "🙋", desc: "1인 가구" },
        { value: "기혼", emoji: "👨‍👩‍👧‍👦", desc: "가족 중심" },
      ],
    },
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // 모든 섹션 완료되면 다음 온보딩 페이지로
      console.log("1단계 완료:", formData);
      navigate("/onboarding/step2");
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    } else {
      navigate("/"); // 홈으로 돌아가기
    }
  };

  const currentQuestions = sections[currentSection].questions;
  const answeredInSection = currentQuestions.filter((q) => formData[q]).length;
  const canProceed = answeredInSection === currentQuestions.length;

  const renderQuestion = (questionKey) => {
    const question = questions[questionKey];
    const value = formData[questionKey];

    switch (question.type) {
      case "toggle":
        return (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  value === option.value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="text-3xl mb-2">{option.emoji}</div>
                <div className="font-semibold">{option.value}</div>
                {option.desc && (
                  <div className="text-xs text-gray-400 mt-1">
                    {option.desc}
                  </div>
                )}
              </button>
            ))}
          </div>
        );

      case "cards":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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

      case "buttons":
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center space-x-4 ${
                  value === option.value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="text-2xl">{option.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold">{option.value}</div>
                  <div className="text-sm text-gray-400">{option.desc}</div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            ))}
          </div>
        );

      case "visual":
        return (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  value === option.value
                    ? `border-${option.color}-400 bg-${option.color}-400/10 text-${option.color}-400`
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="text-4xl mb-3">{option.emoji}</div>
                <div className="font-semibold">{option.value}</div>
                <div className="text-xs text-gray-400 mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        );

      case "map":
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleInputChange(questionKey, option.value)}
                className={`p-3 rounded-xl border transition-all ${
                  value === option.value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-400"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                }`}
              >
                <div className="text-xl mb-1">{option.emoji}</div>
                <div className="font-medium text-sm">{option.value}</div>
                <div className="text-xs text-gray-400">{option.desc}</div>
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
          onClick={currentSection > 0 ? handlePrevious : () => navigate("/")}
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

        <div className="text-sm text-gray-400">1/4</div>
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
            {answeredInSection}/{currentQuestions.length} 완료
          </span>
          <span>
            {Math.round(
              ((currentSection + answeredInSection / currentQuestions.length) /
                sections.length) *
                100
            )}
            %
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">
            {sections[currentSection].title}
          </h1>
          <p className="text-gray-400 text-lg">
            {sections[currentSection].subtitle}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {currentQuestions.map((questionKey) => (
            <div key={questionKey} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    formData[questionKey]
                      ? "bg-emerald-400/20 text-emerald-400"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {questions[questionKey].icon}
                </div>
                <h3 className="text-xl font-semibold">
                  {questions[questionKey].label}
                </h3>
                {formData[questionKey] && (
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">완료</span>
                  </div>
                )}
              </div>
              {renderQuestion(questionKey)}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8">
          {currentSection > 0 ? (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              이전
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${
              canProceed
                ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 hover:shadow-lg transform hover:scale-105"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>
              {currentSection === sections.length - 1
                ? "다음 단계로"
                : "계속하기"}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Fun Fact */}
        {answeredInSection > 0 && (
          <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="text-sm text-gray-400 mb-1">💡 알고 계셨나요?</div>
            <div className="text-gray-300">
              {formData.age === "20대" &&
                "20대 직장인의 73%가 적금으로 첫 투자를 시작해요"}
              {formData.age === "30대" &&
                "30대는 주택 구입을 위한 목돈 마련이 주요 관심사예요"}
              {formData.age === "40대" &&
                "40대부터는 안정성을 중시한 투자 성향을 보여요"}
              {formData.occupation === "공무원" &&
                "공무원은 연금저축과 주택청약이 인기 상품이에요"}
              {formData.residence === "서울" &&
                "서울 거주자는 평균적으로 전국 대비 1.3배 높은 목표 금액을 설정해요"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernOnboardingStep1;
