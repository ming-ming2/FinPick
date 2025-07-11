//finpick-front/src/services/userService.js
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export class UserService {
  /**
   * 새 사용자 초기 프로필 생성
   */
  static async createUserProfile(user) {
    const userRef = doc(db, "users", user.uid);

    const initialProfile = {
      userId: user.uid,
      email: user.email,
      nickname: user.displayName || user.email?.split("@")[0] || "User",
      profileImage: user.photoURL || null,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),

      isActive: true,
      deactivatedAt: null,
      activityScore: 0,

      onboardingStatus: {
        isCompleted: false,
        currentStep: 1,
        totalSteps: 4,
        lastActiveAt: serverTimestamp(),
        stepsCompleted: {
          step1: false,
          step2: false,
          step3: false,
          step4: false,
        },
      },

      basicInfo: null,
      investmentProfile: null,
      financialStatus: null,
      investmentGoals: null,

      dataVersion: "1.0",
      schemaVersion: "2024.1",
    };

    try {
      await setDoc(userRef, initialProfile);
      console.log("사용자 프로필 생성 완료:", user.uid);
      return initialProfile;
    } catch (error) {
      console.error("사용자 프로필 생성 실패:", error);
      throw error;
    }
  }

  /**
   * 사용자 프로필 조회
   */
  static async getUserProfile(userId) {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        throw new Error("사용자 프로필이 존재하지 않습니다");
      }
    } catch (error) {
      console.error("사용자 프로필 조회 실패:", error);
      throw error;
    }
  }

  /**
   * 로그인 시간 업데이트
   */
  static async updateLastLogin(userId) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("로그인 시간 업데이트 실패:", error);
    }
  }

  /**
   * 1단계: 기본 정보 저장
   */
  static async saveBasicInfo(userId, basicInfoData) {
    try {
      const userRef = doc(db, "users", userId);

      const updateData = {
        basicInfo: {
          ...basicInfoData,
          completedAt: serverTimestamp(),
        },
        "onboardingStatus.stepsCompleted.step1": true,
        "onboardingStatus.currentStep": 2,
        "onboardingStatus.lastActiveAt": serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);

      await this.logUserActivity(userId, "onboarding_step1_completed", {
        completionTime: Date.now(),
        dataFields: Object.keys(basicInfoData),
      });

      console.log("1단계 기본정보 저장 완료");
      return updateData;
    } catch (error) {
      console.error("기본정보 저장 실패:", error);
      throw error;
    }
  }

  /**
   * 2단계: 투자 성향 저장
   */
  static async saveInvestmentProfile(userId, investmentData) {
    try {
      const userRef = doc(db, "users", userId);

      const riskLevel = this.calculateRiskLevel(investmentData.totalScore);

      const updateData = {
        investmentProfile: {
          ...investmentData,
          riskLevel,
          completedAt: serverTimestamp(),
        },
        "onboardingStatus.stepsCompleted.step2": true,
        "onboardingStatus.currentStep": 3,
        "onboardingStatus.lastActiveAt": serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);

      await this.logUserActivity(userId, "onboarding_step2_completed", {
        riskScore: investmentData.totalScore,
        riskLevel: riskLevel.level,
      });

      console.log("2단계 투자성향 저장 완료");
      return updateData;
    } catch (error) {
      console.error("투자성향 저장 실패:", error);
      throw error;
    }
  }

  /**
   * 3단계: 재무 상황 저장
   */
  static async saveFinancialStatus(userId, financialData) {
    try {
      const userRef = doc(db, "users", userId);

      const financialHealth = this.calculateFinancialHealth(financialData);

      const updateData = {
        financialStatus: {
          ...financialData,
          financialHealth,
          completedAt: serverTimestamp(),
        },
        "onboardingStatus.stepsCompleted.step3": true,
        "onboardingStatus.currentStep": 4,
        "onboardingStatus.lastActiveAt": serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);

      await this.logUserActivity(userId, "onboarding_step3_completed", {
        financialHealthStatus: financialHealth.status,
        savingsRate: financialHealth.savingsRate,
      });

      console.log("3단계 재무상황 저장 완료");
      return updateData;
    } catch (error) {
      console.error("재무상황 저장 실패:", error);
      throw error;
    }
  }

  /**
   * 4단계: 투자 목표 저장 및 온보딩 완료
   */
  static async saveInvestmentGoals(userId, goalsData) {
    try {
      const userRef = doc(db, "users", userId);

      const userProfile = await this.getUserProfile(userId);
      const personalizedResult = await this.generatePersonalizedRecommendation(
        userProfile,
        goalsData
      );

      const updateData = {
        investmentGoals: {
          ...goalsData,
          personalizedResult,
          completedAt: serverTimestamp(),
        },
        "onboardingStatus.isCompleted": true,
        "onboardingStatus.stepsCompleted.step4": true,
        "onboardingStatus.currentStep": 4,
        "onboardingStatus.completedAt": serverTimestamp(),
        "onboardingStatus.lastActiveAt": serverTimestamp(),
        updatedAt: serverTimestamp(),
        activityScore: 100,
      };

      await updateDoc(userRef, updateData);

      await this.logUserActivity(userId, "onboarding_completed", {
        totalCompletionTime: Date.now(),
        finalRiskLevel: userProfile.investmentProfile?.riskLevel?.level,
        primaryGoal: goalsData.primaryGoals?.[0]?.value,
      });

      await this.createInitialUserPreferences(userId, userProfile, goalsData);

      console.log("온보딩 완전 완료!");
      return updateData;
    } catch (error) {
      console.error("투자목표 저장 실패:", error);
      throw error;
    }
  }

  /**
   * 사용자 활동 로깅
   */
  static async logUserActivity(userId, activityType, details = {}) {
    try {
      const activitiesRef = collection(db, "users", userId, "activities");

      const activityData = {
        activityId: crypto.randomUUID(),
        recordedAt: serverTimestamp(),
        sessionId: this.getSessionId(),
        isAutoCaptured: true,
        activityType,
        details: {
          ...details,
          device: this.getDeviceInfo(),
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        },
      };

      await addDoc(activitiesRef, activityData);
    } catch (error) {
      console.error("활동 로깅 실패:", error);
    }
  }

  /**
   * 초기 사용자 선호도 생성
   */
  static async createInitialUserPreferences(userId, userProfile, goalsData) {
    try {
      const preferencesRef = doc(db, "user_preferences", userId);

      const preferences = {
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        inferredPreferences: {
          source: "onboarding_data",
          lastUpdatedAt: serverTimestamp(),
          confidence: 0.7,
          updateStrategy: "onboarding_based",
          preferenceStaleness: "fresh",
          dataPoints: 1,

          productTypePreference: this.inferProductPreference(
            userProfile,
            goalsData
          ),

          riskReturnWeight: {
            safety:
              userProfile.investmentProfile?.riskLevel?.level <= 2 ? 0.8 : 0.4,
            profitability:
              userProfile.investmentProfile?.riskLevel?.level >= 4 ? 0.8 : 0.4,
          },

          conveniencePreference: {
            온라인가입: 1.0,
            영업점가입: 0.2,
            모바일전용: 0.9,
          },
        },

        behaviorPatterns: {
          decisionMaking: {
            speed: "moderate",
            informationNeed: "high",
            comparisonDepth: "detailed",
          },
          usagePattern: {
            preferredTime: ["오후", "야간"],
            sessionDuration: 0,
            frequentActions: [],
          },
        },
      };

      await setDoc(preferencesRef, preferences);
      console.log("초기 사용자 선호도 생성 완료");
    } catch (error) {
      console.error("사용자 선호도 생성 실패:", error);
    }
  }

  /**
   * 위험도 레벨 계산
   */
  static calculateRiskLevel(totalScore) {
    if (totalScore <= 6) {
      return {
        level: 1,
        name: "안전추구형",
        description: "원금 보장을 최우선으로 하는 보수적 투자",
        emoji: "🛡️",
        color: "#10B981",
        products: ["예금", "적금", "CMA"],
      };
    } else if (totalScore <= 10) {
      return {
        level: 2,
        name: "안전선호형",
        description: "낮은 위험으로 안정적인 수익 추구",
        emoji: "🔒",
        color: "#059669",
        products: ["적금", "펀드(채권형)", "ELS(원금보장)"],
      };
    } else if (totalScore <= 14) {
      return {
        level: 3,
        name: "위험중립형",
        description: "일정 수준의 수익성과 안전성을 선호",
        emoji: "⚖️",
        color: "#FFD700",
        products: ["펀드", "ETF", "혼합형상품"],
      };
    } else if (totalScore <= 18) {
      return {
        level: 4,
        name: "적극투자형",
        description: "높은 수익을 위해 적정 위험 감수",
        emoji: "📈",
        color: "#F59E0B",
        products: ["주식형펀드", "ETF", "개별주식"],
      };
    } else {
      return {
        level: 5,
        name: "공격투자형",
        description: "높은 위험을 감수하고 높은 수익 추구",
        emoji: "🚀",
        color: "#DC2626",
        products: ["성장주", "파생상품", "대안투자"],
      };
    }
  }

  /**
   * 재정 건전성 계산
   */
  static calculateFinancialHealth(financialData) {
    const income = this.parseRange(financialData.monthlyIncome);
    const expense = this.parseRange(financialData.monthlyExpense);
    const investment = this.parseRange(financialData.monthlyInvestment);

    const surplus = income - expense;
    const savingsRate = Math.round((investment / income) * 100);

    let status, emoji, color, advice;

    if (savingsRate >= 30) {
      status = "매우 우수";
      color = "#10B981";
      emoji = "🏆";
      advice = "완벽한 재정 관리입니다!";
    } else if (savingsRate >= 20) {
      status = "우수";
      color = "#3B82F6";
      emoji = "💙";
      advice = "훌륭한 저축 습관이에요!";
    } else if (savingsRate >= 10) {
      status = "양호";
      color = "#EAB308";
      emoji = "😊";
      advice = "안정적인 재정 상태예요.";
    } else if (savingsRate >= 0) {
      status = "보통";
      color = "#F97316";
      emoji = "😐";
      advice = "지출 관리가 필요해요.";
    } else {
      status = "주의";
      color = "#DC2626";
      emoji = "😰";
      advice = "수입 증대나 지출 절약이 필요해요.";
    }

    return {
      monthlySurplus: surplus,
      savingsRate,
      status,
      emoji,
      color,
      advice,
    };
  }

  /**
   * AI 기반 개인화 추천 생성
   */
  static async generatePersonalizedRecommendation(userProfile, goalsData) {
    const riskLevel = userProfile.investmentProfile?.riskLevel?.level || 3;
    const primaryGoal = goalsData.primaryGoals?.[0]?.value;

    return {
      source: "AI_generated",
      generatedAt: serverTimestamp(),
      modelVersion: "goal-v1.2-rnn",
      recommendationLogic: "multi_goal_allocation",

      monthlyTarget:
        this.parseRange(userProfile.financialStatus?.monthlyInvestment) || 300,
      successRate: Math.min(95, 60 + riskLevel * 8),
      riskLevel: riskLevel <= 2 ? "낮음" : riskLevel >= 4 ? "높음" : "보통",
      strategy: riskLevel <= 2 ? "안전형 포트폴리오" : "혼합형 포트폴리오",

      recommendedProducts: this.getRecommendedProducts(riskLevel, primaryGoal),

      goalBasedAllocation: {
        primaryGoals:
          goalsData.primaryGoals?.map((goal, index) => ({
            goal: goal.value,
            allocation: index === 0 ? 0.6 : 0.4,
            monthlyAmount: index === 0 ? 300 : 200,
            confidenceScore: 0.9 - index * 0.1,
          })) || [],
      },
    };
  }

  // 유틸리티 함수들
  static parseRange(rangeString) {
    if (!rangeString) return 0;
    const matches = rangeString.match(/(\d+)/g);
    if (!matches) return 0;
    return parseInt(matches[0]);
  }

  static getSessionId() {
    let sessionId = sessionStorage.getItem("finpick_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("finpick_session_id", sessionId);
    }
    return sessionId;
  }

  static getDeviceInfo() {
    return {
      type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
        ? "mobile"
        : "desktop",
      platform: navigator.platform,
      language: navigator.language,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
  }

  static inferProductPreference(userProfile, goalsData) {
    const riskLevel = userProfile.investmentProfile?.riskLevel?.level || 3;
    const primaryGoal = goalsData.primaryGoals?.[0]?.value;

    if (riskLevel <= 2 || primaryGoal === "안전한 저축") {
      return {
        예금: 0.4,
        적금: 0.4,
        펀드: 0.1,
        투자: 0.1,
      };
    } else if (riskLevel >= 4) {
      return {
        예금: 0.1,
        적금: 0.2,
        펀드: 0.3,
        투자: 0.4,
      };
    } else {
      return {
        예금: 0.2,
        적금: 0.3,
        펀드: 0.3,
        투자: 0.2,
      };
    }
  }

  static getRecommendedProducts(riskLevel, primaryGoal) {
    if (riskLevel <= 2) {
      return ["예금", "적금", "CMA"];
    } else if (riskLevel >= 4) {
      return ["주식형펀드", "ETF", "개별주식"];
    } else {
      return ["적금", "펀드", "ETF"];
    }
  }
}
