import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Shield,
  PiggyBank,
  Home,
  X,
  MapPin,
  Activity,
  Building,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

// 🔗 API 서비스 import (Adjust path if necessary)
import {
  SmartRecommendationService,
  ApiUtils,
} from "../../services/backendApi";

const FinPickPremiumMap = () => {
  // --- State and Refs ---
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "안녕하세요! 원하는 금융상품을 말씀해주세요. AI가 실시간으로 최적의 상품들을 찾아드릴게요! 🗺️",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // 🔗 API 연동 관련 상태
  const [serverConnected, setServerConnected] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  const [liveData, setLiveData] = useState({
    totalProducts: 340,
    institutions: 15,
    realTimeUpdates: "24/7",
    activeMining: true,
  });
  const mapRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling chat

  // --- useEffect Hooks ---
  // 🔗 서버 연결 상태 확인
  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingConnection(true);
      const isConnected = await ApiUtils.checkServerConnection();
      setServerConnected(isConnected);
      setIsCheckingConnection(false);

      if (!isConnected) {
        console.warn(
          "⚠️ 백엔드 서버에 연결할 수 없습니다. 더미 데이터를 사용합니다."
        );
      } else {
        console.log("✅ 백엔드 서버 연결됨");
      }
    };

    checkConnection();
  }, []);

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

  // 채팅 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- Constant Data ---
  // 🎯 금융 도메인별 허브 데이터
  const financialHubs = [
    {
      name: "예금/적금",
      description: "안전한 저축상품",
      x: 25,
      y: 25,
      color: "#3B82F6",
      size: "large",
      products: 296,
      avgRate: 3.2,
      riskLevel: "낮음",
      keywords: ["안전", "저축", "적금", "예금", "안정", "보장"],
    },
    {
      name: "투자상품",
      description: "수익성 중심 상품",
      x: 75,
      y: 25,
      color: "#10B981",
      size: "large",
      products: 85,
      avgRate: 6.8,
      riskLevel: "중-고위험",
      keywords: ["투자", "수익", "펀드", "ETF", "주식", "채권"],
    },
    {
      name: "대출상품",
      description: "자금조달 솔루션",
      x: 25,
      y: 75,
      color: "#F59E0B",
      size: "large",
      products: 44,
      avgRate: 4.5,
      riskLevel: "해당없음",
      keywords: ["대출", "신용대출", "주택담보", "자금", "대여", "론"],
    },
    {
      name: "특화상품",
      description: "맞춤형 금융상품",
      x: 75,
      y: 75,
      color: "#8B5CF6",
      size: "medium",
      products: 55,
      avgRate: 4.1,
      riskLevel: "다양",
      keywords: ["특화", "맞춤", "프리미엄", "VIP", "개인화", "청년", "시니어"],
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

  // 🏦 도메인별 샘플 상품 데이터 (폴백용)
  const sampleProducts = {
    "예금/적금": [
      {
        id: 1,
        name: "KB국민은행 정기적금",
        type: "savings",
        rate: 3.5,
        minAmount: 10,
        suitability: 98,
        reason: "높은 금리, 낮은 위험도",
        monthlyAmount: 50,
        bank: "KB국민은행",
        domain: "예금/적금",
      },
      {
        id: 2,
        name: "신한 쌓이는적금",
        type: "savings",
        rate: 3.2,
        minAmount: 1,
        suitability: 92,
        reason: "낮은 최소금액, 높은 안정성",
        monthlyAmount: 30,
        bank: "신한은행",
        domain: "예금/적금",
      },
      {
        id: 3,
        name: "우리 WON정기예금",
        type: "deposit",
        rate: 3.8,
        minAmount: 50,
        suitability: 88,
        reason: "업계 최고 예금금리",
        monthlyAmount: 0,
        bank: "우리은행",
        domain: "예금/적금",
      },
    ],
    투자상품: [
      {
        id: 4,
        name: "삼성 밸런스펀드",
        type: "investment",
        rate: 7.2,
        minAmount: 10,
        suitability: 85,
        reason: "안정적 수익, 분산투자 효과",
        monthlyAmount: 30,
        bank: "삼성자산운용",
        domain: "투자상품",
      },
      {
        id: 5,
        name: "KODEX 200 ETF",
        type: "investment",
        rate: 8.5,
        minAmount: 1,
        suitability: 82,
        reason: "시장 연동, 높은 유동성",
        monthlyAmount: 20,
        bank: "삼성자산운용",
        domain: "투자상품",
      },
    ],
    대출상품: [
      {
        id: 6,
        name: "KB 신용대출",
        type: "loan",
        rate: 4.2,
        minAmount: 100,
        suitability: 88,
        reason: "낮은 금리, 빠른 승인",
        monthlyAmount: 0,
        bank: "KB국민은행",
        domain: "대출상품",
      },
    ],
    특화상품: [
      {
        id: 8,
        name: "청년 창업지원 적금",
        type: "savings",
        rate: 4.0,
        minAmount: 5,
        suitability: 95,
        reason: "청년 전용, 정부 지원금리",
        monthlyAmount: 30,
        bank: "기업은행",
        domain: "특화상품",
      },
    ],
  };

  // --- Helper Functions ---
  // 🔧 백엔드 상품 타입을 프론트엔드 타입으로 매핑
  const mapProductType = (backendType) => {
    const typeMap = {
      정기예금: "deposit",
      적금: "savings",
      신용대출: "loan",
      주택담보대출: "loan",
      투자상품: "investment",
    };
    return typeMap[backendType] || "savings"; // 기본값 'savings'
  };

  // 🔧 상품 유형을 기반으로 도메인 추론
  const inferDomain = (productType) => {
    if (productType.includes("예금") || productType.includes("적금")) {
      return "예금/적금";
    } else if (productType.includes("대출")) {
      return "대출상품";
    } else if (productType.includes("투자") || productType.includes("펀드")) {
      return "투자상품";
    } else {
      return "특화상품";
    }
  };

  // 🔧 월 납입액 추정 (핀 상세 정보용)
  const estimateMonthlyAmount = (product) => {
    const minAmount = product.minimum_amount || 100000;
    if (minAmount >= 10000000) return 0; // 대출은 월 납입이 없을 수 있음
    return Math.max(1, Math.floor(minAmount / 10000 / 10));
  };

  // 🎯 도메인 기반 핀 위치 생성
  const generatePinPositions = (products) => {
    return products.map((product) => {
      const hub =
        financialHubs.find((h) =>
          h.keywords.some(
            (keyword) =>
              product.name.toLowerCase().includes(keyword) ||
              (product.type &&
                product.type.toLowerCase().includes(keyword.toLowerCase())) || // Ensure product.type is defined
              h.name === product.domain
          )
        ) || financialHubs[0]; // Default to the first hub if no match

      return {
        ...product,
        x: hub.x + (Math.random() - 0.5) * 15,
        y: hub.y + (Math.random() - 0.5) * 15,
      };
    });
  };

  // 핀 드롭 애니메이션
  const dropPins = (products) => {
    const positions = generatePinPositions(products);
    setPins([]); // Clear existing pins before dropping new ones

    positions.forEach((product, index) => {
      setTimeout(() => {
        const newPin = {
          ...product,
          animation: "drop",
          id: product.id + Date.now() + index, // Ensure unique ID for animation
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
      }, index * 500); // Staggered drop effect
    });
  };

  // 🔄 폴백 함수 (서버 미연결 시 더미 데이터 사용)
  const handleFallbackRecommendation = async (query) => {
    console.log("🔄 폴백 모드: 더미 데이터 사용");

    const input = query.toLowerCase();
    let selectedDomainName = "예금/적금";

    for (const hub of financialHubs) {
      if (hub.keywords.some((keyword) => input.includes(keyword))) {
        selectedDomainName = hub.name;
        break;
      }
    }

    const products =
      sampleProducts[selectedDomainName] || sampleProducts["예금/적금"];

    setTimeout(() => {
      setIsLoading(false);

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `🎯 ${selectedDomainName} 영역에서 ${
          products.length
        }개의 상품을 발견했어요! ${!serverConnected ? "(데모 모드)" : ""} 📍`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      setTimeout(() => {
        dropPins(products);
      }, 1000);
    }, 2500); // Simulate API delay
  };

  // 🤖 메인 API 연동 메시지 처리 함수
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue("");
    setIsLoading(true);
    setLoadingProgress(0);
    setPins([]);
    setSelectedPin(null);
    setApiError(null);
    setShowChat(false); // Hide chat when message is sent

    try {
      if (serverConnected) {
        // 🚀 실제 백엔드 API 호출
        console.log("🤖 백엔드 AI 추천 요청...");

        const response =
          await SmartRecommendationService.getPersonalizedRecommendations(
            currentQuery,
            null // 나중에 사용자 프로필 추가
          );

        if (response.success) {
          // API 응답에서 상품 데이터 추출
          const products = response.data.products || [];

          // 백엔드 데이터를 프론트엔드 형식으로 변환
          const convertedProducts = products.map((product) => ({
            id: product.product_id,
            name: product.name,
            type: mapProductType(product.type),
            rate: product.interest_rate,
            minAmount: Math.floor(product.minimum_amount / 10000),
            suitability: Math.round(product.match_score),
            reason: product.recommendation_reason,
            monthlyAmount: estimateMonthlyAmount(product),
            bank: product.bank,
            domain: inferDomain(product.type),
          }));

          setIsLoading(false);

          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `🎯 AI 분석 결과: ${
              convertedProducts.length
            }개의 맞춤 상품을 발견했어요! (적합도 평균 ${Math.round(
              response.data.summary?.average_match_score || 85
            )}점) 📍`,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMessage]);

          setTimeout(() => {
            dropPins(convertedProducts);
          }, 1000);
        } else {
          throw new Error(response.error);
        }
      } else {
        // 🔄 서버 연결 안됨 - 더미 데이터 사용
        console.warn("⚠️ 서버 미연결 - 더미 데이터 사용");
        await handleFallbackRecommendation(currentQuery);
      }
    } catch (error) {
      console.error("❌ 추천 요청 실패:", error);
      setApiError(ApiUtils.formatErrorMessage(error));

      // 에러 시 폴백으로 더미 데이터 사용
      await handleFallbackRecommendation(currentQuery);
    }
  };

  // 피드백 제출 함수
  const handleProductFeedback = async (productId, rating) => {
    try {
      if (serverConnected) {
        const response = await SmartRecommendationService.submitProductFeedback(
          productId,
          rating,
          "사용자가 상품을 선택했습니다."
        );

        if (response.success) {
          console.log("✅ 피드백 전송 성공");
        }
      }
    } catch (error) {
      console.error("❌ 피드백 전송 실패:", error);
    }
  };

  // 핀 클릭 핸들러 (피드백 추가)
  const handlePinClick = async (pin) => {
    setSelectedPin(selectedPin?.id === pin.id ? null : pin);

    // 피드백 전송 (상품 선택 = 긍정적 피드백)
    if (selectedPin?.id !== pin.id) {
      await handleProductFeedback(pin.id, 4); // 5점 만점에 4점
    }
  };

  // 🔄 연결 재시도 함수
  const retryConnection = async () => {
    setIsCheckingConnection(true);
    setApiError(null);

    const isConnected = await ApiUtils.checkServerConnection();
    setServerConnected(isConnected);
    setIsCheckingConnection(false);

    if (isConnected) {
      console.log("✅ 서버 재연결 성공");
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Sub-Components (Render Logic) ---
  // 🌟 서버 상태 표시 컴포넌트
  const ServerStatus = () => (
    <div className="flex items-center space-x-2">
      {isCheckingConnection ? (
        <>
          <RefreshCw className="w-3 h-3 text-yellow-400 animate-spin" />
          <span className="text-xs text-yellow-400">연결 확인 중...</span>
        </>
      ) : (
        <>
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              serverConnected ? "bg-emerald-400" : "bg-red-400"
            }`}
          ></div>
          <span
            className={`text-xs ${
              serverConnected ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {serverConnected ? "AI 연결됨" : "데모 모드"}
          </span>
        </>
      )}
    </div>
  );

  // 🚨 에러 메시지 컴포넌트
  const ErrorMessage = ({ error, onRetry }) => (
    <div className="absolute top-20 left-6 right-6 bg-red-900/80 border border-red-500/50 text-white px-4 py-3 rounded-2xl backdrop-blur-xl z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm">API 오류: {error}</span>
        </div>
        <button
          onClick={onRetry}
          className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>재시도</span>
        </button>
      </div>
    </div>
  );

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

  // Pin 컴포넌트
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

        {/* 적합도 배지 */}
        <div
          className="absolute -top-3 -right-3 w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg backdrop-blur-sm border border-white/30"
          style={{
            background: `linear-gradient(135deg, ${style.color}, ${style.color}cc)`,
            boxShadow: `0 4px 15px ${style.color}40`,
          }}
        >
          {pin.suitability}%
        </div>

        {/* 펄스 애니메이션 */}
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

  // 도메인 허브 컴포넌트
  const RegionalHub = ({ hub }) => (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
    >
      <div
        className={`rounded-2xl border-2 border-white/10 backdrop-blur-sm ${
          hub.size === "large"
            ? "w-32 h-24"
            : hub.size === "medium"
            ? "w-24 h-18"
            : "w-18 h-14"
        }`}
        style={{
          backgroundColor: `${hub.color}15`,
          borderColor: `${hub.color}40`,
        }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
          <div
            className="text-sm font-bold text-white mb-1"
            style={{ color: hub.color }}
          >
            {hub.name}
          </div>
          <div className="text-xs text-white/60 text-center leading-tight">
            {hub.description}
          </div>
          <div className="text-xs text-white/40 mt-1">
            {hub.products}개 상품
          </div>
        </div>
      </div>
    </div>
  );

  // --- Main Return Statement (JSX) ---
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto bg-gray-950 h-screen flex flex-col overflow-hidden relative">
        {/* 🚨 에러 메시지 표시 */}
        {apiError && (
          <ErrorMessage error={apiError} onRetry={retryConnection} />
        )}

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

          {/* 실시간 지표 + 서버 상태 */}
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <ServerStatus />
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
                    radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 75% 25%, rgba(16, 185, 129, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 25% 75%, rgba(245, 158, 11, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
                  `,
                }}
              ></div>
            </div>

            {/* 도메인 허브들 */}
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
                    AI 금융 도메인 지도
                  </h3>
                  <p className="text-gray-300 text-center leading-relaxed mb-4">
                    우상단 채팅 버튼을 눌러
                    <br />
                    원하는 상품을 말해보세요
                  </p>
                  <p className="text-gray-500 text-sm">
                    {serverConnected
                      ? "AI가 실시간으로 최적의"
                      : "데모 모드로 샘플"}
                    <br />
                    금융상품을 도메인별로 표시합니다
                  </p>
                </div>
              </div>
            )}

            {/* 프리미엄 로딩 상태 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-xl bg-black/40">
                <div className="text-center backdrop-blur-xl bg-gray-900/80 rounded-3xl p-8 border border-gray-700/50">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-400/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin animation-reverse"></div>
                  </div>

                  <h3 className="text-white text-xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    {serverConnected
                      ? "AI 분석 진행 중..."
                      : "데모 분석 진행 중..."}
                  </h3>

                  <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>

                  <p className="text-gray-300 text-sm">
                    {loadingProgress < 30
                      ? serverConnected
                        ? "AI 키워드 분석 중..."
                        : "키워드 분석 중..."
                      : loadingProgress < 60
                      ? "도메인 매칭 중..."
                      : loadingProgress < 90
                      ? "상품 필터링 중..."
                      : "결과 준비 중..."}
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
                  {serverConnected && (
                    <span className="text-xs bg-emerald-500/20 px-2 py-1 rounded-lg">
                      AI
                    </span>
                  )}
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

          {/* 채팅 오버레이 */}
          {showChat && (
            <div className="absolute inset-0 backdrop-blur-xl bg-black/50 z-20 flex flex-col">
              <div className="backdrop-blur-xl bg-gray-950/90 border-b border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        serverConnected ? "bg-emerald-400" : "bg-yellow-400"
                      }`}
                    ></div>
                    <h2 className="text-white font-bold text-lg">
                      {serverConnected ? "AI 상담사" : "AI 상담사 (데모)"}
                    </h2>
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
                      className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                        message.type === "user"
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-gray-800 text-gray-200 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <span className="text-xs text-white/60 mt-1 block text-right">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* For auto-scrolling */}
              </div>

              {/* 채팅 입력 */}
              <div className="p-4 border-t border-gray-700/50 backdrop-blur-xl bg-gray-950/90 flex items-center space-x-3">
                <textarea
                  className="flex-1 bg-gray-800 text-white rounded-lg p-3 resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-gray-500 text-sm custom-scrollbar"
                  rows="1"
                  placeholder={
                    isLoading ? "AI 분석 중..." : "금융 상품을 검색해보세요..."
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                ></textarea>
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          )}

          {/* 선택된 핀 상세 정보 */}
          {selectedPin && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-3xl p-6 shadow-2xl z-50 animate-fade-in-up w-full max-w-sm">
              <button
                onClick={() => setSelectedPin(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                  style={{
                    backgroundColor: pinStyles[selectedPin.type]?.color,
                  }}
                >
                  {React.createElement(pinStyles[selectedPin.type]?.icon, {
                    className: "w-6 h-6 text-white",
                  })}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-0.5">
                    {selectedPin.name}
                  </h3>
                  <p className="text-sm text-gray-400">{selectedPin.bank}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-gray-400">유형</p>
                  <p className="text-white font-medium">
                    {pinStyles[selectedPin.type]?.name}
                  </p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-gray-400">금리/수익률</p>
                  <p className="text-emerald-400 font-medium">
                    {selectedPin.rate}%
                  </p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-gray-400">최소 금액</p>
                  <p className="text-white font-medium">
                    {selectedPin.minAmount}만원
                  </p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-gray-400">적합도</p>
                  <p className="text-yellow-400 font-medium">
                    {selectedPin.suitability}%
                  </p>
                </div>
                {selectedPin.monthlyAmount > 0 && (
                  <div className="bg-gray-800 p-3 rounded-lg col-span-2">
                    <p className="text-gray-400">월 예상 납입액</p>
                    <p className="text-white font-medium">
                      {selectedPin.monthlyAmount}만원
                    </p>
                  </div>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed border-t border-gray-700/50 pt-4">
                <span className="font-semibold text-white">추천 사유: </span>
                {selectedPin.reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinPickPremiumMap;
