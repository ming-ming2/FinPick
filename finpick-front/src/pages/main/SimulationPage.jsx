// finpick-front/src/pages/Simulation.jsx - 투자성향 선택, 시뮬레이션 및 포트폴리오 시각화 통합

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// 🏦 실제 금융상품 데이터
const realFinancialProducts = {
  safe: [
    {
      id: "kb_star_deposit",
      name: "KB스타정기예금",
      bank: "KB국민은행",
      type: "deposit",
      rate: 4.2,
      rateChange: 0.1,
      features: ["원금보장 100%", "중도해지 가능", "자동연장 옵션"],
      emoji: "💎",
      chartColor: "#10b981",
      description: "변하지 않는 신뢰의 선택",
    },
    {
      id: "shinhan_savings",
      name: "신한 쏠편한적금",
      bank: "신한은행",
      type: "savings",
      rate: 4.5,
      rateChange: 0,
      features: ["월 10~50만원", "우대금리 최대 0.5%", "비대면 가입"],
      emoji: "🌱",
      chartColor: "#059669",
      description: "매달 차곡차곡 쌓는 기쁨",
    },
    {
      id: "hana_parking",
      name: "하나원큐 파킹통장",
      bank: "하나은행",
      type: "cma",
      rate: 3.8,
      rateChange: -0.05,
      features: ["자유입출금", "잔액별 차등금리", "수시로 이용"],
      emoji: "🏦",
      chartColor: "#0ea5e9",
      description: "언제든 꺼낼 수 있는 든든함",
    },
  ],
  balanced: [
    {
      id: "mirae_hybrid_fund",
      name: "미래에셋 글로벌 혼합펀드",
      bank: "미래에셋자산운용",
      type: "fund",
      rate: 6.5,
      rateChange: 0.3,
      features: ["주식 60% + 채권 40%", "글로벌 분산투자", "전문가 운용"],
      emoji: "⚖️",
      chartColor: "#8b5cf6",
      description: "안정과 수익 사이의 황금비율",
    },
    {
      id: "samsung_bond_fund",
      name: "삼성 안정 채권형펀드",
      bank: "삼성자산운용",
      type: "fund",
      rate: 5.2,
      rateChange: 0.1,
      features: ["우량 채권 중심", "낮은 변동성", "안정적 수익"],
      emoji: "📈",
      chartColor: "#6366f1",
      description: "느리지만 확실한 발걸음",
    },
  ],
  aggressive: [
    {
      id: "kb_tech_etf",
      name: "KB STAR 테크놀로지ETF",
      bank: "KB자산운용",
      type: "etf",
      rate: 12.8,
      rateChange: 1.2,
      features: ["IT 기술주 집중", "높은 성장성", "글로벌 테크 트렌드"],
      emoji: "🚀",
      chartColor: "#ef4444",
      description: "미래를 향한 과감한 도전",
    },
    {
      id: "mirae_nasdaq_etf",
      name: "미래에셋 나스닥100 ETF",
      bank: "미래에셋자산운용",
      type: "etf",
      rate: 10.5,
      rateChange: 0.8,
      features: ["나스닥 100 추종", "미국 대형주", "환헤지 옵션"],
      emoji: "🌟",
      chartColor: "#f97316",
      description: "세계 최고 기업들과 함께",
    },
  ],
};

// 🎯 목표별 추천 투자성향 및 설명
const getRecommendedStyleByGoal = (goalName, targetAmount, targetYears) => {
  const goalLower = goalName.toLowerCase();

  // 목표 키워드 기반 분석
  if (
    goalLower.includes("전세") ||
    goalLower.includes("집") ||
    goalLower.includes("주택") ||
    goalLower.includes("보증금") ||
    goalLower.includes("임대")
  ) {
    return "safe";
  }

  if (
    goalLower.includes("은퇴") ||
    goalLower.includes("노후") ||
    goalLower.includes("연금")
  ) {
    return targetYears >= 10 ? "balanced" : "safe";
  }

  if (
    goalLower.includes("육아") ||
    goalLower.includes("교육비") ||
    goalLower.includes("학비") ||
    goalLower.includes("아이") ||
    goalLower.includes("자녀")
  ) {
    return "safe";
  }

  if (
    goalLower.includes("여행") ||
    goalLower.includes("휴가") ||
    goalLower.includes("해외")
  ) {
    return "balanced";
  }

  if (
    goalLower.includes("차") ||
    goalLower.includes("자동차") ||
    goalLower.includes("카") ||
    goalLower.includes("오토바이")
  ) {
    return targetYears <= 3 ? "safe" : "balanced";
  }

  if (
    goalLower.includes("창업") ||
    goalLower.includes("사업") ||
    goalLower.includes("투자")
  ) {
    return "aggressive";
  }

  // 금액과 기간 기반 분석
  if (targetAmount >= 500000000) {
    return targetYears >= 15 ? "aggressive" : "balanced";
  } else if (targetAmount >= 100000000) {
    return targetYears >= 7 ? "balanced" : "safe";
  } else {
    return targetYears >= 5 ? "balanced" : "safe";
  }
};

const investmentStyles = [
  {
    id: "safe",
    emoji: "🛡️",
    title: "차근차근 안전하게",
    subtitle: "잠 편히 자고 싶어",
    description: "원금보장 100%",
    riskLevel: 1,
    expectedReturn: { min: 3.5, max: 4.5 },
    products: ["정기예금", "정기적금", "CMA"],
    color: "from-emerald-500 to-green-500",
    borderColor: "border-emerald-400/50",
    bgColor: "from-emerald-500/10 to-green-500/10",
  },
  {
    id: "balanced",
    emoji: "⚖️",
    title: "적당히 도전하며",
    subtitle: "적당한 스릴 원해",
    description: "중간 위험 수용",
    riskLevel: 3,
    expectedReturn: { min: 5.0, max: 8.0 },
    products: ["혼합펀드", "ETF", "채권형펀드"],
    color: "from-blue-500 to-purple-500",
    borderColor: "border-blue-400/50",
    bgColor: "from-blue-500/10 to-purple-500/10",
  },
  {
    id: "aggressive",
    emoji: "🚀",
    title: "과감하게 목표 향해",
    subtitle: "큰 꿈을 위해 도전",
    description: "고수익 추구",
    riskLevel: 5,
    expectedReturn: { min: 8.0, max: 15.0 },
    products: ["주식형펀드", "개별주식", "성장주ETF"],
    color: "from-red-500 to-pink-500",
    borderColor: "border-red-400/50",
    bgColor: "from-red-500/10 to-pink-500/10",
  },
];

const getGoalStyleExplanation = (goal, recommendedStyle) => {
  const style = investmentStyles.find((s) => s.id === recommendedStyle);
  if (!style) return "";
  const goalType = goal.name.toLowerCase();
  if (goalType.includes("전세") || goalType.includes("집")) {
    return `${goal.name}은 정확한 시기가 중요해서 ${style.title} 추천해요`;
  } else if (goalType.includes("육아")) {
    return `소중한 ${goal.name}을 위해 ${style.title} 방식이 좋아요`;
  } else if (goalType.includes("은퇴")) {
    return `여유로운 ${goal.name}을 위해 ${style.title} 전략을 권해요`;
  } else if (goalType.includes("여행")) {
    return `즐거운 ${goal.name}을 위해 ${style.title} 해보세요`;
  } else {
    return `${goal.name} 달성을 위해 ${style.title} 방식을 추천해요`;
  }
};

// 🎯 목표 관리 훅
const useGoalManager = () => {
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);
  useEffect(() => {
    try {
      const savedGoals = localStorage.getItem("finpick_goals");
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
        if (parsedGoals.length > 0) {
          const activeGoal =
            parsedGoals.find((g) => g.status === "active") || parsedGoals[0];
          setCurrentGoal(activeGoal);
        }
      }
    } catch (error) {
      console.error("목표 로드 실패:", error);
    }
  }, []);
  const saveGoals = useCallback((newGoals) => {
    try {
      localStorage.setItem("finpick_goals", JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (error) {
      console.error("목표 저장 실패:", error);
    }
  }, []);
  const addGoal = useCallback(
    (goalData) => {
      const newGoal = {
        id: Date.now().toString(),
        ...goalData,
        currentAmount: 0,
        status: "active",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      const newGoals = [newGoal, ...goals];
      saveGoals(newGoals);
      setCurrentGoal(newGoal);
      return newGoal;
    },
    [goals, saveGoals]
  );
  return {
    goals,
    currentGoal,
    setCurrentGoal,
    addGoal,
  };
};

// 🧮 계산 함수들
const calculateCompoundInterest = (monthlyAmount, years, rate) => {
  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;
  let futureValue = 0;
  if (monthlyRate > 0) {
    futureValue =
      monthlyAmount * (((1 + monthlyRate) ** totalMonths - 1) / monthlyRate);
  } else {
    futureValue = monthlyAmount * totalMonths;
  }
  const principal = monthlyAmount * totalMonths;
  const interest = futureValue - principal;
  return {
    finalAmount: Math.round(futureValue),
    totalPrincipal: Math.round(principal),
    totalInterest: Math.round(interest),
  };
};

const generateChartData = (monthlyAmount, years, rate) => {
  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;
  const data = [];
  for (
    let month = 0;
    month <= totalMonths;
    month += Math.max(1, Math.floor(totalMonths / 30))
  ) {
    let amount = 0;
    let principal = 0;
    if (month > 0) {
      if (monthlyRate > 0) {
        amount =
          monthlyAmount * (((1 + monthlyRate) ** month - 1) / monthlyRate);
      } else {
        amount = monthlyAmount * month;
      }
      principal = monthlyAmount * month;
    }
    data.push({
      year: Math.round((month / 12) * 10) / 10,
      amount: Math.round(amount),
      principal: Math.round(principal),
      interest: Math.round(amount - principal),
    });
  }
  return data;
};

// 📊 포트폴리오 비율 계산 함수
const calculatePortfolioAllocation = (selectedProducts, monthlyAmount) => {
  if (selectedProducts.length === 0) return [];
  // 균등 분배 (추후 사용자 설정 가능하도록 확장)
  const equalAmount = monthlyAmount / selectedProducts.length;
  return selectedProducts.map((product) => ({
    ...product,
    allocation: equalAmount,
    percentage: (equalAmount / monthlyAmount) * 100,
  }));
};

// --- 신규 포트폴리오 시각화 컴포넌트 ---

// 📊 포트폴리오 도넛 차트 컴포넌트
const PortfolioDonutChart = ({ portfolioData, size = 200 }) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    emoji,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.1) return null; // 10% 미만은 라벨 생략

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        <tspan x={x} dy="-0.5em">
          {emoji}
        </tspan>
        <tspan x={x} dy="1em">{`${(percent * 100).toFixed(0)}%`}</tspan>
      </text>
    );
  };

  return (
    <div className="flex items-center justify-center">
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={portfolioData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={size * 0.35}
            innerRadius={size * 0.2}
            fill="#8884d8"
            dataKey="percentage"
            animationBegin={0}
            animationDuration={1000}
          >
            {portfolioData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.chartColor} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-lg p-3 shadow-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{data.emoji}</span>
                      <span className="font-bold text-white">{data.name}</span>
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>비율: {data.percentage.toFixed(1)}%</div>
                      <div>월 할당: {data.allocation.toLocaleString()}원</div>
                      <div>수익률: {data.rate}%</div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 📊 포트폴리오 성과 비교 바 차트
const PortfolioPerformanceBar = ({ portfolioData }) => {
  return (
    <div className="space-y-3">
      {portfolioData.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-3"
        >
          <div className="flex items-center space-x-2 w-40">
            <span className="text-lg">{item.emoji}</span>
            <span className="text-sm text-gray-300 truncate">{item.name}</span>
          </div>

          <div className="flex-1 relative">
            <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.chartColor }}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="w-20 text-right">
            <div className="text-sm font-bold text-emerald-400">
              {item.rate}%
            </div>
            <div className="text-xs text-gray-400">
              {item.rateChange > 0 ? "↗️" : item.rateChange < 0 ? "↘️" : "→"}
              {item.rateChange !== 0 &&
                ` ${item.rateChange > 0 ? "+" : ""}${item.rateChange.toFixed(
                  2
                )}`}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// 📊 포트폴리오 리스크 분석
const PortfolioRiskAnalysis = ({ portfolioData, selectedStyle }) => {
  if (portfolioData.length === 0) return null;

  const avgRisk = portfolioData.reduce((sum, item) => {
    // 상품 타입별 위험도 매핑
    const riskMapping = {
      deposit: 1,
      savings: 1,
      cma: 1.5,
      fund: selectedStyle?.id === "balanced" ? 3 : 2,
      etf: selectedStyle?.id === "aggressive" ? 5 : 4,
    };
    return sum + (riskMapping[item.type] || 3) * (item.percentage / 100);
  }, 0);

  const avgReturn = portfolioData.reduce(
    (sum, item) => sum + item.rate * (item.percentage / 100),
    0
  );

  const getRiskLabel = (risk) => {
    if (risk <= 1.5)
      return {
        label: "매우 안전",
        color: "text-emerald-400",
        bg: "bg-emerald-500/20",
      };
    if (risk <= 2.5)
      return {
        label: "안전",
        color: "text-green-400",
        bg: "bg-green-500/20",
      };
    if (risk <= 3.5)
      return {
        label: "보통",
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
      };
    if (risk <= 4.5)
      return {
        label: "위험",
        color: "text-orange-400",
        bg: "bg-orange-500/20",
      };
    return { label: "고위험", color: "text-red-400", bg: "bg-red-500/20" };
  };

  const riskInfo = getRiskLabel(avgRisk);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
    >
      <h4 className="font-bold text-lg mb-4 flex items-center space-x-2">
        <span>📊</span>
        <span>포트폴리오 분석</span>
      </h4>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-4 bg-gray-700/50 rounded-xl">
          <div className="text-gray-400 text-sm mb-1">예상 수익률</div>
          <div className="text-2xl font-bold text-emerald-400">
            {avgReturn.toFixed(1)}%
          </div>
        </div>
        <div className="text-center p-4 bg-gray-700/50 rounded-xl">
          <div className="text-gray-400 text-sm mb-1">위험 수준</div>
          <div className={`text-lg font-bold ${riskInfo.color}`}>
            {riskInfo.label}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-gray-400 text-sm mb-2">위험도 분포</div>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={`flex-1 h-3 rounded ${
                i < Math.round(avgRisk) ? riskInfo.bg : "bg-gray-700"
              }`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      <div className={`p-4 rounded-xl ${riskInfo.bg} border border-current/30`}>
        <div className="text-center">
          <div className={`font-bold ${riskInfo.color} mb-1`}>
            💡 포트폴리오 특성
          </div>
          <div className="text-sm text-gray-300">
            {avgReturn >= 6 && avgRisk <= 2
              ? "🏆 높은 수익 + 낮은 위험 (이상적)"
              : avgReturn >= 6 && avgRisk > 2
              ? "⚡ 높은 수익 + 높은 위험 (공격적)"
              : avgReturn < 6 && avgRisk <= 2
              ? "🛡️ 낮은 수익 + 낮은 위험 (보수적)"
              : "⚖️ 균형잡힌 수익-위험 비율"}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 🎨 포트폴리오 시각화 메인 컴포넌트
const PortfolioVisualizationSection = ({
  selectedProducts,
  monthlyAmount,
  selectedStyle,
}) => {
  const [showDetailedView, setShowDetailedView] = useState(false);
  if (selectedProducts.length === 0) return null;

  const portfolioData = calculatePortfolioAllocation(
    selectedProducts,
    monthlyAmount
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold mb-2 flex items-center justify-center space-x-2">
          <span>🎨</span>
          <span>나만의 포트폴리오</span>
        </h3>
        <p className="text-gray-400 text-sm">
          {selectedProducts.length}개 상품으로 구성된 맞춤형 투자 포트폴리오
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50"
        >
          <h4 className="font-bold text-lg mb-4 text-center">📊 자산 배분</h4>
          <PortfolioDonutChart portfolioData={portfolioData} />

          <motion.button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="w-full mt-4 p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl text-gray-300 hover:text-white transition-all text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showDetailedView ? "간단히 보기" : "자세히 보기"}
            <span className="ml-2">{showDetailedView ? "👆" : "👇"}</span>
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50"
        >
          <h4 className="font-bold text-lg mb-4">📈 상품별 비중 & 수익률</h4>
          <PortfolioPerformanceBar portfolioData={portfolioData} />
        </motion.div>
      </div>

      <AnimatePresence>
        {showDetailedView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <PortfolioRiskAnalysis
              portfolioData={portfolioData}
              selectedStyle={selectedStyle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- 기존 UI 컴포넌트 ---

// 🎯 투자성향 선택 컴포넌트
const InvestmentStyleSelector = ({
  selectedStyle,
  onSelectStyle,
  currentGoal,
}) => {
  const recommendedStyleId = currentGoal
    ? getRecommendedStyleByGoal(
        currentGoal.name,
        currentGoal.targetAmount,
        currentGoal.targetYears
      )
    : null;
  const recommendedStyle = investmentStyles.find(
    (s) => s.id === recommendedStyleId
  );
  const explanation =
    currentGoal && recommendedStyle
      ? getGoalStyleExplanation(currentGoal, recommendedStyleId)
      : "";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold mb-2">💭 어떤 마음으로 모을까요?</h2>
        {currentGoal ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm space-y-1"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>{currentGoal.emoji}</span>
              <span>
                {currentGoal.name} 목표에 맞는 투자 성향을 추천해드려요
              </span>
            </div>
            {explanation && (
              <motion.div
                className="text-emerald-400 text-sm italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                💡 {explanation}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <p className="text-gray-400 text-sm">
            투자 성향에 따라 맞춤 상품을 추천해드려요
          </p>
        )}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {investmentStyles.map((style, index) => {
          const isRecommended = recommendedStyleId === style.id;
          return (
            <motion.button
              key={style.id}
              onClick={() => onSelectStyle(style)}
              className={`p-6 rounded-3xl backdrop-blur-xl transition-all duration-500 relative overflow-hidden text-left ${
                selectedStyle?.id === style.id
                  ? `bg-gradient-to-br ${style.bgColor} border-2 ${style.borderColor} shadow-lg`
                  : isRecommended
                  ? `bg-gradient-to-br ${style.bgColor} border-2 border-yellow-400/60 shadow-md`
                  : "bg-gray-900/50 border-2 border-gray-700/50 hover:border-gray-600/50"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{
                scale: 1.03,
                rotateY: 2,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              {isRecommended && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 500 }}
                  className="absolute -top-2 -right-2 z-20"
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {" "}
                    ⭐ 추천{" "}
                  </div>
                </motion.div>
              )}
              {selectedStyle?.id === style.id && (
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${style.bgColor} rounded-3xl`}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              )}
              {isRecommended && selectedStyle?.id !== style.id && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-3xl"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <div className="relative z-10">
                <motion.div
                  className="flex items-center space-x-3 mb-4"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.span
                    className="text-4xl"
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                    animate={
                      isRecommended
                        ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }
                        : {}
                    }
                  >
                    {" "}
                    {style.emoji}{" "}
                  </motion.span>
                  <div>
                    <div className="font-bold text-lg text-white flex items-center space-x-2">
                      <span>{style.title}</span>
                      {isRecommended && (
                        <motion.span
                          className="text-yellow-400 text-sm"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {" "}
                          ⭐{" "}
                        </motion.span>
                      )}
                    </div>
                    <div className="text-gray-400 text-sm italic">
                      {" "}
                      "{style.subtitle}"{" "}
                    </div>
                  </div>
                </motion.div>
                {isRecommended && currentGoal && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 1.0 }}
                    className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl"
                  >
                    <div className="text-yellow-300 text-xs font-medium mb-1">
                      {" "}
                      🎯 {currentGoal.name}에 최적화{" "}
                    </div>
                    <div className="text-yellow-200 text-xs">
                      {" "}
                      {currentGoal.targetYears}년 목표 기간과{" "}
                      {(currentGoal.targetAmount / 100000000).toFixed(1)}억원
                      규모를 고려한 추천{" "}
                    </div>
                  </motion.div>
                )}
                <div className="mb-4">
                  <div className="text-gray-300 text-sm mb-2">
                    {" "}
                    {style.description}{" "}
                  </div>
                  <div className="text-xs text-gray-400">
                    {" "}
                    예상 수익률: {style.expectedReturn.min}% ~{" "}
                    {style.expectedReturn.max}%{" "}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-xs text-gray-400 mb-1">위험도</div>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-3 h-3 rounded-full ${
                          i < style.riskLevel
                            ? "bg-gradient-to-r from-yellow-400 to-red-400"
                            : "bg-gray-600"
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        whileHover={{ scale: 1.2 }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-2">추천 상품</div>
                  <div className="flex flex-wrap gap-1">
                    {style.products.map((product, i) => (
                      <motion.span
                        key={product}
                        className={`px-2 py-1 rounded-lg text-xs ${
                          isRecommended
                            ? "bg-yellow-400/20 text-yellow-200"
                            : "bg-gray-700/50 text-gray-300"
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {" "}
                        {product}{" "}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

// 🎚️ 프리미엄 슬라이더
const PremiumMobileSlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  icon,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progress = ((value - min) / (max - min)) * 100;
  const handleChange = useCallback(
    (newValue) => {
      onChange(newValue);
      if (navigator.vibrate && isDragging) {
        navigator.vibrate(10);
      }
    },
    [onChange, isDragging]
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <motion.div
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
        >
          <motion.span
            className="text-2xl"
            animate={{
              scale: isDragging ? [1, 1.2, 1] : 1,
              rotate: isDragging ? [0, 5, -5, 0] : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {" "}
            {icon}{" "}
          </motion.span>
          <span className="text-gray-300 font-medium">{label}</span>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.span
            className="text-white font-mono text-xl font-bold"
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {" "}
            {value.toLocaleString()}
            {unit}{" "}
          </motion.span>
        </motion.div>
      </div>
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full relative"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
              animate={{
                boxShadow:
                  isHovered || isDragging
                    ? "0 0 20px rgba(16, 185, 129, 0.6)"
                    : "0 0 0px rgba(16, 185, 129, 0)",
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className="relative w-full h-3 bg-transparent appearance-none cursor-pointer premium-slider z-10"
          style={{ margin: 0, padding: 0 }}
        />
        <style jsx>{`
          .premium-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 28px;
            width: 28px;
            border-radius: 50%;
            background: linear-gradient(45deg, #10b981, #06b6d4);
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6), 0 0 0 3px white;
            border: none;
            margin-top: -10px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .premium-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.8), 0 0 0 4px white;
          }
          .premium-slider::-webkit-slider-thumb:active {
            transform: scale(1.15);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 1), 0 0 0 5px white;
          }
        `}</style>
      </div>
    </div>
  );
};

// 📝 새 목표 모달 컴포넌트
const NewGoalModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState(10000000);
  const [targetYears, setTargetYears] = useState(5);
  const handleSave = () => {
    onSave({ goalName, targetAmount, targetYears, emoji: "🎯" });
    onClose();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-3xl p-8 max-w-sm mx-4 w-full border border-gray-700/50"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <h2 className="text-2xl font-bold mb-4">새로운 목표 설정하기</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  목표 이름
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="예: 내 집 마련, 노후자금"
                />
              </div>
              <PremiumMobileSlider
                label="목표 금액"
                value={targetAmount}
                onChange={setTargetAmount}
                min={1000000}
                max={1000000000}
                step={1000000}
                unit="원"
                icon="💰"
              />
              <PremiumMobileSlider
                label="목표 기간"
                value={targetYears}
                onChange={setTargetYears}
                min={1}
                max={30}
                step={1}
                unit="년"
                icon="⏰"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 rounded-xl hover:bg-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                저장
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 🏦 상품 추천 섹션
const ProductRecommendationSection = ({
  selectedStyle,
  currentGoal,
  selectedProducts,
  onProductSelect,
  monthlyAmount,
}) => {
  const recommendedProducts = realFinancialProducts[selectedStyle.id] || [];
  const getProductAchievementRate = (product) => {
    if (!currentGoal) return 0;
    const result = calculateCompoundInterest(
      monthlyAmount,
      currentGoal.targetYears,
      product.rate
    );
    return (result.finalAmount / currentGoal.targetAmount) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-gray-700/50 relative overflow-hidden"
    >
      <h3 className="text-xl font-bold text-center mb-2">
        🏦 이 상품들로 시작해봐요
      </h3>
      <p className="text-gray-400 text-sm text-center mb-8">
        {selectedStyle.title} 스타일의 맞춤 상품
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendedProducts.map((product, index) => {
          const isSelected = selectedProducts.some((p) => p.id === product.id);
          const achievementRate = getProductAchievementRate(product);
          return (
            <motion.button
              key={product.id}
              onClick={() => onProductSelect(product)}
              className={`p-6 rounded-3xl text-left border transition-all duration-300 ${
                isSelected
                  ? "bg-emerald-400/20 border-emerald-400/50"
                  : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">{product.name}</h4>
                <div className="text-sm font-bold text-emerald-400">
                  {product.rate}%
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                {product.description}
              </p>
              <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, achievementRate)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>목표 달성률</span>
                <span
                  className={
                    achievementRate >= 100
                      ? "text-emerald-400"
                      : "text-gray-400"
                  }
                >
                  {Math.round(achievementRate)}%
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 text-emerald-400 text-xl">
                  ✔
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

// 📱 메인 컴포넌트
const FinPickSimulation = () => {
  const { goals, currentGoal, setCurrentGoal, addGoal } = useGoalManager();
  const [selectedInvestmentStyle, setSelectedInvestmentStyle] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [monthlyAmount, setMonthlyAmount] = useState(500000);
  const [targetYears, setTargetYears] = useState(7);
  const [expectedReturn, setExpectedReturn] = useState(4.2);
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  useEffect(() => {
    if (currentGoal && !selectedInvestmentStyle) {
      const recommendedStyleId = getRecommendedStyleByGoal(
        currentGoal.name,
        currentGoal.targetAmount,
        currentGoal.targetYears
      );
      const recommendedStyle = investmentStyles.find(
        (s) => s.id === recommendedStyleId
      );
      if (recommendedStyle) {
        console.log(
          `💡 ${currentGoal.name}에는 ${recommendedStyle.title} 스타일을 추천합니다`
        );
      }
    }
  }, [currentGoal, selectedInvestmentStyle]);
  useEffect(() => {
    if (selectedInvestmentStyle) {
      const avgReturn =
        (selectedInvestmentStyle.expectedReturn.min +
          selectedInvestmentStyle.expectedReturn.max) /
        2;
      setExpectedReturn(avgReturn);
      setSelectedProducts([]);
    }
  }, [selectedInvestmentStyle]);
  useEffect(() => {
    if (currentGoal) {
      setTargetYears(currentGoal.targetYears || 7);
    }
  }, [currentGoal]);
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const avgRate =
        selectedProducts.reduce((sum, product) => sum + product.rate, 0) /
        selectedProducts.length;
      setExpectedReturn(avgRate);
    }
  }, [selectedProducts]);
  const previewResult = calculateCompoundInterest(
    monthlyAmount,
    targetYears,
    expectedReturn
  );
  const targetAmount = currentGoal?.targetAmount || 100000000;
  const achievementRate = (previewResult.finalAmount / targetAmount) * 100;
  const runSimulation = useCallback(async () => {
    setIsCalculating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const calculationResult = calculateCompoundInterest(
      monthlyAmount,
      targetYears,
      expectedReturn
    );
    const chartDataResult = generateChartData(
      monthlyAmount,
      targetYears,
      expectedReturn
    );
    setResult(calculationResult);
    setChartData(chartDataResult);
    setIsCalculating(false);
  }, [monthlyAmount, targetYears, expectedReturn]);
  const handleNewGoal = () => {
    setShowNewGoalModal(true);
  };
  const handleSaveGoal = (goalData) => {
    addGoal(goalData);
  };
  const handleSelectInvestmentStyle = (style) => {
    setSelectedInvestmentStyle(style);
  };
  const handleProductSelect = (product) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-6 max-w-md lg:max-w-6xl">
        {/* 🎯 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            미래계산기
          </h1>
          <p className="text-gray-400 text-base lg:text-lg">
            나의 목표 달성 시뮬레이션
          </p>
        </motion.div>
        {/* 🎯 목표 선택 (컴포넌트가 있다면 여기에 위치) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* GoalSelector 컴포넌트 */}
        </motion.div>
        {/* 💭 투자성향 선택 - 목표 연동 */}
        <InvestmentStyleSelector
          selectedStyle={selectedInvestmentStyle}
          onSelectStyle={handleSelectInvestmentStyle}
          currentGoal={currentGoal}
        />
        {/* 🏦 상품 추천 섹션 */}
        {selectedInvestmentStyle && (
          <ProductRecommendationSection
            selectedStyle={selectedInvestmentStyle}
            currentGoal={currentGoal}
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            monthlyAmount={monthlyAmount}
          />
        )}
        {/* ✨ 신규: 포트폴리오 시각화 섹션 */}
        {selectedInvestmentStyle && selectedProducts.length > 0 && (
          <PortfolioVisualizationSection
            selectedProducts={selectedProducts}
            monthlyAmount={monthlyAmount}
            selectedStyle={selectedInvestmentStyle}
          />
        )}
        {currentGoal && selectedInvestmentStyle && (
          <>
            {/* 📊 실시간 미리보기 - 선택된 상품 반영 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${selectedInvestmentStyle.bgColor} backdrop-blur-xl rounded-3xl p-8 mb-6 border ${selectedInvestmentStyle.borderColor} relative overflow-hidden`}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${selectedInvestmentStyle.bgColor} rounded-3xl`}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative text-center">
                <motion.div
                  className="text-gray-300 text-sm mb-2 flex items-center justify-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span>{selectedInvestmentStyle.emoji}</span>
                  <span>{currentGoal.name} 예상 달성 금액</span>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                    {" "}
                    {selectedInvestmentStyle.title}{" "}
                  </span>
                  {selectedProducts.length > 0 && (
                    <span className="text-xs bg-emerald-400/20 px-2 py-1 rounded-full text-emerald-300">
                      {" "}
                      {selectedProducts.length}개 상품 선택됨{" "}
                    </span>
                  )}
                </motion.div>
                <motion.div
                  className="text-4xl lg:text-5xl font-bold text-white mb-4"
                  key={previewResult.finalAmount}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {" "}
                  {previewResult.finalAmount.toLocaleString()}원{" "}
                </motion.div>
                <motion.div
                  className={`text-xl font-bold ${
                    achievementRate >= 100
                      ? "text-emerald-400"
                      : achievementRate >= 80
                      ? "text-yellow-400"
                      : "text-orange-400"
                  }`}
                  animate={{
                    scale: achievementRate >= 100 ? [1, 1.05, 1] : 1,
                    textShadow:
                      achievementRate >= 100
                        ? [
                            "0 0 10px rgba(16, 185, 129, 0.5)",
                            "0 0 20px rgba(16, 185, 129, 0.8)",
                            "0 0 10px rgba(16, 185, 129, 0.5)",
                          ]
                        : "none",
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {" "}
                  목표 달성률: {Math.round(achievementRate)}%{" "}
                </motion.div>
                <motion.div
                  className="text-sm text-gray-200 mt-3 p-3 bg-black/20 rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {selectedProducts.length > 0 ? (
                    <div>
                      {" "}
                      💡 선택된 상품 평균 수익률: {expectedReturn.toFixed(
                        1
                      )}%{" "}
                      <div className="text-xs mt-1 opacity-80">
                        {" "}
                        {selectedProducts
                          .map((p) => `${p.name} ${p.rate}%`)
                          .join(" • ")}{" "}
                      </div>{" "}
                    </div>
                  ) : (
                    <div>
                      {" "}
                      💡 예상 수익률:{" "}
                      {selectedInvestmentStyle.expectedReturn.min}% ~{" "}
                      {selectedInvestmentStyle.expectedReturn.max}%{" "}
                    </div>
                  )}
                  {achievementRate < 100 && (
                    <div className="mt-2">
                      {" "}
                      💪{" "}
                      {(
                        targetAmount - previewResult.finalAmount
                      ).toLocaleString()}
                      원 더 필요해요{" "}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
            {/* 🎚️ 조건 설정 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-gray-700/50 relative overflow-hidden"
            >
              <motion.h3
                className="text-xl font-bold mb-2 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {" "}
                ⚙️ 조건 설정{" "}
              </motion.h3>
              <motion.p
                className="text-gray-400 text-sm text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {" "}
                {selectedInvestmentStyle.title} 스타일 적용중{" "}
                {selectedProducts.length > 0 &&
                  ` • ${selectedProducts.length}개 상품 수익률 반영`}{" "}
              </motion.p>
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <PremiumMobileSlider
                  label="월 저축액"
                  value={monthlyAmount}
                  onChange={setMonthlyAmount}
                  min={100000}
                  max={2000000}
                  step={100000}
                  unit="원"
                  icon="💰"
                  disabled={isCalculating}
                />
                <PremiumMobileSlider
                  label="목표 기간"
                  value={targetYears}
                  onChange={setTargetYears}
                  min={1}
                  max={20}
                  step={1}
                  unit="년"
                  icon="⏰"
                  disabled={isCalculating}
                />
                <div className="space-y-2">
                  <PremiumMobileSlider
                    label="예상 수익률"
                    value={expectedReturn}
                    onChange={setExpectedReturn}
                    min={selectedInvestmentStyle.expectedReturn.min}
                    max={selectedInvestmentStyle.expectedReturn.max}
                    step={0.1}
                    unit="%"
                    icon="📈"
                    disabled={isCalculating || selectedProducts.length > 0}
                  />
                  <motion.div
                    className="text-xs text-gray-400 text-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {selectedProducts.length > 0
                      ? "선택된 상품 평균 수익률 자동 적용"
                      : `${selectedInvestmentStyle.expectedReturn.min}% ~ ${selectedInvestmentStyle.expectedReturn.max}% 범위`}
                  </motion.div>
                </div>
              </motion.div>
              <div className="flex justify-center mt-8">
                <motion.button
                  onClick={runSimulation}
                  disabled={isCalculating}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold transition-all duration-300 shadow-lg hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCalculating ? "계산 중..." : "시뮬레이션 다시 시작"}
                </motion.button>
              </div>
            </motion.div>
            {/* 📈 시뮬레이션 결과 및 차트 */}
            <AnimatePresence>
              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6"
                >
                  <motion.div
                    className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 mb-6 border border-gray-700/50 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-xl font-bold mb-4 text-center">
                      {" "}
                      ✨ 최종 시뮬레이션 결과{" "}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="colorInterest"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#4ade80"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#4ade80"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorPrincipal"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8884d8"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8884d8"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="year"
                          tick={{ fill: "#a0a0a0" }}
                          axisLine={{ stroke: "#404040" }}
                          tickFormatter={(year) => `${year}년`}
                        />
                        <YAxis
                          tick={{ fill: "#a0a0a0" }}
                          axisLine={{ stroke: "#404040" }}
                          tickFormatter={(value) =>
                            `${(value / 10000).toFixed(0)}만`
                          }
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            `${value.toLocaleString()}원`,
                            name === "interest" ? "이자" : "원금",
                          ]}
                          labelFormatter={(year) => `${year}년차`}
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "1rem",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="interest"
                          stackId="1"
                          stroke="#4ade80"
                          fillOpacity={1}
                          fill="url(#colorInterest)"
                        />
                        <Area
                          type="monotone"
                          dataKey="principal"
                          stackId="1"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorPrincipal)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </motion.div>
                  <motion.div
                    className={`bg-gradient-to-br ${
                      achievementRate >= 100
                        ? "from-emerald-500 to-green-500"
                        : "from-blue-500 to-purple-500"
                    } backdrop-blur-xl rounded-3xl p-8 mb-6 border-2 ${
                      achievementRate >= 100
                        ? "border-emerald-400/50"
                        : "border-blue-400/50"
                    } relative overflow-hidden text-center shadow-lg`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      className={`text-6xl mb-4 ${
                        achievementRate >= 100
                          ? "text-yellow-300"
                          : "text-gray-300"
                      }`}
                      animate={{
                        scale: achievementRate >= 100 ? [1, 1.2, 1] : 1,
                        rotate: achievementRate >= 100 ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {achievementRate >= 100
                        ? "🎉"
                        : achievementRate >= 80
                        ? "⚡"
                        : "💪"}
                    </motion.div>
                    <div className="font-bold text-xl mb-2">
                      {achievementRate >= 100
                        ? "목표 달성!"
                        : achievementRate >= 80
                        ? "거의 달성!"
                        : "조정 필요"}
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      {achievementRate >= 100
                        ? `${selectedInvestmentStyle.title} 스타일로 목표를 달성했어요!`
                        : achievementRate >= 80
                        ? "조금만 더 노력하면 달성 가능해요!"
                        : "월 저축액을 늘리거나 기간을 조정해보세요."}
                    </div>
                    <div className="text-xs text-gray-400">
                      위험도:{" "}
                      {[...Array(5)]
                        .map((_, i) =>
                          i < selectedInvestmentStyle.riskLevel ? "★" : "☆"
                        )
                        .join("")}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        {/* 📝 새 목표 모달 */}
        <NewGoalModal
          isOpen={showNewGoalModal}
          onClose={() => setShowNewGoalModal(false)}
          onSave={handleSaveGoal}
        />
      </div>
    </div>
  );
};

export default FinPickSimulation;
