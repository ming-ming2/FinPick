import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  MessageCircle,
  Sparkles,
  Target,
  CheckCircle2,
  Send,
  X,
  Star,
  Building,
  Bot,
  User,
} from "lucide-react";

const HowToUsePage = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "목적 입력",
      subtitle: "자연어로 원하는 것을 말해보세요",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "from-emerald-400 to-emerald-500",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20",
      demoComponent: <ChatInputDemo />,
    },
    {
      id: 2,
      title: "AI 분석",
      subtitle: "370개+ 상품에서 최적 매칭",
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-cyan-400 to-cyan-500",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/20",
      demoComponent: <AIAnalysisDemo />,
    },
    {
      id: 3,
      title: "맞춤 추천",
      subtitle: "적합도와 이유까지 명확하게",
      icon: <Target className="w-6 h-6" />,
      color: "from-blue-400 to-blue-500",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/20",
      demoComponent: <RecommendationDemo />,
    },
  ];

  const handleStepClick = (index) => {
    setActiveStep(index);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleStartChat = () => {
    window.location.href = "/chat";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">뒤로가기</span>
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img
                  src="/logo.png"
                  alt="FinPick"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-lg">FinPick</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              사용법
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg">
            3단계로 끝나는 간단한 과정을 체험해보세요
          </p>
        </div>

        {/* Steps Timeline - Mobile First */}
        <div className="relative">
          {/* Progress Bar Container */}
          <div
            className="absolute left-6 top-16 w-0.5"
            style={{ height: "calc(100% - 4rem)" }}
          >
            {/* Background Track */}
            <div className="absolute inset-0 w-full h-full bg-gray-700"></div>
            {/* Filled Progress Bar */}
            <div
              className="absolute inset-0 w-full bg-gradient-to-b from-emerald-400 to-cyan-400 transition-all duration-1000"
              style={{
                height: `${(activeStep / (steps.length - 1)) * 100}%`,
              }}
            ></div>
          </div>

          {/* Steps */}
          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Step Number Circle */}
                <div
                  className={`absolute left-4 top-2 w-4 h-4 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                    index <= activeStep
                      ? `bg-gradient-to-r ${step.color} border-transparent`
                      : "bg-gray-950 border-gray-600"
                  }`}
                  onClick={() => handleStepClick(index)}
                ></div>

                {/* Content Card */}
                <div className="ml-12 sm:ml-16">
                  <div
                    className={`p-4 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      index === activeStep
                        ? `${step.bgColor} ${step.borderColor} shadow-xl`
                        : "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50"
                    }`}
                    onClick={() => handleStepClick(index)}
                  >
                    {/* Header */}
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center text-gray-900 transition-all`}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold">
                          {step.title}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          {step.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Demo */}
                    {index === activeStep && (
                      <div className="mt-4 sm:mt-6">{step.demoComponent}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                지금 바로 시작해보세요
              </span>
            </h2>
            <p className="text-gray-300 mb-6 text-sm sm:text-base">
              30초 만에 맞춤형 금융상품 추천을 받아보세요
            </p>
            <button
              onClick={handleStartChat}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>추천 받기</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Demo Components ---

// Chat Input Demo
const ChatInputDemo = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "안녕하세요! 원하는 금융상품을 말씀해주세요. AI가 실시간으로 분석하여 최적의 상품들을 찾아드릴게요! 😊",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      const text = "월 50만원씩 2년간 안전하게 모으고 싶어요";
      let index = 0;

      const typeWriter = () => {
        if (index < text.length) {
          setInputValue(text.slice(0, index + 1));
          index++;
          setTimeout(typeWriter, 100);
        } else {
          setIsTyping(false);
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now(),
                type: "user",
                content: text,
                timestamp: new Date(),
              },
            ]);
            setInputValue("");
          }, 500);
        }
      };
      typeWriter();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-96 bg-gray-950 rounded-2xl border border-gray-800/50 overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-xl bg-black/50 z-40 flex flex-col">
        <div className="backdrop-blur-xl bg-gray-950/90 border-b border-gray-700/50 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></div>
              <h2 className="text-white font-bold text-base sm:text-lg">
                AI 상담사
              </h2>
              <div className="px-2 py-1 bg-emerald-500/20 rounded-lg">
                <span className="text-emerald-300 text-xs">Beta</span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[75%] p-3 sm:p-4 rounded-2xl shadow-md ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-md"
                    : "bg-gray-800/80 text-gray-200 rounded-bl-md border border-gray-700/50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {message.type === "ai" && (
                    <div className="mt-1 flex-shrink-0">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                  <div className="text-sm leading-relaxed">
                    {message.content}
                  </div>
                  {message.type === "user" && (
                    <div className="mt-1 flex-shrink-0">
                      <User className="w-4 h-4 text-emerald-200" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="backdrop-blur-xl bg-gray-950/90 border-t border-gray-700/50 p-4 sm:p-6">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="구체적인 조건을 말씀해 주세요!"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              {isTyping && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-1 h-4 bg-emerald-400 animate-pulse"></div>
                </div>
              )}
            </div>
            <button
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white p-3 rounded-xl transition-all duration-200 shadow-lg"
              disabled={isTyping}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Analysis Demo
const AIAnalysisDemo = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setTimeout(() => setAnalysisComplete(true), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-96 bg-gray-950 rounded-2xl border border-gray-800/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-emerald-900/10"></div>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-xl bg-black/40 p-4">
          <div className="text-center backdrop-blur-xl bg-gray-900/80 rounded-3xl p-6 sm:p-8 border border-gray-700/50">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-emerald-400/30 rounded-full"></div>
              <div className="absolute inset-1 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"></div>
              <div
                className="absolute inset-3 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"
                style={{ animationDuration: "1.5s" }}
              ></div>
              <div
                className="absolute inset-6 border-2 border-transparent border-t-yellow-400 rounded-full animate-spin"
                style={{ animationDuration: "2s" }}
              ></div>
              <div className="absolute inset-8 flex items-center justify-center">
                <Star className="w-4 h-4 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-white text-lg sm:text-xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AI 분석 중...
            </h3>
            <div className="w-full max-w-[224px] h-2 bg-gray-700 rounded-full overflow-hidden mb-4 mx-auto">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              {loadingProgress < 25
                ? "🔍 상품 데이터 분석 중..."
                : loadingProgress < 50
                ? "🎯 맞춤 패턴 생성 중..."
                : loadingProgress < 75
                ? "🔗 연관성 분석 중..."
                : "✨ 결과 준비 중..."}
            </p>
            <div className="flex justify-center space-x-2">
              {["분석", "패턴", "연결", "완성"].map((step, index) => (
                <div
                  key={step}
                  className={`px-2 py-1 rounded text-xs ${
                    loadingProgress > index * 25
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-gray-700/50 text-gray-500"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {analysisComplete && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center backdrop-blur-xl bg-black/20 rounded-3xl p-6 sm:p-8 border border-white/10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-6 mx-auto relative">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full blur-xl opacity-30"></div>
            </div>
            <h3 className="text-white text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              분석 완료!
            </h3>
            <p className="text-gray-300 text-center leading-relaxed mb-4 text-sm sm:text-base">
              당신의 조건에 맞는 최적의 상품들을
              <br />
              찾아 시각화하고 있습니다
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              ✅ 자연어 분석 완료
              <br />✅ 상품 매칭 완료
              <br />✅ 적합도 계산 완료
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Recommendation Demo
const RecommendationDemo = () => {
  const [pins, setPins] = useState([]);
  const [constellationLines, setConstellationLines] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResult(true);
      const newPins = [
        {
          id: 1,
          name: "신한은행 쌓이는적금",
          bank: "신한은행",
          suitability: 95,
          rate: 3.2,
          reason:
            "목표 금액과 기간이 완벽히 일치하며, 안정성이 높은 상품입니다.",
          isTopRecommended: true,
          x: 50,
          y: 30,
          type: "savings",
        },
        {
          id: 2,
          name: "KB국민 MY적금",
          bank: "KB국민은행",
          suitability: 88,
          rate: 3.0,
          reason: "중도해지 조건이 우수하고 신뢰도가 높습니다.",
          isTopRecommended: false,
          x: 30,
          y: 55,
          type: "savings",
        },
        {
          id: 3,
          name: "우리 WON적금",
          bank: "우리은행",
          suitability: 82,
          rate: 2.9,
          reason: "다양한 우대조건으로 추가 금리 혜택이 가능합니다.",
          isTopRecommended: false,
          x: 70,
          y: 55,
          type: "savings",
        },
      ];
      setPins(newPins);
      const lines = [
        { from: { x: 50, y: 30 }, to: { x: 30, y: 55 }, strength: 0.8 },
        { from: { x: 50, y: 30 }, to: { x: 70, y: 55 }, strength: 0.6 },
        { from: { x: 30, y: 55 }, to: { x: 70, y: 55 }, strength: 0.4 },
      ];
      setConstellationLines(lines);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePinClick = (pin) => setSelectedPin(pin);
  const closeModal = () => setSelectedPin(null);

  return (
    <div className="relative h-96 bg-gray-950 rounded-2xl border border-gray-800/50 overflow-hidden">
      {showResult ? (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-cyan-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.3 + Math.random() * 0.4,
                }}
              />
            ))}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-48 h-32 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-1/3 right-1/4 w-56 h-40 bg-gradient-radial from-emerald-500/10 to-transparent rounded-full blur-3xl" />
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {constellationLines.map((line, index) => (
              <line
                key={index}
                x1={`${line.from.x}%`}
                y1={`${line.from.y}%`}
                x2={`${line.to.x}%`}
                y2={`${line.to.y}%`}
                stroke={`rgba(6, 182, 212, ${0.3 + line.strength * 0.4})`}
                strokeWidth={1 + line.strength * 2}
                className="transition-all duration-1000 animate-pulse"
                strokeDasharray="5,5"
              />
            ))}
          </svg>
          {pins.map((pin) => (
            <div
              key={pin.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 hover:scale-110"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              onClick={() => handlePinClick(pin)}
            >
              {pin.isTopRecommended && (
                <div
                  className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-yellow-400 to-orange-400 opacity-60 animate-pulse"
                  style={{ transform: "scale(2.5)" }}
                />
              )}
              <div
                className="absolute inset-0 rounded-full blur-lg"
                style={{
                  backgroundColor: pin.isTopRecommended ? "#f59e0b" : "#10b981",
                  opacity: 0.6,
                  transform: "scale(1.8)",
                  animation: pin.isTopRecommended ? "pulse 2s infinite" : "",
                }}
              />
              <div
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl border-2 backdrop-blur-sm ${
                  pin.isTopRecommended
                    ? "border-yellow-400/80 ring-4 ring-yellow-400/30"
                    : "border-white/30"
                }`}
                style={{
                  backgroundColor: pin.isTopRecommended ? "#f59e0b" : "#10b981",
                  boxShadow: `0 0 20px ${
                    pin.isTopRecommended ? "#f59e0b" : "#10b981"
                  }40, 0 10px 20px rgba(0,0,0,0.3)`,
                }}
              >
                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
                {pin.isTopRecommended && (
                  <div className="absolute -top-2.5 -left-2.5 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                    <Star
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                      fill="currentColor"
                    />
                  </div>
                )}
              </div>
              <div
                className={`absolute -top-2.5 -right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg backdrop-blur-sm border ${
                  pin.isTopRecommended
                    ? "border-yellow-400/50 bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "border-white/30"
                }`}
                style={{
                  background: pin.isTopRecommended
                    ? undefined
                    : `linear-gradient(135deg, #10b981, #10b981cc)`,
                  boxShadow: `0 4px 15px ${
                    pin.isTopRecommended ? "#f59e0b" : "#10b981"
                  }40`,
                }}
              >
                {pin.suitability}%
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-400 text-sm">추천 결과 생성 중...</p>
          </div>
        </div>
      )}
      {selectedPin && (
        <div className="fixed inset-0 backdrop-blur-xl bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="w-full max-w-md backdrop-blur-xl bg-gray-900/95 border border-gray-700/50 rounded-t-3xl md:rounded-3xl shadow-2xl animate-slide-up md:animate-fade-in-up max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-gray-700/30">
              <div className="md:hidden w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Building className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {selectedPin.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{selectedPin.bank}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/30">
                    <p className="text-gray-400 mb-1 text-xs">위험도</p>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= 2
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/30">
                    <p className="text-gray-400 mb-1 text-xs">금리/수익률</p>
                    <p className="text-emerald-400 font-medium text-sm">
                      {selectedPin.rate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/30">
                    <p className="text-gray-400 mb-1 text-xs">적합도</p>
                    <p className="text-cyan-400 font-medium text-sm">
                      {selectedPin.suitability}%
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
                  <h4 className="text-white font-semibold mb-2 flex items-center text-sm">
                    <Target className="w-3 h-3 mr-2 text-emerald-400" /> AI 추천
                    사유
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedPin.reason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HowToUsePage;
