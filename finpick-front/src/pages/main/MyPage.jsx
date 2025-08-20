// finpick-front/src/pages/main/MyPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  User,
  Target,
  TrendingUp,
  Wallet,
  PiggyBank,
  CreditCard,
  Award,
  Edit3,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Activity,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Shield,
  Zap,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // 데이터 가공 함수들
  const getFinancialHealthScore = () => {
    if (!userProfile?.onboardingAnswers) return 75;

    const answers = userProfile.onboardingAnswers;
    let score = 50;

    if (answers.lossReaction?.includes("크게 걱정하지 않음")) score += 3;
    else if (answers.lossReaction?.includes("어느 정도 감내")) score += 2;
    else if (answers.lossReaction?.includes("걱정되지만")) score += 1;

    if (answers.returnExpectation?.includes("10% 이상")) score += 3;
    else if (answers.returnExpectation?.includes("7-10%")) score += 2;
    else if (answers.returnExpectation?.includes("5-7%")) score += 1;

    const income = parseInt(
      answers.monthlyIncome?.replace(/[^0-9]/g, "") || "0"
    );
    const expense = parseInt(
      answers.monthlyExpense?.replace(/[^0-9]/g, "") || "0"
    );

    if (income > 0) {
      const ratio = expense / income;
      if (ratio < 0.6) score += 20;
      else if (ratio < 0.8) score += 10;
      else score -= 10;
    }

    if (answers.monthlyInvestment && answers.monthlyInvestment !== "0원") {
      score += 15;
    }

    if (answers.creditRating?.includes("1-3등급")) score += 15;
    else if (answers.creditRating?.includes("4-6등급")) score += 5;

    return Math.min(100, Math.max(0, score));
  };

  const getAssetData = () => {
    if (!userProfile?.onboardingAnswers)
      return {
        totalAssets: "2,450만원",
        monthlyIncome: "350만원",
        monthlyExpense: "280만원",
        monthlyInvestment: "50만원",
        savingsRate: "14%",
        creditRating: "1등급",
      };

    const answers = userProfile.onboardingAnswers;
    const income = parseInt(
      answers.monthlyIncome?.replace(/[^0-9]/g, "") || "0"
    );
    const expense = parseInt(
      answers.monthlyExpense?.replace(/[^0-9]/g, "") || "0"
    );
    const savingsRate =
      income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    return {
      totalAssets: answers.currentSavings || "정보 없음",
      monthlyIncome: answers.monthlyIncome || "정보 없음",
      monthlyExpense: answers.monthlyExpense || "정보 없음",
      monthlyInvestment: answers.monthlyInvestment || "0원",
      savingsRate: `${savingsRate}%`,
      creditRating: answers.creditRating || "정보 없음",
    };
  };

  const getRiskProfile = () => {
    if (!userProfile?.onboardingAnswers)
      return {
        name: "안정추구형",
        level: 2,
        description: "원금 보존을 중시하며 안정적인 수익을 추구",
        color: "blue",
      };

    const answers = userProfile.onboardingAnswers;
    let riskScore = 0;

    if (answers.lossReaction?.includes("크게 걱정하지 않음")) riskScore += 3;
    else if (answers.lossReaction?.includes("어느 정도 감내")) riskScore += 2;
    else if (answers.lossReaction?.includes("걱정되지만")) riskScore += 1;

    if (answers.returnExpectation?.includes("10% 이상")) riskScore += 3;
    else if (answers.returnExpectation?.includes("7-10%")) riskScore += 2;
    else if (answers.returnExpectation?.includes("5-7%")) riskScore += 1;

    const riskTypes = [
      {
        name: "안전추구형",
        level: 1,
        description: "원금 보존 최우선",
        color: "emerald",
      },
      {
        name: "안정추구형",
        level: 2,
        description: "안정적 수익 추구",
        color: "blue",
      },
      {
        name: "위험중립형",
        level: 3,
        description: "균형잡힌 투자",
        color: "purple",
      },
      {
        name: "적극투자형",
        level: 4,
        description: "고수익 추구",
        color: "orange",
      },
      {
        name: "공격투자형",
        level: 5,
        description: "최대 수익 추구",
        color: "red",
      },
    ];

    const index = Math.min(Math.floor(riskScore / 2), 4);
    return riskTypes[index];
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const assetData = getAssetData();
  const riskProfile = getRiskProfile();
  const healthScore = getFinancialHealthScore();

  // 빠른 통계
  const quickStats = [
    {
      label: "이번 달 저축률",
      value: assetData.savingsRate,
      change: "+2.3%",
      trend: "up",
      icon: PiggyBank,
      color: "emerald",
    },
    {
      label: "투자 수익률",
      value: "7.8%",
      change: "+1.2%",
      trend: "up",
      icon: TrendingUp,
      color: "cyan",
    },
    {
      label: "지출 관리",
      value: "양호",
      change: "-5%",
      trend: "down",
      icon: CreditCard,
      color: "blue",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      {/* 메인 컨테이너 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 상단 프로필 섹션 - 컴팩트하게 */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 mb-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* 프로필 이미지 */}
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 p-0.5">
                  <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-gray-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>

              {/* 사용자 정보 */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {user?.displayName || "핀픽 사용자"}님
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    {riskProfile.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    가입 30일차
                  </span>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                {showBalance ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <Link
                to="/settings"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 재정 건전성 스코어 카드 - 핵심 지표 */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-2xl p-6 mb-6 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  AI 재정 건전성 점수
                </h2>
                <p className="text-sm text-gray-400">실시간 분석 결과</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {healthScore}
              </div>
              <div className="text-sm text-gray-400">/ 100</div>
            </div>
          </div>

          {/* 점수 바 */}
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
            <div
              className="absolute h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-1000"
              style={{ width: `${healthScore}%` }}
            />
          </div>

          {/* 빠른 평가 */}
          <div className="grid grid-cols-3 gap-4">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {showBalance ? stat.value : "•••"}
                </div>
                <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
                <div
                  className={`text-xs font-medium ${
                    stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {stat.trend === "up" ? "↑" : "↓"} {stat.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "종합", icon: BarChart3 },
            { id: "assets", label: "자산", icon: Wallet },
            { id: "analysis", label: "분석", icon: Activity },
            { id: "recommendations", label: "추천", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 자산 현황 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 총 자산 카드 */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-400" />총 자산 현황
                  </h3>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">
                    실시간 업데이트
                  </span>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                    {showBalance ? assetData.totalAssets : "••••••••"}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-emerald-400">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm">전월 대비 +2.3%</span>
                  </div>
                </div>

                {/* 자산 구성 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span className="text-sm text-gray-400">예적금</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {showBalance ? "1,200만원" : "•••••"}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span className="text-sm text-gray-400">투자</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {showBalance ? "850만원" : "•••••"}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-sm text-gray-400">현금</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {showBalance ? "400만원" : "•••••"}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full" />
                      <span className="text-sm text-gray-400">기타</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {showBalance ? "0원" : "•••••"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 월간 수지 현황 */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                  월간 수지 현황
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <ArrowDown className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">월 수입</div>
                        <div className="text-lg font-semibold">
                          {showBalance ? assetData.monthlyIncome : "•••••"}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400">안정적</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <ArrowUp className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">월 지출</div>
                        <div className="text-lg font-semibold">
                          {showBalance ? assetData.monthlyExpense : "•••••"}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-orange-400">관리 필요</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <PiggyBank className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">월 저축</div>
                        <div className="text-lg font-semibold">
                          {showBalance ? assetData.monthlyInvestment : "•••••"}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400">
                      목표 달성중
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 투자 성향 & 추천 */}
            <div className="space-y-6">
              {/* 투자 성향 카드 */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  투자 성향
                </h3>

                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-purple-400 mb-2">
                    {riskProfile.name}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    {riskProfile.description}
                  </div>

                  {/* 리스크 레벨 */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-8 h-2 rounded-full ${
                          level <= riskProfile.level
                            ? "bg-purple-400"
                            : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-purple-300 font-medium">
                  투자 성향 재진단
                </button>
              </div>

              {/* 빠른 액션 */}
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold mb-4">빠른 실행</h3>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/simulation")}
                    className="w-full p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-emerald-400" />
                      <span>시뮬레이션</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button className="w-full p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      <span>투자 추천</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button className="w-full p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      <span>리포트 보기</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* AI 인사이트 */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <h3 className="text-sm font-semibold text-yellow-400">
                    AI 인사이트
                  </h3>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  현재 저축률이 {assetData.savingsRate}로 양호한 편입니다. 월
                  지출을 10% 줄이면 연간 420만원을 추가로 저축할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assets" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 자산 카드들 */}
            {[
              {
                icon: Wallet,
                label: "총 자산",
                value: assetData.totalAssets,
                change: "+2.3%",
                color: "emerald",
              },
              {
                icon: DollarSign,
                label: "월 수입",
                value: assetData.monthlyIncome,
                change: "0%",
                color: "cyan",
              },
              {
                icon: CreditCard,
                label: "월 지출",
                value: assetData.monthlyExpense,
                change: "+5%",
                color: "red",
              },
              {
                icon: PiggyBank,
                label: "월 저축",
                value: assetData.monthlyInvestment,
                change: "+10%",
                color: "purple",
              },
              {
                icon: TrendingUp,
                label: "투자 수익",
                value: "7.8%",
                change: "+1.2%",
                color: "blue",
              },
              {
                icon: Shield,
                label: "신용 등급",
                value: assetData.creditRating,
                change: "유지",
                color: "yellow",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl bg-${item.color}-500/10`}>
                    <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      item.change.startsWith("+")
                        ? "text-emerald-400"
                        : item.change.startsWith("-")
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mb-2">{item.label}</div>
                <div className="text-xl font-bold">
                  {showBalance ? item.value : "•••••"}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="space-y-6">
            {/* 재정 분석 결과 */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <Activity className="w-6 h-6 text-emerald-400" />
                AI 재정 분석 결과
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    category: "수입 안정성",
                    score: 85,
                    status: "우수",
                    description: "안정적인 월 수입 유지",
                    color: "emerald",
                  },
                  {
                    category: "지출 효율성",
                    score: 72,
                    status: "양호",
                    description: "식비와 쇼핑 지출 관리 필요",
                    color: "cyan",
                  },
                  {
                    category: "저축 습관",
                    score: 90,
                    status: "매우 우수",
                    description: "꾸준한 저축 실천 중",
                    color: "purple",
                  },
                  {
                    category: "투자 다각화",
                    score: 65,
                    status: "보통",
                    description: "포트폴리오 다각화 권장",
                    color: "orange",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-800/30 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{item.category}</h4>
                      <span
                        className={`text-sm px-2 py-1 rounded-full bg-${item.color}-500/10 text-${item.color}-400`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl font-bold">
                          {item.score}점
                        </span>
                        <span className="text-xs text-gray-400">/ 100</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${item.color}-400 rounded-full transition-all duration-1000`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 월별 트렌드 */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">최근 6개월 트렌드</h3>
              <div className="space-y-3">
                {["6월", "7월", "8월", "9월", "10월", "11월"].map(
                  (month, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 w-8">{month}</span>
                      <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden flex">
                        <div
                          className="bg-emerald-500/30 border-r border-gray-700"
                          style={{ width: `${40 + idx * 5}%` }}
                        />
                        <div
                          className="bg-red-500/30"
                          style={{ width: `${35 - idx * 2}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-emerald-400">
                        +{5 + idx}%
                      </span>
                    </div>
                  )
                )}
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500/30 rounded" />
                  수입
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500/30 rounded" />
                  지출
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-6">
            {/* AI 맞춤 추천 */}
            <div className="bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-2xl p-6 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-semibold">AI 맞춤 추천</h3>
                <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">
                  NEW
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                {user?.displayName || "고객"}님의 투자 성향과 재정 상황을 분석한
                맞춤형 추천입니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "KB 주거래 우대 적금",
                    type: "적금",
                    rate: "연 4.5%",
                    description: "12개월 정기적금, 세전 이자",
                    match: "95%",
                    color: "emerald",
                  },
                  {
                    title: "삼성 반도체 ETF",
                    type: "ETF",
                    rate: "연 수익률 12.3%",
                    description: "중위험 중수익 상품",
                    match: "88%",
                    color: "cyan",
                  },
                  {
                    title: "미래에셋 글로벌 펀드",
                    type: "펀드",
                    rate: "연 수익률 8.7%",
                    description: "글로벌 분산 투자",
                    match: "82%",
                    color: "purple",
                  },
                  {
                    title: "NH 주택청약 종합저축",
                    type: "청약",
                    rate: "연 2.8% + α",
                    description: "청약 가점 + 소득공제",
                    match: "90%",
                    color: "blue",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-${item.color}-500/10 text-${item.color}-400`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        매칭률 {item.match}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="text-2xl font-bold text-emerald-400 mb-2">
                      {item.rate}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      {item.description}
                    </p>
                    <button className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium">
                      자세히 보기
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 실행 가능한 액션 */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                지금 실행 가능한 액션
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gray-800/50 flex items-center justify-between group hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Target className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">
                        포트폴리오 시뮬레이션 시작
                      </div>
                      <div className="text-sm text-gray-400">
                        5분 소요 • AI 기반 분석
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="p-4 rounded-xl bg-gray-800/50 flex items-center justify-between group hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Edit3 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">투자 성향 재진단</div>
                      <div className="text-sm text-gray-400">
                        3분 소요 • 맞춤 추천 개선
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="p-4 rounded-xl bg-gray-800/50 flex items-center justify-between group hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">
                        월간 리포트 다운로드
                      </div>
                      <div className="text-sm text-gray-400">
                        PDF 형식 • 상세 분석 포함
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        /* 부드러운 스크롤 */
        html {
          scroll-behavior: smooth;
        }

        /* 커스텀 스크롤바 */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #111827;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #06b6d4);
          border-radius: 3px;
        }

        /* 모바일 터치 최적화 */
        @media (max-width: 768px) {
          .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          
          .overflow-x-auto::-webkit-scrollbar {
            display: none;
          }
        }

        /* 애니메이션 */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default MyPage;
