import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Shield,
  PiggyBank,
  Home,
  Zap,
  Star,
  Menu,
  X,
  MapPin,
  Activity,
  Database,
  Clock,
  Building,
  Users,
  BarChart3,
} from "lucide-react";

const FinPickPremiumMap = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "안녕하세요! 원하는 금융상품을 말씀해주세요. 지도에서 딱 맞는 상품들을 찾아드릴게요! 🗺️",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [liveData, setLiveData] = useState({
    totalProducts: 340,
    institutions: 15,
    realTimeUpdates: "24/7",
    activeMining: true,
  });
  const mapRef = useRef(null);

  // 실시간 지표 카운터 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => ({
        ...prev,
        totalProducts: 340 + Math.floor(Math.random() * 5),
        institutions: 15 + Math.floor(Math.random() * 3),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 로딩 진행률 애니메이션
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 15;
        });
      }, 150);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(0);
    }
  }, [isLoading]);

  // 지역별 금융 허브 데이터
  const financialHubs = [
    {
      name: "강남",
      x: 75,
      y: 30,
      color: "#10B981",
      size: "large",
      products: 85,
    },
    {
      name: "여의도",
      x: 65,
      y: 40,
      color: "#3B82F6",
      size: "large",
      products: 92,
    },
    {
      name: "서울역",
      x: 60,
      y: 35,
      color: "#8B5CF6",
      size: "medium",
      products: 67,
    },
    {
      name: "판교",
      x: 80,
      y: 50,
      color: "#F59E0B",
      size: "medium",
      products: 54,
    },
    {
      name: "부산",
      x: 85,
      y: 85,
      color: "#EF4444",
      size: "medium",
      products: 43,
    },
    {
      name: "대구",
      x: 75,
      y: 70,
      color: "#06B6D4",
      size: "small",
      products: 31,
    },
    {
      name: "광주",
      x: 45,
      y: 75,
      color: "#84CC16",
      size: "small",
      products: 28,
    },
  ];

  // 핀 타입별 스타일
  const pinStyles = {
    deposit: {
      color: "#3B82F6",
      icon: Shield,
      name: "예금",
      bgGlow: "shadow-blue-500/20",
    },
    savings: {
      color: "#10B981",
      icon: PiggyBank,
      name: "적금",
      bgGlow: "shadow-emerald-500/20",
    },
    investment: {
      color: "#8B5CF6",
      icon: TrendingUp,
      name: "투자",
      bgGlow: "shadow-purple-500/20",
    },
    loan: {
      color: "#F59E0B",
      icon: Home,
      name: "대출",
      bgGlow: "shadow-amber-500/20",
    },
  };

  // 샘플 상품 데이터 (확장)
  const sampleProducts = {
    안전: [
      {
        id: 1,
        name: "KB국민은행 정기적금",
        type: "savings",
        rate: 3.5,
        minAmount: 100,
        suitability: 98,
        reason: "높은 금리, 낮은 위험도",
        monthlyAmount: 50,
        bank: "KB국민은행",
        region: "강남",
      },
      {
        id: 2,
        name: "신한 쌓이는적금",
        type: "savings",
        rate: 3.2,
        minAmount: 10,
        suitability: 92,
        reason: "낮은 최소금액, 높은 안정성",
        monthlyAmount: 50,
        bank: "신한은행",
        region: "여의도",
      },
      {
        id: 3,
        name: "우리 WON정기예금",
        type: "deposit",
        rate: 3.8,
        minAmount: 50,
        suitability: 88,
        reason: "업계 최고 예금금리",
        monthlyAmount: 50,
        bank: "우리은행",
        region: "서울역",
      },
    ],
    투자: [
      {
        id: 4,
        name: "삼성 밸런스펀드",
        type: "investment",
        rate: 6.8,
        minAmount: 10,
        suitability: 85,
        reason: "안정적 수익, 분산투자 효과",
        monthlyAmount: 30,
        bank: "삼성자산운용",
        region: "판교",
      },
      {
        id: 5,
        name: "KODEX 200 ETF",
        type: "investment",
        rate: 8.2,
        minAmount: 1,
        suitability: 78,
        reason: "시장 연동, 높은 유동성",
        monthlyAmount: 20,
        bank: "삼성자산운용",
        region: "부산",
      },
    ],
  };

  // 핀 위치 생성 (지역 기반)
  const generatePinPositions = (products) => {
    return products.map((product) => {
      const hub =
        financialHubs.find((h) => h.name === product.region) ||
        financialHubs[0];
      return {
        ...product,
        x: hub.x + (Math.random() - 0.5) * 15,
        y: hub.y + (Math.random() - 0.5) * 15,
      };
    });
  };

  // 핀 드롭 애니메이션 (개선된)
  const dropPins = (products) => {
    const positions = generatePinPositions(products);

    positions.forEach((product, index) => {
      setTimeout(() => {
        const newPin = {
          ...product,
          animation: "drop",
          id: product.id + Date.now(), // 고유 ID 보장
        };

        setPins((prevPins) => [...prevPins, newPin]);

        // 핑 애니메이션 효과
        setTimeout(() => {
          const pingElement = document.createElement("div");
          pingElement.className =
            "absolute w-20 h-20 border-2 border-emerald-400 rounded-full animate-ping opacity-75";
          pingElement.style.left = `${product.x}%`;
          pingElement.style.top = `${product.y}%`;
          pingElement.style.transform = "translate(-50%, -50%)";
          pingElement.style.pointerEvents = "none";
          mapRef.current?.appendChild(pingElement);

          setTimeout(() => pingElement.remove(), 2000);
        }, 500);

        // 바운스 효과
        setTimeout(() => {
          setPins((prevPins) =>
            prevPins.map((pin) =>
              pin.id === newPin.id ? { ...pin, animation: "bounce" } : pin
            )
          );
        }, 700);
      }, index * 500);
    });
  };

  // AI 응답 시뮬레이션 (개선된)
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setLoadingProgress(0);
    setPins([]);
    setSelectedPin(null);
    setShowChat(false);

    // 키워드 분석
    const input = inputValue.toLowerCase();
    let products = [];

    if (
      input.includes("안전") ||
      input.includes("저축") ||
      input.includes("적금") ||
      input.includes("예금")
    ) {
      products = sampleProducts["안전"];
    } else if (
      input.includes("투자") ||
      input.includes("수익") ||
      input.includes("펀드")
    ) {
      products = sampleProducts["투자"];
    } else {
      products = sampleProducts["안전"];
    }

    // 2.5초 후 응답
    setTimeout(() => {
      setIsLoading(false);

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `🎯 ${products.length}개의 맞춤 상품을 발견했어요! 지도에서 확인해보세요 📍`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // 1초 후 핀 드롭 시작
      setTimeout(() => {
        dropPins(products);
      }, 1000);
    }, 2500);
  };

  // 핀 클릭 핸들러
  const handlePinClick = (pin) => {
    setSelectedPin(selectedPin?.id === pin.id ? null : pin);
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 별자리 컴포넌트
  const Constellation = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            opacity: 0.4 + Math.random() * 0.4,
          }}
        />
      ))}
      {/* 연결선들 */}
      <svg className="absolute inset-0 w-full h-full">
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1={`${Math.random() * 100}%`}
            y1={`${Math.random() * 100}%`}
            x2={`${Math.random() * 100}%`}
            y2={`${Math.random() * 100}%`}
            stroke="rgba(6, 182, 212, 0.2)"
            strokeWidth="1"
            className="animate-pulse"
          />
        ))}
      </svg>
    </div>
  );

  // 데이터 스트림 컴포넌트
  const DataStreams = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 bg-gradient-to-b from-transparent via-emerald-400 to-transparent animate-pulse"
          style={{
            left: `${10 + i * 15}%`,
            height: "100%",
            animationDelay: `${i * 0.5}s`,
            animationDuration: "3s",
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );

  // Pin 컴포넌트 (프리미엄 스타일)
  const Pin = ({ pin, isSelected, onClick }) => {
    const style = pinStyles[pin.type];
    const IconComponent = style.icon;

    return (
      <div
        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all duration-500 ${
          pin.animation === "drop" ? "animate-bounce" : ""
        } ${isSelected ? "scale-125 z-30" : "hover:scale-110 z-20"}`}
        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        onClick={() => onClick(pin)}
      >
        {/* 글로우 효과 */}
        <div
          className={`absolute inset-0 rounded-full blur-lg ${style.bgGlow}`}
          style={{
            backgroundColor: style.color,
            opacity: isSelected ? 0.4 : 0.2,
            transform: "scale(1.5)",
          }}
        />

        {/* 메인 핀 */}
        <div
          className="relative w-16 h-16 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl border-3 border-white/20 backdrop-blur-sm"
          style={{
            backgroundColor: style.color,
            boxShadow: `0 0 30px ${style.color}40, 0 10px 20px rgba(0,0,0,0.3)`,
          }}
        >
          <IconComponent className="w-8 h-8 sm:w-7 sm:h-7 text-white drop-shadow-lg" />
        </div>

        {/* 적합도 배지 (그라데이션) */}
        <div
          className="absolute -top-3 -right-3 w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg backdrop-blur-sm border border-white/30"
          style={{
            background: `linear-gradient(135deg, ${style.color}, ${style.color}cc)`,
            boxShadow: `0 4px 15px ${style.color}40`,
          }}
        >
          {pin.suitability}%
        </div>

        {/* 펄스 애니메이션 (선택 시) */}
        {isSelected && (
          <div
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{
              borderColor: style.color,
              transform: "scale(1.5)",
            }}
          />
        )}
      </div>
    );
  };

  // 지역 허브 컴포넌트
  const RegionalHub = ({ hub }) => (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
    >
      <div
        className={`rounded-full border-2 border-white/10 backdrop-blur-sm ${
          hub.size === "large"
            ? "w-24 h-24"
            : hub.size === "medium"
            ? "w-18 h-18"
            : "w-14 h-14"
        }`}
        style={{
          backgroundColor: `${hub.color}15`,
          borderColor: `${hub.color}40`,
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div
            className="text-xs font-bold text-white/80"
            style={{ color: hub.color }}
          >
            {hub.name}
          </div>
          <div className="text-xs text-white/60">{hub.products}개</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto bg-gray-950 h-screen flex flex-col overflow-hidden relative">
        {/* 프리미엄 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/80 relative z-30">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-gray-900 font-bold text-lg">₩</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl blur opacity-30"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                FinPick AI
              </h1>
              <p className="text-gray-400 text-sm">
                Premium Financial Intelligence
              </p>
            </div>
          </div>

          {/* 실시간 지표 */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-semibold">
                {liveData.totalProducts}+
              </span>
              <span className="text-gray-400">상품</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">
                {liveData.institutions}+
              </span>
              <span className="text-gray-400">기관</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">LIVE</span>
            </div>
          </div>

          <button
            onClick={() => setShowChat(!showChat)}
            className="relative group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl flex items-center justify-center hover:from-gray-700 hover:to-gray-600 transition-all duration-300 shadow-lg border border-gray-600/50">
              {showChat ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <MessageCircle className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            {!showChat && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            )}
          </button>
        </div>

        {/* 메인 지도 영역 */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 overflow-hidden">
            {/* 배경 효과들 */}
            <Constellation />
            <DataStreams />

            {/* 히트맵 그리드 */}
            <div className="absolute inset-0 opacity-20">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 75% 30%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 65% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 85% 85%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)
                  `,
                }}
              ></div>
            </div>

            {/* 지역 허브들 */}
            {financialHubs.map((hub, index) => (
              <RegionalHub key={index} hub={hub} />
            ))}

            {/* 중앙 안내 메시지 */}
            {pins.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center backdrop-blur-xl bg-black/20 rounded-3xl p-8 border border-white/10">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-6 mx-auto relative">
                    <MapPin className="w-10 h-10 text-emerald-400" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full blur-xl opacity-30"></div>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    AI 금융 지도
                  </h3>
                  <p className="text-gray-300 text-center leading-relaxed mb-4">
                    우상단 채팅 버튼을 눌러
                    <br />
                    원하는 상품을 말해보세요
                  </p>
                  <p className="text-gray-500 text-sm">
                    AI가 실시간으로 최적의
                    <br />
                    금융상품을 지도에 표시합니다
                  </p>
                </div>
              </div>
            )}

            {/* 프리미엄 로딩 상태 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-xl bg-black/40">
                <div className="text-center backdrop-blur-xl bg-gray-900/80 rounded-3xl p-8 border border-gray-700/50">
                  {/* 이중 회전 스피너 */}
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-400/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin animation-reverse"></div>
                  </div>

                  <h3 className="text-white text-xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    AI 분석 진행 중...
                  </h3>

                  {/* 진행률 바 */}
                  <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>

                  <p className="text-gray-300 text-sm">
                    340+ 상품 중에서 최적 매칭 중
                  </p>
                </div>
              </div>
            )}

            {/* 핀들 */}
            <div ref={mapRef} className="relative w-full h-full">
              {pins.map((pin) => (
                <Pin
                  key={pin.id}
                  pin={pin}
                  isSelected={selectedPin?.id === pin.id}
                  onClick={handlePinClick}
                />
              ))}
            </div>

            {/* 상품 발견 카운터 */}
            {pins.length > 0 && (
              <div className="absolute top-6 left-6 backdrop-blur-xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 border border-emerald-400/30 text-white px-6 py-3 rounded-2xl shadow-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="font-bold text-lg">
                    {pins.length}개 발견
                  </span>
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
            )}

            {/* 지도 범례 */}
            {pins.length > 0 && (
              <div className="absolute bottom-6 left-6 backdrop-blur-xl bg-black/40 border border-gray-700/50 rounded-2xl p-4">
                <h4 className="text-white text-sm font-semibold mb-3">
                  상품 분포
                </h4>
                <div className="space-y-2">
                  {Object.entries(pinStyles).map(([type, style]) => {
                    const count = pins.filter(
                      (pin) => pin.type === type
                    ).length;
                    if (count === 0) return null;

                    return (
                      <div
                        key={type}
                        className="flex items-center space-x-2 text-xs"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: style.color }}
                        ></div>
                        <span className="text-gray-300">{style.name}</span>
                        <span className="text-gray-500">({count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 채팅 오버레이 (글래스모피즘) */}
          {showChat && (
            <div className="absolute inset-0 backdrop-blur-xl bg-black/50 z-20 flex flex-col">
              <div className="backdrop-blur-xl bg-gray-950/90 border-b border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <h2 className="text-white font-bold text-lg">AI 상담사</h2>
                  </div>
                  <button
                    onClick={() => setShowChat(false)}
                    className="w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm border border-gray-600/30"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* 채팅 메시지 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-sm backdrop-blur-sm border ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 border-transparent shadow-lg"
                          : "bg-gray-800/50 text-white border-gray-700/30"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800/50 text-white p-4 rounded-2xl backdrop-blur-sm border border-gray-700/30">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm">AI 분석 중...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 프리미엄 채팅 입력창 */}
              <div className="p-6 backdrop-blur-xl bg-gray-950/90 border-t border-gray-700/50">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="원하는 금융상품을 자연어로 말씀해주세요..."
                      className="w-full bg-gray-800/50 backdrop-blur-sm text-white rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 placeholder-gray-400 text-sm border border-gray-700/30 transition-all"
                      rows="2"
                      style={{ maxHeight: "100px" }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="relative group w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-emerald-400/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5 text-gray-900" />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 프리미엄 상품 상세 카드 */}
        {selectedPin && (
          <div className="absolute bottom-0 left-0 right-0 backdrop-blur-xl bg-white/95 rounded-t-3xl shadow-2xl z-30 transform transition-all duration-500 border-t border-gray-200/50">
            <div className="p-6">
              {/* 드래그 핸들 */}
              <div className="w-16 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-xl">
                      {selectedPin.name}
                    </h3>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{
                        backgroundColor: pinStyles[selectedPin.type].color,
                      }}
                    >
                      {pinStyles[selectedPin.type].name}
                    </div>
                  </div>
                  <p className="text-gray-600 flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{selectedPin.bank}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-emerald-600 font-medium">
                      {selectedPin.region}
                    </span>
                  </p>
                </div>
                <div className="text-right ml-6">
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{ color: pinStyles[selectedPin.type].color }}
                  >
                    {selectedPin.rate}%
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    연 수익률
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <PiggyBank className="w-4 h-4 text-gray-600" />
                    <div className="text-xs text-gray-600 font-medium">
                      최소 금액
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 text-lg">
                    {selectedPin.minAmount}만원
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                    <div className="text-xs text-gray-600 font-medium">
                      월 납입
                    </div>
                  </div>
                  <div className="font-bold text-gray-900 text-lg">
                    {selectedPin.monthlyAmount}만원
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl p-6 mb-6 border border-emerald-200/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-gray-700">
                      적합도 분석
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: pinStyles[selectedPin.type].color,
                      }}
                    ></div>
                    <span
                      className="font-bold text-2xl"
                      style={{ color: pinStyles[selectedPin.type].color }}
                    >
                      {selectedPin.suitability}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {selectedPin.reason}
                </div>

                {/* 적합도 프로그레스 바 */}
                <div className="mt-4 w-full h-2 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 rounded-full"
                    style={{
                      width: `${selectedPin.suitability}%`,
                      background: `linear-gradient(90deg, ${
                        pinStyles[selectedPin.type].color
                      }, ${pinStyles[selectedPin.type].color}cc)`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  className="flex-1 py-4 rounded-2xl font-semibold text-white transition-all hover:shadow-lg transform hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${
                      pinStyles[selectedPin.type].color
                    }, ${pinStyles[selectedPin.type].color}cc)`,
                    boxShadow: `0 10px 25px ${
                      pinStyles[selectedPin.type].color
                    }40`,
                  }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>자세히 보기</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-semibold text-gray-700 transition-all transform hover:scale-105 border border-gray-200"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 프리미엄 빠른 질문 버튼들 */}
        {pins.length === 0 && !isLoading && !showChat && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="backdrop-blur-xl bg-black/40 border border-gray-700/30 rounded-3xl p-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <p className="text-white font-semibold">빠른 상담 시작</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setInputValue("월 50만원씩 안전하게 저축하고 싶어요");
                    setTimeout(handleSendMessage, 100);
                  }}
                  className="p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 rounded-2xl text-white text-sm text-left transition-all duration-300 border border-emerald-500/20 hover:border-emerald-500/40 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="font-semibold">안전한 저축</div>
                      <div className="text-xs text-gray-300">
                        월 50만원 정기적금
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setInputValue("투자로 수익을 내고 싶어요");
                    setTimeout(handleSendMessage, 100);
                  }}
                  className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-2xl text-white text-sm text-left transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="font-semibold">투자 수익</div>
                      <div className="text-xs text-gray-300">
                        펀드 & ETF 추천
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinPickPremiumMap;
