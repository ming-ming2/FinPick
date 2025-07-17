// finpick-front/src/pages/main/ChatRecommendation.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
  Star,
  Zap,
  Target,
  Eye,
  Filter,
  BarChart3,
  Compass,
  Bot,
  User,
} from "lucide-react";

// 🔗 API 서비스 import
import {
  SmartRecommendationService,
  ApiUtils,
} from "../../services/backendApi";

// 🌟 고정된 분석 패턴 정의 (5개의 상품)
// 각 포인트는 분석 결과의 상대적인 위치 (0-100%)와 역할 (예: 중심, 외곽)을 정의할 수 있습니다.
const SAVINGS_DEPOSIT_CONSTELLATION_SHAPE = {
  name: "저축 최적화 패턴",
  points: [
    { x: 50, y: 30, type: "center", id: "s1" }, // 가장 중요한 상품 (가장 적합한 상품)
    { x: 30, y: 50, type: "outskirt", id: "s2" },
    { x: 70, y: 50, type: "outskirt", id: "s3" },
    { x: 40, y: 70, type: "outskirt", id: "s4" },
    { x: 60, y: 70, type: "outskirt", id: "s5" },
  ],
  connections: [
    ["s1", "s2"],
    ["s1", "s3"], // 중심에서 양쪽으로
    ["s2", "s4"],
    ["s3", "s5"], // 양쪽에서 아래로
    ["s4", "s5"], // 바닥 연결 (오각형)
    // ["s1", "s4"], ["s1", "s5"] // 더 많은 연결 원하면 추가
  ],
};

const LOAN_CONSTELLATION_SHAPE = {
  name: "대출 최적화 패턴",
  points: [
    { x: 50, y: 35, type: "center", id: "l1" }, // 가장 중요한 상품 (가장 적합한 상품)
    { x: 30, y: 65, type: "outskirt", id: "l2" },
    { x: 70, y: 65, type: "outskirt", id: "l3" },
    { x: 40, y: 45, type: "helper", id: "l4" }, // 보조 상품
    { x: 60, y: 45, type: "helper", id: "l5" }, // 보조 상품
  ],
  connections: [
    ["l1", "l2"],
    ["l1", "l3"], // 삼각형 기본
    ["l2", "l3"], // 삼각형 바닥
    ["l1", "l4"],
    ["l1", "l5"], // 중심에서 보조 별로
    ["l4", "l5"], // 보조 별끼리 연결
    // ["l2", "l4"], ["l3", "l5"] // 더 많은 연결 원하면 추가
  ],
};

const FinPickConstellationMap = () => {
  // --- State and Refs ---
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "안녕하세요! 원하는 금융상품을 말씀해주세요. AI가 실시간으로 분석하여 최적의 상품들을 찾아드릴게요! ✨",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pins, setPins] = useState([]);
  const [constellationLines, setConstellationLines] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [filterMode, setFilterMode] = useState("all"); // all, high-rating, best-rate
  const [animationPhase, setAnimationPhase] = useState("idle"); // idle, forming, complete
  const [originalProductsData, setOriginalProductsData] = useState([]); // 🔥 원본 상품 데이터 저장

  // 🔗 API 연동 관련 상태
  const [serverConnected, setServerConnected] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  // 🔥 추가 상태 변수
  const [userProfile, setUserProfile] = useState(null);
  const [userInsights, setUserInsights] = useState({});
  const [personalizationLevel, setPersonalizationLevel] = useState("none");
  const [recommendationReasoning, setRecommendationReasoning] = useState("");
  const [dataSourceInfo, setDataSourceInfo] = useState(null);

  const [liveData, setLiveData] = useState({
    totalProducts: 379,
    institutions: 15,
    realTimeUpdates: "24/7",
    activeMining: true,
    constellationsFormed: 0,
    smartConnections: 0,
  });

  const mapRef = useRef(null);
  const messagesEndRef = useRef(null);
  const svgRef = useRef(null);

  // --- Sub-Components ---
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

  // 🔥 PersonalizationBadge 컴포넌트
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

  // 핀 클릭 핸들러 (피드백 추가)
  const handlePinClick = async (pin) => {
    setSelectedPin(selectedPin?.id === pin.id ? null : pin);

    // 피드백 전송 (상품 선택 = 긍정적 피드백)
    if (selectedPin?.id !== pin.id) {
      await handleProductFeedback(pin.id, 4); // 5점 만점에 4점
    }
  };

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

  // 🔥 추가: 사용자 프로필 로딩
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
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
  }, []);

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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // --- Constants ---
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
    };
    return typeMap[backendType] || "savings"; // 기본값
  };

  // 🔧 상품 유형을 기반으로 도메인 추론
  const inferDomain = (productType) => {
    if (!productType || typeof productType !== "string") {
      return "예금/적금"; // 기본값
    }

    const type = productType.toLowerCase();

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
    if (loanKeywords.some((keyword) => type.includes(keyword))) {
      return "대출상품";
    }

    // 예금/적금 관련은 기본값
    return "예금/적금";
  };

  // 🔧 백엔드 데이터를 프론트엔드 형식으로 변환
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
          rate: parseFloat(product.interest_rate || 0),
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
          rate: 0.0,
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

    const sampleProducts = {
      "예금/적금": [
        {
          id: "s_1",
          name: "KB Star 정기적금",
          type: "savings",
          rate: 3.5,
          minAmount: 10,
          suitability: 95,
          reason: "높은 금리와 우수한 조건",
          monthlyAmount: 50,
          bank: "KB국민은행",
          domain: "예금/적금",
        },
        {
          id: "s_2",
          name: "신한 Dream 적금",
          type: "savings",
          rate: 3.3,
          minAmount: 5,
          suitability: 88,
          reason: "낮은 최소금액",
          monthlyAmount: 30,
          bank: "신한은행",
          domain: "예금/적금",
        },
        {
          id: "d_1",
          name: "우리 WON정기예금",
          type: "deposit",
          rate: 3.8,
          minAmount: 100,
          suitability: 92,
          reason: "높은 예금금리",
          monthlyAmount: 0,
          bank: "우리은행",
          domain: "예금/적금",
        },
        {
          id: "s_3",
          name: "하나 Premier 적금",
          type: "savings",
          rate: 3.4,
          minAmount: 20,
          suitability: 85,
          reason: "프리미엄 혜택",
          monthlyAmount: 40,
          bank: "하나은행",
          domain: "예금/적금",
        },
        {
          id: "d_2",
          name: "NH농협 스마트 정기예금",
          type: "deposit",
          rate: 3.6,
          minAmount: 50,
          suitability: 80,
          reason: "스마트 뱅킹 전용",
          monthlyAmount: 0,
          bank: "NH농협은행",
          domain: "예금/적금",
        },
        {
          id: "s_4",
          name: "카카오뱅크 자유적금",
          type: "savings",
          rate: 3.2,
          minAmount: 1,
          suitability: 75,
          reason: "자유로운 납입",
          monthlyAmount: 10,
          bank: "카카오뱅크",
          domain: "예금/적금",
        },
      ],
      대출상품: [
        {
          id: "l_1",
          name: "KB Star 신용대출",
          type: "loan",
          rate: 4.2,
          minAmount: 100,
          suitability: 93,
          reason: "낮은 금리",
          monthlyAmount: 0,
          bank: "KB국민은행",
          domain: "대출상품",
        },
        {
          id: "l_2",
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
        {
          id: "l_3",
          name: "신한 마이너스 대출",
          type: "loan",
          rate: 4.5,
          minAmount: 50,
          suitability: 85,
          reason: "편리한 사용",
          monthlyAmount: 0,
          bank: "신한은행",
          domain: "대출상품",
        },
        {
          id: "l_4",
          name: "우리 비상금 대출",
          type: "loan",
          rate: 5.0,
          minAmount: 10,
          suitability: 78,
          reason: "간편한 신청",
          monthlyAmount: 0,
          bank: "우리은행",
          domain: "대출상품",
        },
        {
          id: "l_5",
          name: "농협 올원 마이너스론",
          type: "loan",
          rate: 4.7,
          minAmount: 30,
          suitability: 82,
          reason: "모바일 전용",
          monthlyAmount: 0,
          bank: "NH농협은행",
          domain: "대출상품",
        },
      ],
    };

    // 현재 쿼리에 해당하는 도메인의 상품을 가져옵니다.
    // 도메인에 상품이 5개 미만일 경우, 적합도 높은 순으로 5개를 채워 넣거나, 있는 만큼만 사용합니다.
    let products = sampleProducts[selectedDomainName] || [];
    // 적합도 순으로 정렬하여 상위 5개를 선택 (또는 있는 만큼)
    products.sort((a, b) => b.suitability - a.suitability);
    products = products.slice(0, 5); // 최대 5개 상품만 사용

    setTimeout(() => {
      setIsLoading(false);
      setOriginalProductsData(products); // 🔥 폴백 데이터도 저장

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
        const { pins: newPins, lines } = generateFixedConstellation(
          products,
          selectedDomainName
        ); // 고정된 별자리 생성 함수 호출
        animateConstellationFormation(newPins, lines);
      }, 1000);
    }, 2500);
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

  const pinStyles = {
    deposit: {
      color: "#3B82F6",
      icon: Shield,
      name: "예금",
      bgGlow: "shadow-blue-500/20",
      starClass: "main-star",
    },
    savings: {
      color: "#10B981",
      icon: PiggyBank,
      name: "적금",
      bgGlow: "shadow-emerald-500/20",
      starClass: "bright-star",
    },
    loan: {
      color: "#F59E0B",
      icon: Home,
      name: "대출",
      bgGlow: "shadow-amber-500/20",
      starClass: "giant-star",
    },
  };

  // 🌟 고정된 분석 패턴 생성 알고리즘
  const generateFixedConstellation = (products, domainName) => {
    if (!Array.isArray(products) || products.length === 0)
      return { pins: [], lines: [] };

    console.log(`🎨 최적화 패턴 (${domainName}) 배치 시작`);

    // 해당 도메인에 맞는 분석 패턴 선택
    const constellationShape =
      domainName === "대출상품"
        ? LOAN_CONSTELLATION_SHAPE
        : SAVINGS_DEPOSIT_CONSTELLATION_SHAPE;

    const constellationPins = [];
    const constellationLines = [];

    // 상품을 적합도 순으로 정렬 (가장 높은 적합도를 가진 상품이 첫 번째로 오도록)
    const sortedProducts = [...products].sort(
      (a, b) => b.suitability - a.suitability
    );

    // 각 분석 포인트에 상품 매핑
    constellationShape.points.forEach((point, index) => {
      const product = sortedProducts[index]; // 적합도 순으로 상품 할당

      if (product) {
        const pin = {
          ...product,
          x: point.x,
          y: point.y,
          starMagnitude: calculateStarMagnitude(product),
          isMainStar: index === 0, // 가장 적합한 상품을 메인으로
          isTopRecommended: index === 0, // 첫 번째 상품은 최고 추천
          fixedPointId: point.id, // 어떤 고정된 포인트에 매핑되었는지
        };
        constellationPins.push(pin);
      }
    });

    // 연결선 생성
    constellationShape.connections.forEach((conn) => {
      const fromPin = constellationPins.find((p) => p.fixedPointId === conn[0]);
      const toPin = constellationPins.find((p) => p.fixedPointId === conn[1]);

      if (fromPin && toPin) {
        constellationLines.push({
          from: fromPin,
          to: toPin,
          strength: calculateConnectionStrength(fromPin, toPin),
          type: getConnectionType(fromPin, toPin),
        });
      }
    });

    console.log(
      `✨ 배치 완료: ${constellationPins.length}개 핀, ${constellationLines.length}개 연결선`
    );
    return { pins: constellationPins, lines: constellationLines };
  };

  // 🌟 상품 평가 점수 계산 (중요도)
  const calculateStarMagnitude = (product) => {
    const rateScore = (product.rate / 5) * 40; // 금리 점수
    const suitabilityScore = (product.suitability / 100) * 60; // 적합도 점수
    return Math.min(100, rateScore + suitabilityScore);
  };

  // 🔗 별자리 연결 여부 판단 (고정된 패턴을 따름) - 이 함수는 이제 사용되지 않음
  // 🔗 연결선 강도 계산
  const calculateConnectionStrength = (star1, star2) => {
    // 적합도 차이가 적을수록 강하게 연결
    const suitabilityDifference = Math.abs(
      star1.suitability - star2.suitability
    );
    return 1 - suitabilityDifference / 100; // 0 (가장 약함) ~ 1 (가장 강함)
  };

  // 🔗 연결선 타입 결정
  const getConnectionType = (star1, star2) => {
    const strength = calculateConnectionStrength(star1, star2);
    if (strength > 0.8) return "strong";
    if (strength > 0.5) return "medium";
    return "weak";
  };

  // 🎬 분석 결과 시각화 애니메이션
  const animateConstellationFormation = (pins, lines) => {
    setAnimationPhase("forming");
    setPins([]);
    setConstellationLines([]);

    // 1단계: 상품들이 하나씩 나타남
    pins.forEach((pin, index) => {
      setTimeout(() => {
        setPins((prev) => [...prev, { ...pin, justAppeared: true }]);

        // 강조 효과
        setTimeout(() => {
          setPins((prev) =>
            prev.map((p) =>
              p.id === pin.id ? { ...p, justAppeared: false } : p
            )
          );
        }, 800);
      }, index * 200);
    });

    // 2단계: 연결선이 그어짐
    setTimeout(() => {
      lines.forEach((line, index) => {
        setTimeout(() => {
          setConstellationLines((prev) => [
            ...prev,
            { ...line, isDrawing: true },
          ]);

          setTimeout(() => {
            setConstellationLines((prev) =>
              prev.map((l) => (l === line ? { ...l, isDrawing: false } : l))
            );
          }, 1000);
        }, index * 300);
      });
    }, pins.length * 200 + 500);

    // 3단계: 완성
    setTimeout(() => {
      setAnimationPhase("complete");
      setLiveData((prev) => ({
        ...prev,
        constellationsFormed: prev.constellationsFormed + 1,
        smartConnections: lines.length,
      }));
    }, pins.length * 200 + lines.length * 300 + 2000);
  };

  // 📡 메인 API 연동 메시지 처리 함수
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
    setConstellationLines([]);
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

        console.log("🔍 전체 백엔드 응답:", response);
        console.log("🔍 response.data:", response.data);

        // 🔥 새로운 로직: AI가 금융 관련 없다고 판단한 경우 (success와 관계없이 먼저 체크)
        if (response.is_financial_related === false) {
          console.log("❌ AI가 금융 관련 없는 요청으로 판단");

          setIsLoading(false);

          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content:
              response.message ||
              "죄송해요, 저는 대출, 예금, 적금 상품 추천을 도와드리는 AI입니다. 금융 상품에 대해 궁금한 점이 있으시면 언제든 말씀해 주세요! 😊",
            timestamp: new Date(),
            isNonFinancialResponse: true, // 🔥 특별 플래그
          };

          setMessages((prev) => [...prev, aiMessage]);
          return; // 🔥 여기서 함수 종료
        }

        if (response.success) {
          // 🔥 기존 로직: 금융 관련 요청인 경우 정상 처리
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
          setOriginalProductsData(convertedProducts); // 🔥 원본 상품 데이터 저장
          console.log("🔄 변환된 상품 데이터:", convertedProducts);

          setIsLoading(false);

          // 쿼리를 통해 도메인 추론 (API 응답에서 정확한 도메인 정보가 없을 경우)
          const inferredDomain = inferDomain(currentQuery);

          const aiMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: `✨ AI 분석 완료! ${
              convertedProducts.length
            }개의 상품으로 스마트 포트폴리오를 구성했습니다.

🌟 생성된 패턴: ${
              inferredDomain === "대출상품"
                ? LOAN_CONSTELLATION_SHAPE.name
                : SAVINGS_DEPOSIT_CONSTELLATION_SHAPE.name
            } (${convertedProducts.length}개 상품)

🔍 분석 기준: 적합도 순으로 정렬되어 가장 적합한 상품들이 주요 위치에 배치됩니다.`,
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
            // 고정된 분석 패턴 생성 함수 호출 시 추론된 도메인 전달
            const { pins: newPins, lines } = generateFixedConstellation(
              convertedProducts,
              inferredDomain
            );
            animateConstellationFormation(newPins, lines);
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

  // 🌟 별자리 배경
  const ConstellationBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 배경 별들 */}
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

      {/* 성운 효과 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-48 h-32 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-40 bg-gradient-radial from-emerald-500/10 to-transparent rounded-full blur-3xl" />
      </div>
    </div>
  );

  // 🌟 별자리 연결선 컴포넌트
  const ConstellationLines = () => (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      {constellationLines.map((line, index) => {
        const x1 = `${line.from.x}%`;
        const y1 = `${line.from.y}%`;
        const x2 = `${line.to.x}%`;
        const y2 = `${line.to.y}%`;

        return (
          <g key={index}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`rgba(6, 182, 212, ${0.3 + line.strength * 0.4})`}
              strokeWidth={1 + line.strength * 2}
              className={`transition-all duration-1000 ${
                line.isDrawing ? "animate-pulse" : ""
              }`}
              strokeDasharray={line.isDrawing ? "5,5" : "none"}
            />
            {/* 연결점 강도 표시 */}
            <circle
              cx={`${(line.from.x + line.to.x) / 2}%`}
              cy={`${(line.from.y + line.to.y) / 2}%`}
              r={line.strength * 3}
              fill="rgba(6, 182, 212, 0.6)"
              className="animate-pulse"
            />
          </g>
        );
      })}
    </svg>
  );

  // 🌟 핀 컴포넌트 (최고 적합도 표시 추가)
  const Pin = ({ pin, isSelected, onClick }) => {
    const style = pinStyles[pin.type];
    const IconComponent = style.icon;
    const magnitude = pin.starMagnitude || 70;
    const scale = 0.8 + (magnitude / 100) * 0.4; // 별의 밝기에 따른 크기

    return (
      <div
        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all duration-700 ${
          pin.justAppeared ? "animate-bounce scale-150" : ""
        } ${isSelected ? "scale-125 z-30" : "hover:scale-110 z-20"}`}
        style={{
          left: `${pin.x}%`,
          top: `${pin.y}%`,
          transform: `translate(-50%, -100%) scale(${scale})`,
        }}
        onClick={() => onClick(pin)}
      >
        {/* 최고 적합도 상품 특별 후광 */}
        {pin.isTopRecommended && (
          <div
            className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-yellow-400 to-orange-400 opacity-60 animate-pulse"
            style={{ transform: "scale(2.5)" }}
          />
        )}

        {/* 별 후광 효과 */}
        <div
          className={`absolute inset-0 rounded-full blur-lg ${style.bgGlow}`}
          style={{
            backgroundColor: style.color,
            opacity: (magnitude / 100) * 0.6,
            transform: "scale(1.8)",
            animation: pin.isMainStar ? "pulse 2s infinite" : "",
          }}
        />

        {/* 메인 별 */}
        <div
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-2 backdrop-blur-sm ${
            pin.isTopRecommended
              ? "border-yellow-400/80 ring-4 ring-yellow-400/30"
              : pin.isMainStar
              ? "border-white/50 ring-2 ring-cyan-400/30"
              : "border-white/30"
          }`}
          style={{
            backgroundColor: style.color,
            boxShadow: `0 0 ${20 + magnitude * 0.3}px ${
              style.color
            }40, 0 10px 20px rgba(0,0,0,0.3)`,
          }}
        >
          <IconComponent className="w-7 h-7 text-white drop-shadow-lg" />

          {/* 최고 적합도 표시 */}
          {pin.isTopRecommended && (
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
              <Star className="w-3 h-3 text-white" fill="currentColor" />
            </div>
          )}

          {/* 핵심 상품 표시 */}
          {pin.isMainStar && !pin.isTopRecommended && (
            <Target
              className="absolute -top-2 -right-2 w-4 h-4 text-cyan-400 animate-pulse"
              fill="currentColor"
            />
          )}
        </div>

        {/* 적합도 배지 */}
        <div
          className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg backdrop-blur-sm border ${
            pin.isTopRecommended
              ? "border-yellow-400/50 bg-gradient-to-r from-yellow-500 to-orange-500"
              : "border-white/30"
          }`}
          style={{
            background: pin.isTopRecommended
              ? undefined
              : `linear-gradient(135deg, ${style.color}, ${style.color}cc)`,
            boxShadow: `0 4px 15px ${
              pin.isTopRecommended ? "#f59e0b" : style.color
            }40`,
          }}
        >
          {pin.suitability}%
        </div>

        {/* 펄스 애니메이션 (선택 시) */}
        {isSelected && (
          <div
            className="absolute inset-0 rounded-full border-2 animate-ping"
            style={{
              borderColor: pin.isTopRecommended ? "#f59e0b" : style.color,
              transform: "scale(1.8)",
            }}
          />
        )}
      </div>
    );
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Main Return Statement ---
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto bg-gray-950 h-screen flex flex-col overflow-hidden relative">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 backdrop-blur-xl bg-gray-950/80 relative z-30">
          <Link to="/" className="flex items-center space-x-4 cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src="/logo.png"
                  alt="FinPick"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -inset-1 rounded-xl blur opacity-30"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                FinPick AI
              </h1>
              <p className="text-gray-400 text-sm">
                Premium Financial Intelligence
              </p>
            </div>
          </Link>

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
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">
                {liveData.constellationsFormed}
              </span>
              <span className="text-gray-400">그룹</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">
                {liveData.smartConnections}
              </span>
              <span className="text-gray-400">연결</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">LIVE</span>
          </div>
        </div>

        {/* 메인 별자리 지도 영역 */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 overflow-hidden">
            {/* 배경 효과 */}
            <ConstellationBackground />

            {/* 별자리 연결선 */}
            <ConstellationLines />

            {/* 🔥 추가: 사용자 정보 연동 상태 표시 */}
            {userProfile && dataSourceInfo && (
              <div className="absolute top-6 left-6 z-30">
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

            {/* 🚨 에러 메시지 표시 */}
            {apiError && (
              <ErrorMessage error={apiError} onRetry={retryConnection} />
            )}

            {/* 중앙 안내 메시지 */}
            {pins.length === 0 && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center backdrop-blur-xl bg-black/20 rounded-3xl p-8 border border-white/10">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-6 mx-auto relative">
                    <Star className="w-10 h-10 text-emerald-400" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full blur-xl opacity-30"></div>
                  </div>
                  <h3 className="text-white text-2xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    AI 분석 엔진 대기 중
                  </h3>
                  <p className="text-gray-300 text-center leading-relaxed mb-4">
                    원하는 금융상품을 말씀해주세요
                    <br />
                    AI가 스마트 분석을 시작합니다
                  </p>
                  <p className="text-gray-500 text-sm">
                    🔍 적합도 기반 그룹핑
                    <br />
                    🔗 자동 연결선 생성
                    <br />
                    🎯 맞춤형 추천
                  </p>
                </div>
              </div>
            )}

            {/* 고급 로딩 상태 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-xl bg-black/40">
                <div className="text-center backdrop-blur-xl bg-gray-900/80 rounded-3xl p-8 border border-gray-700/50">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    {/* 다중 회전 로더 */}
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

                    {/* 중앙 별 */}
                    <div className="absolute inset-8 flex items-center justify-center">
                      <Star className="w-4 h-4 text-white animate-pulse" />
                    </div>
                  </div>

                  <h3 className="text-white text-xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    AI 분석 중...
                  </h3>

                  <div className="w-56 h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
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

                  {/* 애니메이션 단계 표시 */}
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

            {/* 별들 (핀들) */}
            <div ref={mapRef} className="relative w-full h-full">
              {pins.map((pin) => (
                <Pin
                  key={pin.id}
                  pin={pin}
                  isSelected={selectedPin?.id === pin.id}
                  onClick={(pin) =>
                    setSelectedPin(selectedPin?.id === pin.id ? null : pin)
                  }
                />
              ))}
            </div>

            {/* 분석 완성 알림 */}
            {animationPhase === "complete" && pins.length > 0 && (
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 border border-emerald-400/30 text-white px-6 py-4 rounded-2xl shadow-2xl animate-fade-in">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <div>
                    <div className="font-bold text-lg">분석 완성!</div>
                    <div className="text-sm text-gray-300">
                      {pins.length}개 상품 • {constellationLines.length}개 연결
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            )}

            {/* 상품 분포 범례 */}
            {pins.length > 0 && (
              <div className="absolute bottom-6 left-6 backdrop-blur-xl bg-black/40 border border-gray-700/50 rounded-2xl p-4">
                <h4 className="text-white text-sm font-semibold mb-3 flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-cyan-400" />
                  상품 분포
                </h4>
                <div className="space-y-2">
                  {Object.entries(pinStyles).map(([type, style]) => {
                    const count = pins.filter(
                      (pin) => pin.type === type
                    ).length;
                    if (count === 0) return null;

                    const mainStars = pins.filter(
                      (pin) => pin.type === type && pin.isMainStar
                    ).length;
                    const topRecommended = pins.filter(
                      (pin) => pin.type === type && pin.isTopRecommended
                    ).length;

                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: style.color }}
                          ></div>
                          <span className="text-gray-300">{style.name}</span>
                        </div>
                        <div className="text-gray-500">
                          {count}개{" "}
                          {topRecommended > 0 && `(최고 ${topRecommended})`}{" "}
                          {mainStars > 0 && `(핵심 ${mainStars})`}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 연결선 범례 */}
                <div className="mt-3 pt-2 border-t border-gray-700/30">
                  <div className="text-xs text-gray-400 mb-1">연결 기준</div>
                  <div className="text-xs text-cyan-300">적합도 유사성</div>
                </div>
              </div>
            )}
          </div>

          {/* 채팅 오버레이 */}
          {showChat && (
            <div className="absolute inset-0 backdrop-blur-xl bg-black/50 z-40 flex flex-col">
              {/* 채팅 헤더 */}
              <div className="backdrop-blur-xl bg-gray-950/90 border-b border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></div>
                    <h2 className="text-white font-bold text-lg">AI 상담사</h2>
                    <div className="px-2 py-1 bg-emerald-500/20 rounded-lg">
                      <span className="text-emerald-300 text-xs">Beta</span>
                    </div>
                  </div>
                  {/* 닫기 버튼 */}
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
                  >
                    <X className="w-5 h-5" />
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
                      className={`max-w-[75%] p-4 rounded-2xl shadow-md ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-br-md"
                          : message.isNonFinancialResponse
                          ? "bg-amber-500/20 border border-amber-500/30 text-amber-100 rounded-bl-md"
                          : "bg-gray-800/80 text-gray-200 rounded-bl-md border border-gray-700/50"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {message.type === "ai" && (
                          <div
                            className={`mt-1 ${
                              message.isNonFinancialResponse
                                ? "text-amber-300"
                                : "text-emerald-300"
                            }`}
                          >
                            <Bot className="w-5 h-5" />
                          </div>
                        )}
                        {message.type === "user" && (
                          <User className="w-5 h-5 mt-1 text-emerald-100" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm break-words leading-relaxed whitespace-pre-line">
                            {message.content}
                          </p>
                          <span className="text-xs text-white/60 mt-2 block text-right">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 채팅 입력 */}
              <div className="p-4 border-t border-gray-700/50 backdrop-blur-xl bg-gray-950/90">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <textarea
                      className="w-full bg-gray-800/80 text-white rounded-2xl p-4 resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-gray-500 text-sm border border-gray-700/50 backdrop-blur-sm min-h-[48px]"
                      rows="2"
                      placeholder={
                        isLoading
                          ? "AI 분석 중..."
                          : "어떤 금융상품을 찾고 계신가요? (예: 높은 금리 적금, 신용대출)"
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* 빠른 입력 버튼 */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "높은 금리 적금 찾아줘",
                    "안전한 예금상품",
                    "신용대출 추천",
                    "월 50만원 적금",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInputValue(suggestion)}
                      className="px-3 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 text-xs rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                {/* 🔥 안내 메시지 추가 */}
                <div className="mt-3 text-xs text-gray-400 text-center">
                  💡 대출, 예금, 적금 상품 추천을 도와드립니다. 구체적인 조건을
                  말씀해 주세요!
                </div>
              </div>
            </div>
          )}

          {/* 💬 채팅 플로팅 버튼 */}
          {!showChat && (
            <button
              onClick={() => setShowChat(true)}
              className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 z-50 animate-pulse"
            >
              <MessageCircle className="w-8 h-8 text-white" />
              {/* 새 메시지 알림 점 (필요시) */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">!</span>
              </div>
            </button>
          )}

          {/* 선택된 별 상세 정보 (모바일 최적화) */}
          {selectedPin && (
            <div className="fixed inset-0 backdrop-blur-xl bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
              {/* 모바일: 하단에서 올라오는 시트, 데스크톱: 중앙 모달 */}
              <div className="w-full max-w-md backdrop-blur-xl bg-gray-900/95 border border-gray-700/50 rounded-t-3xl md:rounded-3xl shadow-2xl animate-slide-up md:animate-fade-in-up max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col">
                {/* 헤더 - 고정 */}
                <div className="flex-shrink-0 p-4 border-b border-gray-700/30">
                  {/* 모바일 드래그 핸들 */}
                  <div className="md:hidden w-12 h-1 bg-gray-600 rounded-full mx-auto mb-4"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg"
                          style={{
                            backgroundColor: pinStyles[selectedPin.type]?.color,
                          }}
                        >
                          {React.createElement(
                            pinStyles[selectedPin.type]?.icon,
                            {
                              className: "w-5 h-5 md:w-6 md:h-6 text-white",
                            }
                          )}
                        </div>
                        {selectedPin.isMainStar && (
                          <Star
                            className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 text-yellow-400"
                            fill="currentColor"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 truncate">
                          {selectedPin.name}
                        </h3>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <p className="text-sm text-gray-400 truncate">
                            {selectedPin.bank}
                          </p>
                          {selectedPin.isMainStar && (
                            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                              핵심
                            </span>
                          )}
                          {selectedPin.isTopRecommended && (
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                              최고 추천
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPin(null)}
                      className="text-gray-400 hover:text-white transition-colors p-2 -m-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* 스크롤 가능한 콘텐츠 영역 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* 핵심 정보 그리드 - 2x2 컴팩트 */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/30">
                      <p className="text-gray-400 mb-1 text-xs">상품 유형</p>
                      <p className="text-white font-medium text-sm">
                        {pinStyles[selectedPin.type]?.name}
                      </p>
                    </div>
                    <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/30">
                      <p className="text-gray-400 mb-1 text-xs">추천도</p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Target
                            key={i}
                            className={`w-2.5 h-2.5 ${
                              i <
                              Math.floor((selectedPin.starMagnitude || 70) / 20)
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
                        {selectedPin.rate.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/30">
                      <p className="text-gray-400 mb-1 text-xs">적합도</p>
                      <p className="text-cyan-400 font-medium text-sm">
                        {selectedPin.suitability}%
                      </p>
                    </div>
                  </div>

                  {/* 추천 사유 - 컴팩트 */}
                  <div className="bg-gray-800/30 p-3 rounded-xl border border-gray-700/30">
                    <h4 className="text-white font-semibold mb-2 flex items-center text-sm">
                      <Target className="w-3 h-3 mr-2 text-emerald-400" />
                      AI 추천 사유
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedPin.reason}
                    </p>
                  </div>

                  {/* 🔥 추가: 추천 이유 표시 */}
                  {recommendationReasoning && (
                    <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
                        <span className="mr-2">🧠</span>
                        AI 추천 이유
                      </h4>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {recommendationReasoning}
                      </p>
                    </div>
                  )}

                  {/* 🔥 추가: AI 분석 및 사용자 특정 정보 - 접이식 */}
                  {selectedPin?.aiAnalysis && (
                    <div className="space-y-3">
                      {selectedPin.aiAnalysis.expected_benefit && (
                        <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
                          <h5 className="text-sm font-medium text-blue-300 mb-1 flex items-center">
                            <span className="mr-2">💰</span>
                            예상 혜택
                          </h5>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {selectedPin.aiAnalysis.expected_benefit}
                          </p>
                        </div>
                      )}

                      {selectedPin.aiAnalysis.match_reasons &&
                        selectedPin.aiAnalysis.match_reasons.length > 0 && (
                          <div className="p-3 bg-green-900/30 rounded-lg border border-green-700/50">
                            <h5 className="text-sm font-medium text-green-300 mb-2 flex items-center">
                              <span className="mr-2">✅</span>
                              추천 이유
                            </h5>
                            <ul className="text-sm text-gray-300 space-y-1">
                              {selectedPin.aiAnalysis.match_reasons
                                .slice(0, 3)
                                .map((reason, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-green-400 mr-2 flex-shrink-0">
                                      •
                                    </span>
                                    <span className="leading-relaxed">
                                      {reason}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                      {selectedPin.userSpecific && (
                        <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-700/50">
                          <h5 className="text-sm font-medium text-purple-300 mb-2 flex items-center">
                            <span className="mr-2">👤</span>
                            맞춤 정보
                          </h5>
                          <div className="space-y-2 text-sm text-gray-300">
                            {selectedPin.userSpecific
                              .recommended_monthly_amount && (
                              <div className="flex justify-between items-center">
                                <span>추천 월 납입액:</span>
                                <span className="font-medium text-purple-300">
                                  {selectedPin.userSpecific.recommended_monthly_amount.toLocaleString()}
                                  원
                                </span>
                              </div>
                            )}
                            {selectedPin.userSpecific.achievement_timeline && (
                              <div className="flex justify-between items-center">
                                <span>목표 달성 예상:</span>
                                <span className="font-medium text-purple-300">
                                  {
                                    selectedPin.userSpecific
                                      .achievement_timeline
                                  }
                                </span>
                              </div>
                            )}
                            {selectedPin.userSpecific.risk_compatibility && (
                              <div className="flex justify-between items-center">
                                <span>위험도 적합성:</span>
                                <span className="font-medium text-purple-300">
                                  {selectedPin.userSpecific.risk_compatibility}
                                </span>
                              </div>
                            )}
                            {selectedPin.userSpecific.age_appropriateness && (
                              <div className="flex justify-between items-center">
                                <span>연령 적합성:</span>
                                <span className="font-medium text-purple-300">
                                  {selectedPin.userSpecific.age_appropriateness}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 하단 여백 (모바일에서 스크롤 시 마지막 콘텐츠가 잘리지 않도록) */}
                  <div className="h-4"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinPickConstellationMap;
