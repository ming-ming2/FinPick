// finpick-front/src/pages/main/MyPage.jsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  TrendingUp,
  Calendar,
  Edit3,
  Camera,
  Target,
  PiggyBank,
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet,
  BarChart3,
  MapPin,
  Briefcase,
  Home,
} from "lucide-react";

const MyPage = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [showFinancialDetails, setShowFinancialDetails] = useState(false);

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

  // 온보딩 완료 여부 확인
  const isOnboardingCompleted = userProfile.onboardingStatus?.isCompleted;

  // 기본 정보들
  const basicInfo = userProfile.basicInfo;
  const investmentProfile = userProfile.investmentProfile;
  const financialStatus = userProfile.financialStatus;
  const investmentGoals = userProfile.investmentGoals;

  // 가입일 계산
  const getJoinedDays = () => {
    if (!userProfile.createdAt) return 0;
    const created = userProfile.createdAt.toDate
      ? userProfile.createdAt.toDate()
      : new Date(userProfile.createdAt);
    const now = new Date();
    return Math.floor((now - created) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽: 프로필 정보 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 기본 프로필 카드 */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-900" />
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold">{userProfile.nickname}</h1>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    가입 {getJoinedDays()}일차
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">프로필 완성도</span>
                  <span className="text-sm font-medium">
                    {isOnboardingCompleted ? "100%" : "미완료"}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: isOnboardingCompleted ? "100%" : "25%" }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 투자 성향 카드 */}
            {investmentProfile?.riskLevel && (
              <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-emerald-400" />
                  투자 성향
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {investmentProfile.riskLevel.emoji}
                  </div>
                  <div>
                    <div
                      className="font-medium"
                      style={{ color: investmentProfile.riskLevel.color }}
                    >
                      {investmentProfile.riskLevel.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {investmentProfile.riskLevel.description}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {investmentProfile.riskLevel.products?.map(
                    (product, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700/50 rounded text-xs"
                      >
                        {product}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* 빠른 액션 */}
            <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
              <h3 className="font-semibold mb-4">빠른 액션</h3>
              <div className="space-y-3">
                {!isOnboardingCompleted ? (
                  <button
                    onClick={() => navigate("/onboarding/step1")}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 border border-emerald-400/20 rounded-lg hover:from-emerald-400/20 hover:to-cyan-400/20 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">
                        프로필 완성하기
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/onboarding/step1")}
                    className="w-full flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Edit3 className="w-5 h-5 text-gray-400" />
                      <span>프로필 수정</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                <button
                  onClick={() => navigate("/settings")}
                  className="w-full flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-400" />
                    <span>설정</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 상세 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 온보딩 미완료 시 안내 */}
            {!isOnboardingCompleted && (
              <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-orange-400 mb-2">
                      프로필을 완성해주세요
                    </h3>
                    <p className="text-gray-300 mb-4">
                      맞춤형 금융상품 추천을 받으려면 간단한 프로필 설정이
                      필요합니다.
                    </p>
                    <button
                      onClick={() => navigate("/onboarding/step1")}
                      className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      지금 완성하기
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 기본 정보 */}
            {basicInfo && (
              <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <User className="w-6 h-6 mr-2 text-emerald-400" />
                  기본 정보
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">나이</div>
                        <div className="font-medium">{basicInfo.age}세</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">직업</div>
                        <div className="font-medium">
                          {basicInfo.occupation}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">거주지</div>
                        <div className="font-medium">{basicInfo.residence}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">주거형태</div>
                        <div className="font-medium">
                          {basicInfo.housingType}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 재무 상황 */}
            {financialStatus && (
              <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <Wallet className="w-6 h-6 mr-2 text-emerald-400" />
                    재무 상황
                  </h2>
                  <button
                    onClick={() =>
                      setShowFinancialDetails(!showFinancialDetails)
                    }
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showFinancialDetails ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {showFinancialDetails ? "숨기기" : "보기"}
                    </span>
                  </button>
                </div>

                {showFinancialDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">월 소득</div>
                      <div className="font-semibold">
                        {financialStatus.monthlyIncome}
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">월 지출</div>
                      <div className="font-semibold">
                        {financialStatus.monthlyExpense}
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">
                        월 투자금
                      </div>
                      <div className="font-semibold">
                        {financialStatus.monthlyInvestment}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>재무 정보를 보려면 클릭하세요</p>
                  </div>
                )}

                {financialStatus.financialHealth && showFinancialDetails && (
                  <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {financialStatus.financialHealth.emoji}
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          style={{
                            color: financialStatus.financialHealth.color,
                          }}
                        >
                          재정 상태: {financialStatus.financialHealth.status}
                        </div>
                        <div className="text-sm text-gray-400">
                          저축률 {financialStatus.financialHealth.savingsRate}%
                        </div>
                        <div className="text-sm text-gray-300 mt-1">
                          {financialStatus.financialHealth.advice}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 투자 목표 */}
            {investmentGoals && (
              <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-emerald-400" />
                  투자 목표
                </h2>

                {investmentGoals.primaryGoals &&
                  investmentGoals.primaryGoals.length > 0 && (
                    <div className="mb-6">
                      <div className="text-sm text-gray-400 mb-3">
                        주요 목표
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {investmentGoals.primaryGoals.map((goal, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 border border-emerald-400/20 rounded-full text-sm"
                          >
                            {goal.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {investmentGoals.timeframe && (
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">
                        투자 기간
                      </div>
                      <div className="font-semibold flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {investmentGoals.timeframe.period}년
                      </div>
                    </div>
                  )}

                  {investmentGoals.targetAmount && (
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">
                        목표 금액
                      </div>
                      <div className="font-semibold flex items-center">
                        <PiggyBank className="w-4 h-4 mr-2" />
                        {investmentGoals.targetAmount.amount?.toLocaleString()}
                        만원
                      </div>
                    </div>
                  )}
                </div>

                {investmentGoals.personalizedResult && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 border border-emerald-400/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-emerald-400">
                          AI 분석 결과
                        </div>
                        <div className="text-sm text-gray-300">
                          월{" "}
                          {investmentGoals.personalizedResult.monthlyTarget?.toLocaleString()}
                          원 투자 시
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-400">
                          {investmentGoals.personalizedResult.successRate}%
                        </div>
                        <div className="text-xs text-gray-400">성공 가능성</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 계정 관리 */}
            <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-emerald-400" />
                계정 관리
              </h2>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium">알림 설정</div>
                      <div className="text-sm text-gray-400">
                        추천 알림, 금리 변동 등
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium">개인정보 보호</div>
                      <div className="text-sm text-gray-400">
                        데이터 사용 및 보안 설정
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium">연결된 계좌</div>
                      <div className="text-sm text-gray-400">
                        마이데이터 연동 관리
                      </div>
                    </div>
                  </div>
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                    준비중
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyPage;
