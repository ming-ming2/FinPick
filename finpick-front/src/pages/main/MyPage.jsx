// 📁 finpick-front/src/pages/main/MyPage.jsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  TrendingUp,
  Award,
  Calendar,
  Download,
  Edit3,
  Camera,
  Sparkles,
  Target,
  PiggyBank,
  Trophy,
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

const MyPage = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [showSavings, setShowSavings] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg">로딩 중...</span>
        </div>
      </div>
    );
  }

  // 사용자 레벨 계산 (활동 점수 기반)
  const getUserLevel = () => {
    const score = userProfile.activityScore || 0;
    if (score >= 1000)
      return {
        level: 5,
        name: "투자 마스터",
        emoji: "🏆",
        color: "text-yellow-400",
      };
    if (score >= 500)
      return {
        level: 4,
        name: "재테크 전문가",
        emoji: "💎",
        color: "text-purple-400",
      };
    if (score >= 200)
      return {
        level: 3,
        name: "똑똑한 투자자",
        emoji: "🎯",
        color: "text-blue-400",
      };
    if (score >= 100)
      return {
        level: 2,
        name: "성장하는 새싹",
        emoji: "🌱",
        color: "text-green-400",
      };
    return {
      level: 1,
      name: "투자 입문자",
      emoji: "🔰",
      color: "text-gray-400",
    };
  };

  const userLevel = getUserLevel();

  // 진행률 계산
  const getProgressToNextLevel = () => {
    const score = userProfile.activityScore || 0;
    const thresholds = [0, 100, 200, 500, 1000];
    const currentLevel = userLevel.level;

    if (currentLevel >= 5) return 100;

    const currentThreshold = thresholds[currentLevel - 1];
    const nextThreshold = thresholds[currentLevel];
    const progress =
      ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

    return Math.max(0, Math.min(100, progress));
  };

  // 가입일 계산
  const getJoinedDays = () => {
    if (!userProfile.createdAt) return 0;
    const created = userProfile.createdAt.toDate
      ? userProfile.createdAt.toDate()
      : new Date(userProfile.createdAt);
    const now = new Date();
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
  };

  // 목표 금액 표시용
  const formatAmount = (amount) => {
    if (!amount) return "설정 안됨";
    return `${(amount / 10000).toFixed(0)}만원`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header 컴포넌트 사용 */}
      <Header showProfile={true} showNav={true} />

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* 프로필 헤더 */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-400/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/10 to-transparent rounded-full blur-2xl"></div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* 프로필 이미지 */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-cyan-400 p-0.5">
                  <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-800 flex items-center justify-center">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="프로필"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center text-gray-900 hover:bg-emerald-300 transition-colors opacity-0 group-hover:opacity-100">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* 기본 정보 */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h1 className="text-3xl font-bold">{userProfile.nickname}</h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{userLevel.emoji}</span>
                    <span className={`font-medium ${userLevel.color}`}>
                      {userLevel.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-gray-400 mb-4">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{getJoinedDays()}일째 함께</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{userProfile.activityScore || 0}P</span>
                  </span>
                </div>

                {/* 레벨 진행률 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>레벨 {userLevel.level}</span>
                    <span>
                      {userLevel.level < 5
                        ? `레벨 ${userLevel.level + 1}까지 ${
                            100 - getProgressToNextLevel().toFixed(0)
                          }%`
                        : "최고 레벨!"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressToNextLevel()}%` }}
                    ></div>
                  </div>
                </div>

                {/* 빠른 액션 */}
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-400/10 text-emerald-400 rounded-lg hover:bg-emerald-400/20 transition-colors">
                    <Edit3 className="w-4 h-4" />
                    <span>프로필 수정</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    <span>투자 리포트</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1 mb-8">
            {[
              { id: "overview", name: "개요", icon: Activity },
              { id: "investment", name: "투자 현황", icon: TrendingUp },
              { id: "goals", name: "목표 관리", icon: Target },
              { id: "settings", name: "설정", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-400 text-gray-900 shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="space-y-8">
            {activeTab === "overview" && (
              <>
                {/* 투자 요약 카드들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* 위험도 카드 */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">
                        {userProfile.investmentProfile?.riskLevel?.emoji}
                      </div>
                      <Shield className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-300 mb-1">
                      투자 성향
                    </h3>
                    <p className="text-xl font-bold">
                      {userProfile.investmentProfile?.riskLevel?.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {userProfile.investmentProfile?.riskLevel?.description}
                    </p>
                  </div>

                  {/* 재정 건전성 카드 */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">
                        {userProfile.financialStatus?.financialHealth?.emoji}
                      </div>
                      <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-300 mb-1">
                      재정 건전성
                    </h3>
                    <p className="text-xl font-bold">
                      {userProfile.financialStatus?.financialHealth?.status}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      저축률{" "}
                      {
                        userProfile.financialStatus?.financialHealth
                          ?.savingsRate
                      }
                      %
                    </p>
                  </div>

                  {/* 목표 금액 카드 */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">🎯</div>
                      <button
                        onClick={() => setShowSavings(!showSavings)}
                        className="text-gray-400 hover:text-white"
                      >
                        {showSavings ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-300 mb-1">
                      목표 금액
                    </h3>
                    <p className="text-xl font-bold">
                      {showSavings
                        ? formatAmount(
                            userProfile.investmentGoals?.amountDetails?.amount *
                              10000
                          )
                        : "****만원"}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {userProfile.investmentGoals?.timeframe}
                    </p>
                  </div>

                  {/* 월 투자금 카드 */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">💰</div>
                      <PiggyBank className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-300 mb-1">
                      월 투자금
                    </h3>
                    <p className="text-xl font-bold">
                      {showSavings
                        ? userProfile.financialStatus?.monthlyInvestment
                        : "****만원"}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">꾸준한 적립 중</p>
                  </div>
                </div>

                {/* 최근 활동 */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                      <span>최근 활동</span>
                    </h2>
                    <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                      전체 보기
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                      <div className="w-10 h-10 bg-emerald-400/20 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">온보딩 완료</p>
                        <p className="text-sm text-gray-400">
                          투자 성향 분석을 완료했어요
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">+100P</p>
                        <p className="text-xs text-gray-500">방금 전</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">프로필 생성</p>
                        <p className="text-sm text-gray-400">
                          FinPick에 가입했어요
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">+50P</p>
                        <p className="text-xs text-gray-500">
                          {getJoinedDays()}일 전
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "investment" && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl border border-gray-700/50">
                <div className="text-center py-16">
                  <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">투자 현황</h3>
                  <p className="text-gray-400 mb-6">
                    아직 투자 상품이 없어요
                    <br />
                    맞춤 상품을 추천받아보세요!
                  </p>
                  <button
                    onClick={() => navigate("/recommendations")}
                    className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    상품 추천받기
                  </button>
                </div>
              </div>
            )}

            {activeTab === "goals" && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center space-x-2">
                    <Target className="w-6 h-6 text-emerald-400" />
                    <span>투자 목표</span>
                  </h2>
                  <button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                    목표 수정
                  </button>
                </div>

                <div className="space-y-6">
                  {userProfile.investmentGoals?.primaryGoals?.map(
                    (goal, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {goal.emoji || "🎯"}
                            </span>
                            <div>
                              <h3 className="font-semibold">{goal.value}</h3>
                              <p className="text-sm text-gray-400">
                                우선순위 {goal.priority}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              가중치 {goal.weight * 100}%
                            </p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full"
                            style={{ width: `${goal.weight * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}

                  <div className="p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">
                        AI 추천
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      현재 설정된 목표와 재정 상황을 바탕으로
                      <span className="font-semibold text-emerald-400">
                        {" "}
                        {
                          userProfile.investmentGoals?.personalizedResult
                            ?.strategy
                        }{" "}
                      </span>
                      를 추천드려요!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* 계정 설정 */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700/50">
                  <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                    <Settings className="w-6 h-6 text-emerald-400" />
                    <span>계정 설정</span>
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">알림 설정</p>
                          <p className="text-sm text-gray-400">
                            투자 관련 알림을 관리해요
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">개인정보 보호</p>
                          <p className="text-sm text-gray-400">
                            데이터 사용 및 보안 설정
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">연결된 계좌</p>
                          <p className="text-sm text-gray-400">
                            마이데이터 연동 관리
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* 위험 구역 */}
                <div className="bg-gradient-to-br from-red-950/50 to-gray-900 p-6 rounded-xl border border-red-800/50">
                  <h2 className="text-xl font-bold mb-6 text-red-400">
                    위험 구역
                  </h2>

                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 bg-red-900/30 border border-red-800/50 rounded-lg hover:bg-red-900/50 transition-colors text-red-400">
                      <span>모든 데이터 삭제</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 bg-red-900/30 border border-red-800/50 rounded-lg hover:bg-red-900/50 transition-colors text-red-400">
                      <span>계정 탈퇴</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer 컴포넌트 사용 */}
      <Footer variant="default" />
    </div>
  );
};

export default MyPage;
