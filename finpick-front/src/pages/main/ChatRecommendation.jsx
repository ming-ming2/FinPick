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

  // 🔧 백엔드 데이터를 프론트엔드 형식으로 변환 - 🔥 새로운 AI 응답 구조 대응
  const convertBackendProducts = (products) => {
    if (!Array.isArray(products)) {
      console.error("❌ products가 배열이 아님:", products);
      return [];
    }

    return products.map((product, index) => {
      try {
        console.log(`🔍 상품 ${index + 1} 변환:`, {
          product_id: product.product_id,
          name: product.name,
          bank_name: product.bank_name,
          type: product.type,
          interest_rate: product.interest_rate,
          conditions: product.conditions,
          ai_analysis: product.ai_analysis,
        });

        // 🔥 새로운 구조: 직접 필드 접근
        return {
          id: product.product_id || `product_${Date.now()}_${index}`,
          name: product.name || "상품명 미제공",
          type: mapProductType(product.type || "savings"),
          rate: product.interest_rate || 0,
          minAmount: Math.floor(
            (product.conditions?.minimum_amount || 100000) / 10000
          ),
          suitability: Math.round(
            (product.ai_analysis?.suitability_score || 0.75) * 100
          ),
          reason:
            product.ai_analysis?.expected_benefit ||
            product.ai_analysis?.match_reasons?.join(", ") ||
            "AI 추천 상품",
          monthlyAmount:
            product.user_specific?.recommended_monthly_amount || 300000,
          bank: product.bank_name || "은행명 미제공",
          domain: inferDomain(product.type || "savings"),

          // 🔥 추가: 상세 정보 보존
          aiAnalysis: product.ai_analysis,
          userSpecific: product.user_specific,
          conditions: product.conditions,
          features: product.features || [],
          originalProduct: product, // 전체 원본 데이터 보존
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

  // 🤖 메인 API 연동 메시지 처리 함수 - 🔥 데이터 추출 경로 수정
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
          // 🔥 백엔드 응답 구조 디버깅
          console.log("🔍 전체 백엔드 응답:", response);
          console.log("🔍 response.data:", response.data);

          // 🔥 백엔드 응답 구조 분석: response.data가 직접 배열임
          let products = [];

          // response.data가 배열인지 확인
          if (Array.isArray(response.data)) {
            products = response.data;
            console.log("📦 response.data에서 직접 추출:", products);
          } else if (response.data?.recommended_products) {
            products = response.data.recommended_products;
            console.log("📦 recommended_products에서 추출:", products);
          } else if (response.data?.data?.recommendations) {
            products = response.data.data.recommendations;
            console.log("📦 data.recommendations에서 추출:", products);
          } else if (response.data?.recommendations) {
            products = response.data.recommendations;
            console.log("📦 recommendations에서 추출:", products);
          } else {
            console.log(
              "❌ 상품 데이터를 찾을 수 없음. response.data 타입:",
              typeof response.data
            );
            console.log("❌ response.data 내용:", response.data);
            products = [];
          }

          console.log("📦 최종 추출된 상품 데이터:", products);
          console.log("📊 상품 개수:", products.length);

          // 🔥 안전한 변환 함수 사용
          const convertedProducts = convertBackendProducts(products);
          console.log("🔄 변환된 상품 데이터:", convertedProducts);

          setIsLoading(false);

          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `🎯 AI 분석 결과: ${
              convertedProducts.length
            }개의 맞춤 상품을 발견했어요!
            
🔍 분석 기준:
• 요청 내용: ${currentQuery}
• 추천 정확도: ${
              response.data?.ai_insights?.confidence_score
                ? Math.round(response.data.ai_insights.confidence_score * 100)
                : "85"
            }%
• 맞춤 분석: ${response.data?.user_analysis?.financial_goal || "자금 필요"}

${!serverConnected ? "(데모 모드)" : ""} 📍`,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMessage]);

          // 🔥 개인화 정보 업데이트
          if (response.data?.ai_insights) {
            setPersonalizationLevel("high");
            setUserInsights(response.data.ai_insights);
            setRecommendationReasoning(
              response.data.ai_insights.recommendation_summary || ""
            );
          }

          setTimeout(() => {
            dropPins(convertedProducts);
          }, 1000);
        } else {
          throw new Error(response.message || "추천 요청 실패");
        }
      } else {
        // 폴백 모드
        await handleFallbackRecommendation(currentQuery);
      }
    } catch (error) {
      console.error("❌ 추천 요청 실패:", error);
      setApiError(error.message);
      setIsLoading(false);

      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: `❌ 죄송합니다. 추천 요청 중 오류가 발생했습니다.
        
오류 내용: ${error.message}
        
다시 시도해주시거나, 다른 방식으로 질문해주세요.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
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
        <span className="mr-1">{badge.icon}</span>
        {badge.text}
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
                    radial-gradient(circle at 35% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 65% 40%, rgba(245, 158, 11, 0.3) 0%, transparent 50%)
                  `,
                }}
              ></div>
            </div>

            {/* 도메인 허브들 */}
            {financialHubs.map((hub, index) => (
              <RegionalHub key={index} hub={hub} />
            ))}

            {/* 🔥 추가: 사용자 정보 연동 상태 표시 */}
            {userProfile && dataSourceInfo && (
              <div className="absolute top-6 right-6 z-30">
                <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <PersonalizationBadge level={personalizationLevel} />
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    {dataSourceInfo.firestore && (
                      <span className="flex items-center text-green-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                        Firestore 연동
                      </span>
                    )}
                    {dataSourceInfo.localStorage && (
                      <span className="flex items-center text-blue-400">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                        온보딩 완료
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                    // Only show deposit, savings, and loan if they are present in pins
                    if (type === "investment") return null; // Remove investment from legend
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

              {/* 🔥 추가: 추천 이유 표시 */}
              {recommendationReasoning && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                    🧠 AI 추천 이유
                  </h4>
                  <p className="text-sm text-gray-400">
                    {recommendationReasoning}
                  </p>
                </div>
              )}

              {/* 🔥 추가: AI 분석 및 사용자 특정 정보 */}
              {selectedPin?.aiAnalysis && (
                <div className="mt-4 space-y-3">
                  {selectedPin.aiAnalysis.expected_benefit && (
                    <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
                      <h5 className="text-sm font-medium text-blue-300 mb-1">
                        예상 혜택
                      </h5>
                      <p className="text-sm text-gray-300">
                        {selectedPin.aiAnalysis.expected_benefit}
                      </p>
                    </div>
                  )}

                  {selectedPin.aiAnalysis.match_reasons &&
                    selectedPin.aiAnalysis.match_reasons.length > 0 && (
                      <div className="p-3 bg-green-900/30 rounded-lg border border-green-700/50">
                        <h5 className="text-sm font-medium text-green-300 mb-2">
                          추천 이유
                        </h5>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {selectedPin.aiAnalysis.match_reasons.map(
                            (reason, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-green-400 mr-2">•</span>
                                {reason}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {selectedPin.userSpecific && (
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
