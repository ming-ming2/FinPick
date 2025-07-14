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
    totalProducts: 379, // 340 → 379로 업데이트
    institutions: 15,
    realTimeUpdates: "24/7",
    activeMining: true,
  });
  const mapRef = useRef(null);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling chat

  // 🔗 추가 상태 변수
  const [userProfile, setUserProfile] = useState(null);
  const [userInsights, setUserInsights] = useState({});
  const [personalizationLevel, setPersonalizationLevel] = useState("none");
  const [recommendationReasoning, setRecommendationReasoning] = useState("");
  const [dataSourceInfo, setDataSourceInfo] = useState(null);

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
        totalProducts: 379 + Math.floor(Math.random() * 5),
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

  // 🔥 추가: 사용자 프로필 로딩
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // user prop이 없으므로, 항상 로딩 시도 (혹은 필요에 따라 조건 추가)
        console.log("👤 사용자 프로필 로딩 시작");
        const profile =
          await SmartRecommendationService.getComprehensiveUserProfile();
        setUserProfile(profile);
        setDataSourceInfo(profile?.dataSource);
        console.log("✅ 사용자 프로필 로딩 완료:", profile);
      } catch (error) {
        console.error("❌ 사용자 프로필 로딩 실패:", error);
      }
    };
    loadUserProfile();
  }, []); // user prop이 없으므로 빈 배열로 설정, 필요 시 user state 추가

  // --- Constant Data ---
  // 🎯 금융 도메인별 허브 데이터 - 2개 도메인으로 단순화
  const financialHubs = [
    {
      name: "예금/적금",
      description: "안전한 저축상품",
      x: 35, // 좀 더 가운데로 이동
      y: 40,
      color: "#3B82F6", // 파란색 유지
      size: "large",
      products: 296, // 140(예금) + 156(적금)
      avgRate: 3.2,
      riskLevel: "낮음",
      keywords: [
        "안전",
        "저축",
        "적금",
        "예금",
        "안정",
        "보장",
        "목돈",
        "모으기",
      ],
    },
    {
      name: "대출상품",
      description: "자금조달 솔루션",
      x: 65, // 좀 더 가운데로 이동
      y: 40,
      color: "#F59E0B", // 주황색 유지
      size: "large",
      products: 83, // 44(신용대출) + 39(주택담보대출)
      avgRate: 4.1,
      riskLevel: "해당없음",
      keywords: [
        "대출",
        "신용대출",
        "주택담보",
        "자금",
        "대여",
        "론",
        "빌리기",
        "융자",
      ],
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
      // Keep investment for mapping but will not be used for display
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
      // 기존 투자상품 샘플 데이터 일부를 예금/적금으로 이동 가능
      {
        id: 4,
        name: "미래에셋 배당플러스",
        type: "deposit", // Changed to deposit
        rate: 4.2,
        minAmount: 50,
        suitability: 85,
        reason: "안정적 배당수익 기대",
        monthlyAmount: 0,
        bank: "미래에셋",
        domain: "예금/적금",
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
      {
        id: 7,
        name: "하나 주택담보대출",
        type: "loan",
        rate: 3.8,
        minAmount: 1000,
        suitability: 90,
        reason: "최저 금리 주택담보",
        monthlyAmount: 0,
        bank: "하나은행",
        domain: "대출상품",
      },
    ],
  };

  // --- Helper Functions ---
  // 🔧 백엔드 상품 타입을 프론트엔드 타입으로 매핑
  const mapProductType = (backendType) => {
    const typeMap = {
      // 예금/적금 관련
      정기예금: "deposit",
      예금: "deposit",
      적금: "savings",
      정기적금: "savings",
      자유적금: "savings",

      // 대출 관련
      신용대출: "loan",
      주택담보대출: "loan",
      마이너스대출: "loan",
      대출: "loan",

      // 투자상품 관련 매핑 삭제
    };
    return typeMap[backendType] || "savings"; // 기본값
  };

  // 🔧 상품 유형을 기반으로 도메인 추론 - 🔥 오류 수정
  const inferDomain = (productType) => {
    if (!productType || typeof productType !== "string") {
      return "예금/적금"; // 기본값
    }

    const type = productType.toLowerCase();

    // 대출 관련 키워드 체크
    const loanKeywords = [
      "대출",
      "loan",
      "신용대출",
      "주택담보대출",
      "마이너스대출",
    ];
    if (loanKeywords.some((keyword) => type.includes(keyword))) {
      return "대출상품";
    }

    // 예금/적금 관련은 기본값
    return "예금/적금";
  };

  // 🔧 월 납입액 추정 함수도 수정
  const estimateMonthlyAmount = (product) => {
    // 백엔드 응답 구조에 맞게 수정
    const minAmount = product.minimum_amount || 100000;
    if (minAmount >= 10000000) return 0; // 대출은 월 납입이 없을 수 있음
    return Math.max(1, Math.floor(minAmount / 10000 / 10));
  };

  // 🎯 도메인 기반 핀 위치 생성 - 🔥 안전성 강화
  const generatePinPositions = (products) => {
    if (!Array.isArray(products)) {
      console.error(
        "❌ generatePinPositions: products가 배열이 아님:",
        products
      );
      return [];
    }

    return products.map((product) => {
      try {
        // 백엔드에서 받은 product.type을 inferDomain으로 전달
        const inferredDomainName = inferDomain(product.type);
        const hub =
          financialHubs.find((h) => h.name === inferredDomainName) ||
          financialHubs[0]; // 기본값으로 첫 번째 허브 사용

        return {
          ...product,
          x: hub.x + (Math.random() - 0.5) * 15,
          y: hub.y + (Math.random() - 0.5) * 15,
        };
      } catch (error) {
        console.error("❌ 핀 위치 생성 오류:", error, product);
        // 오류 시 기본 위치 반환
        return {
          ...product,
          x: financialHubs[0].x + (Math.random() - 0.5) * 15,
          y: financialHubs[0].y + (Math.random() - 0.5) * 15,
        };
      }
    });
  };

  // 핀 드롭 애니메이션
  const dropPins = (products) => {
    setPins([]); // Clear existing pins before dropping new ones

    products.forEach((product, index) => {
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
          pingElement.style.left = `${newPin.x}%`;
          pingElement.style.top = `${newPin.y}%`;
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
    let selectedDomainName = "예금/적금"; // 기본값

    // 대출 관련 키워드 체크
    const loanKeywords = [
      "대출",
      "빌리",
      "급전",
      "필요",
      "융통",
      "살려",
      "자금",
      "론",
    ];
    if (loanKeywords.some((keyword) => input.includes(keyword))) {
      selectedDomainName = "대출상품";
    }
    // 예금/적금은 기본값이므로 별도 체크 불필요

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

  // 🔧 백엔드 데이터를 프론트엔드 형식으로 변환 - 🔥 올바른 버전
  const convertBackendProducts = (products) => {
    if (!Array.isArray(products)) {
      console.error("❌ products가 배열이 아님:", products);
      return [];
    }

    return products.map((product, index) => {
      try {
        console.log(`🔍 상품 ${index + 1} 변환:`, {
          product_id: product.product_id,
          product_name: product.product_name,
          provider_name: product.provider_name,
          interest_rate: product.interest_rate,
          minimum_amount: product.minimum_amount,
          match_score: product.match_score, // 🔥 추가 로그
          ai_analysis_score: product.ai_analysis?.model_fit_score, // 🔥 추가 로그
        });

        return {
          id: product.product_id || `product_${Date.now()}_${index}`,
          name: product.product_name || "상품명 미제공",
          type: mapProductType(product.product_type || "savings"),
          rate: product.interest_rate || 0,
          minAmount: Math.floor((product.minimum_amount || 100000) / 10000),
          // 🔥 점수 매핑 개선: 여러 필드에서 점수 찾기
          suitability: Math.round(
            product.match_score || product.ai_analysis?.model_fit_score || 75
          ),
          reason:
            product.recommendation_reason ||
            product.ai_analysis?.contribution ||
            "AI 추천 상품",
          monthlyAmount: estimateMonthlyAmount(product),
          bank: product.provider_name || "은행명 미제공",
          domain: inferDomain(product.product_type || "savings"),
          // 🔥 추가: AI 분석 및 사용자 특정 정보 포함
          aiAnalysis: product.ai_analysis,
          userSpecific: product.user_specific,
          originalProduct: product,
        };
      } catch (error) {
        console.error("❌ 상품 변환 오류:", error, product);
        return {
          id: `error_product_${Date.now()}_${index}`,
          name: "상품 정보 오류",
          type: "savings",
          rate: 0,
          minAmount: 10,
          suitability: 50,
          reason: "상품 정보를 불러오는데 오류가 발생했습니다.",
          monthlyAmount: 10,
          bank: "정보 없음",
          domain: "예금/적금",
        };
      }
    });
  };

  // 🤖 메인 API 연동 메시지 처리 함수 - 🔥 오류 처리 강화 (handleSearch와 동일한 역할)
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
    setShowChat(false);

    // 🔥 추가: 개인화 정보 초기화
    setPersonalizationLevel("none");
    setUserInsights({});
    setRecommendationReasoning("");

    try {
      if (serverConnected) {
        console.log("🤖 백엔드 AI 추천 요청...");

        const response =
          await SmartRecommendationService.getPersonalizedRecommendations(
            currentQuery,
            null // userProfile 정보는 서비스 내부에서 처리한다고 가정
          );

        if (response.success) {
          // 🔥 안전한 데이터 추출 및 변환
          // 백엔드 응답의 recommendations 필드 사용
          // 567번째 줄 근처
          const products =
            response.data?.data?.recommendations ||
            response.data?.recommendations ||
            [];
          console.log("📦 받은 상품 데이터:", products);

          // 🔥 안전한 변환 함수 사용
          const convertedProducts = convertBackendProducts(products);
          console.log("🔄 변환된 상품 데이터:", convertedProducts);

          setIsLoading(false);

          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `🎯 AI 분석 결과: ${
              convertedProducts.length
            }개의 맞춤 상품을 발견했어요! (적합도 평균 ${Math.round(
              response.data?.ai_insights?.confidence_score * 100 || 85
            )}점) 📍`, // ai_insights 접근 방식 수정
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMessage]);

          setTimeout(() => {
            dropPins(convertedProducts);
          }, 1000);

          // 🔥 추가: 개인화 정보 설정
          setPersonalizationLevel(response.personalization_level || "none");
          setUserInsights(response.user_insights || {});
          setRecommendationReasoning(response.recommendation_reasoning || "");
        } else {
          throw new Error(response.error);
        }
      } else {
        console.warn("⚠️ 서버 미연결 - 더미 데이터 사용");
        await handleFallbackRecommendation(currentQuery);
      }
    } catch (error) {
      console.error("❌ 추천 요청 실패:", error);
      setApiError(ApiUtils.formatErrorMessage(error));

      // 🔥 에러 시 안전한 폴백
      console.log("🔄 폴백 모드: 더미 데이터 사용");
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
            {" "}
            {serverConnected ? "AI 연결됨" : "데모 모드"}{" "}
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

  // 🔥 PersonalizationBadge 컴포넌트 추가
  const PersonalizationBadge = ({ level }) => {
    const badges = {
      none: { text: "일반 추천", color: "bg-gray-600", icon: "🔍" },
      basic: { text: "기본 맞춤", color: "bg-blue-600", icon: "👤" },
      low: { text: "부분 맞춤", color: "bg-green-600", icon: "🎯" },
      medium: { text: "개인화 추천", color: "bg-purple-600", icon: "🧠" },
      high: { text: "고도 개인화", color: "bg-yellow-600", icon: "⭐" },
    };
    const badge = badges[level] || badges["basic"];
    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${badge.color}`}
      >
        <span className="mr-1">{badge.icon}</span> {badge.text}
      </div>
    );
  };

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
        <div className="absolute -top-3 -right-3 w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-lg border border-purple-400">
          {pin.suitability}%
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative font-sans overflow-hidden">
      <Constellation />
      <DataStreams />

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between border-b border-gray-800 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-600 text-transparent bg-clip-text">
            FinPick AI
          </h1>
          <ServerStatus />
        </div>
        <div className="flex items-center space-x-4">
          <PersonalizationBadge level={personalizationLevel} />
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            title="Toggle Chat"
          >
            <MessageCircle className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </header>

      {/* Main Content - Map and Chat */}
      <main className="relative flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Map Section */}
        <section
          ref={mapRef}
          className="relative flex-1 bg-gray-900/50 flex items-center justify-center overflow-hidden"
        >
          {apiError && (
            <ErrorMessage error={apiError} onRetry={retryConnection} />
          )}

          {/* Live Data Dashboard */}
          <div className="absolute top-6 left-6 z-10 bg-gray-800/70 backdrop-blur-xl rounded-xl p-4 shadow-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-purple-300 mb-3">
              실시간 금융 시장 지표
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <span>총 금융상품:</span>
                <span className="font-bold text-emerald-400">
                  {liveData.totalProducts.toLocaleString()}개
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-fuchsia-400" />
                <span>참여 기관:</span>
                <span className="font-bold text-orange-400">
                  {liveData.institutions}개
                </span>
              </div>
              <div className="flex items-center space-x-2 col-span-2">
                <RefreshCw className="w-4 h-4 text-yellow-400" />
                <span>데이터 업데이트:</span>
                <span className="font-bold text-purple-400">
                  {liveData.realTimeUpdates}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Hubs */}
          {financialHubs.map((hub, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-full shadow-2xl text-center cursor-pointer hover:scale-105 transition-transform duration-300 backdrop-blur-lg"
              style={{
                left: `${hub.x}%`,
                top: `${hub.y}%`,
                width: hub.size === "large" ? "160px" : "120px",
                height: hub.size === "large" ? "160px" : "120px",
                boxShadow: `0 0 40px ${hub.color}60, 0 10px 30px rgba(0,0,0,0.5)`,
              }}
            >
              <h4 className="text-lg font-bold" style={{ color: hub.color }}>
                {hub.name}
              </h4>
              <p className="text-xs text-gray-300 mt-1">{hub.description}</p>
              <div className="mt-2 text-sm text-gray-400">
                <p>상품 수: {hub.products}개</p>
                <p>평균 금리: {hub.avgRate}%</p>
              </div>
            </div>
          ))}

          {/* Product Pins */}
          {pins.map((pin) => (
            <Pin
              key={pin.id}
              pin={pin}
              isSelected={selectedPin?.id === pin.id}
              onClick={handlePinClick}
            />
          ))}

          {pins.length === 0 && !isLoading && (
            <p className="text-gray-400 text-lg">
              지도에서 금융 상품을 찾아보세요!
            </p>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-purple-300 text-lg">
                  AI가 최적의 금융상품을 분석 중입니다...
                </p>
                <div className="w-48 bg-gray-700 rounded-full h-2.5 mt-3 mx-auto">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2.5 rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400 mt-2 block">
                  {Math.round(loadingProgress)}% 완료
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Chat Section */}
        <div
          className={`fixed inset-y-0 right-0 w-full md:w-96 bg-gray-900/90 backdrop-blur-xl z-50 transform transition-transform duration-300 ease-in-out ${
            showChat ? "translate-x-0" : "translate-x-full"
          } md:relative md:translate-x-0 md:flex md:flex-col md:h-auto md:max-h-full md:border-l border-gray-800`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-800 md:hidden">
            <h2 className="text-lg font-bold text-purple-300">AI 금융 비서</h2>
            <button
              onClick={() => setShowChat(false)}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${
                    message.type === "user"
                      ? "bg-purple-700 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <p>{message.content}</p>
                  <span className="block text-xs text-gray-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="flex bg-gray-800 rounded-lg overflow-hidden">
              <input
                type="text"
                className="flex-1 p-3 bg-transparent outline-none text-gray-100 placeholder-gray-500"
                placeholder="궁금한 금융 상품을 질문해주세요..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                className="p-3 bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            {/* 🔥 추가: API 데이터 출처 정보 */}
            {dataSourceInfo && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                데이터 출처: {dataSourceInfo.type} (업데이트:{" "}
                {new Date(dataSourceInfo.lastUpdated).toLocaleDateString()})
              </p>
            )}
          </div>

          {/* Selected Pin Details (Chat overlay or separate section) */}
          {selectedPin && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800/95 backdrop-blur-xl border-t border-gray-700 z-50 max-h-1/2 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-bold text-emerald-400">
                  📍 {selectedPin.name}
                </h4>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-1 rounded-full hover:bg-gray-700"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  • 은행: <span className="font-medium">{selectedPin.bank}</span>
                </p>
                <p>
                  • 타입:{" "}
                  <span className="font-medium">
                    {pinStyles[selectedPin.type]?.name || "기타"}
                  </span>
                </p>
                <p>
                  • 금리:{" "}
                  <span className="font-medium">{selectedPin.rate}%</span>
                </p>
                <p>
                  • 최소 금액:{" "}
                  <span className="font-medium">
                    {selectedPin.minAmount.toLocaleString()}만원
                  </span>
                </p>
                <p>
                  • 적합도:{" "}
                  <span className="font-medium text-emerald-300">
                    {selectedPin.suitability}%
                  </span>
                </p>
                <p>
                  • AI 추천 이유:{" "}
                  <span className="italic text-gray-400">
                    "{selectedPin.reason}"
                  </span>
                </p>
              </div>

              {/* 🔥 추가: AI 분석 결과 및 사용자 특정 정보 섹션 */}
              {selectedPin.aiAnalysis && (
                <div className="mt-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                  <h5 className="text-sm font-medium text-purple-300 mb-2">
                    AI 심층 분석
                  </h5>
                  <div className="space-y-1 text-sm text-gray-300">
                    {selectedPin.aiAnalysis.risk_assessment && (
                      <p>
                        • 위험 평가:{" "}
                        {selectedPin.aiAnalysis.risk_assessment}
                      </p>
                    )}
                    {selectedPin.aiAnalysis.expected_benefit && (
                      <p>
                        • 기대 효과:{" "}
                        {selectedPin.aiAnalysis.expected_benefit}
                      </p>
                    )}
                    {selectedPin.aiAnalysis.match_reasons &&
                      selectedPin.aiAnalysis.match_reasons.length > 0 && (
                        <p>
                          • 주요 매칭 요인:{" "}
                          {selectedPin.aiAnalysis.match_reasons.join(", ")}
                        </p>
                      )}
                    {selectedPin.aiAnalysis.suitability_score && (
                      <p>
                        • AI 적합도 점수:{" "}
                        {(selectedPin.aiAnalysis.suitability_score * 100).toFixed(1)}점
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedPin.userSpecific && (
                <div className="mt-4">
                  {selectedPin.userSpecific.recommended_monthly_amount ||
                  selectedPin.userSpecific.achievement_timeline ||
                  selectedPin.userSpecific.risk_compatibility ? (
                    <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-700/50">
                      <h5 className="text-sm font-medium text-purple-300 mb-2">
                        맞춤 정보
                      </h5>
                      <div className="space-y-1 text-sm text-gray-300">
                        {selectedPin.userSpecific
                          .recommended_monthly_amount && (
                          <p>
                            • 추천 월 납입액:{" "}
                            {selectedPin.userSpecific.recommended_monthly_amount.toLocaleString()}
                            원
                          </p>
                        )}
                        {selectedPin.userSpecific.achievement_timeline && (
                          <p>
                            • 목표 달성 예상:{" "}
                            {selectedPin.userSpecific.achievement_timeline}
                          </p>
                        )}
                        {selectedPin.userSpecific.risk_compatibility && (
                          <p>
                            • 위험도 적합성:{" "}
                            {selectedPin.userSpecific.risk_compatibility}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Show a message if userSpecific exists but is empty/null
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                      <h5 className="text-sm font-medium text-purple-300 mb-2">
                        맞춤 정보
                      </h5>
                      <p className="text-sm text-gray-400">
                        이 상품에 대한 추가 맞춤 정보가 없습니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinPickPremiumMap;