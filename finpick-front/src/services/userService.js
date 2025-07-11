//finpick-front/src/services/userService.js
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

export class UserService {
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
      dataVersion: "2.0",
      schemaVersion: "2025.1",
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

      preferences: {
        inferredPreferences: {
          source: "default",
          lastUpdatedAt: serverTimestamp(),
          confidence: 0.5,
          updateStrategy: "behavioral_learning",
          productTypePreference: {
            deposit: 0.6,
            savings: 0.7,
            loan: 0.3,
            investment: 0.4,
          },
          riskReturnWeight: {
            safety: 0.7,
            profitability: 0.4,
            liquidity: 0.5,
          },
          conveniencePreference: {
            온라인가입: 1.0,
            영업점가입: 0.3,
            모바일전용: 0.9,
          },
        },
        explicitPreferences: {
          bankPreferences: [],
          productCategories: [],
          communicationChannels: [],
          notificationSettings: {
            newProducts: true,
            rateChanges: true,
            goalReminders: true,
          },
        },
      },

      behaviorAnalytics: {
        recommendationHistory: [],
        interactionPatterns: {
          totalSessions: 0,
          avgSessionDuration: 0,
          lastActiveAt: serverTimestamp(),
          frequentActions: [],
          searchPatterns: [],
          clickThrough: {
            totalRecommendations: 0,
            totalClicks: 0,
            rate: 0,
          },
        },
        satisfactionData: {
          averageRating: 0,
          totalRatings: 0,
          feedbackHistory: [],
        },
      },

      searchableFields: {
        ageGroup: null,
        incomeRange: {
          min: 0,
          max: 0,
          category: null,
        },
        riskLevel: 3,
        primaryGoal: null,
        occupation: null,
        residence: null,
        familyStatus: null,
        lastUpdated: serverTimestamp(),
      },

      aiLearningData: {
        userSegment: null,
        personalityVector: [],
        behaviorSignals: {
          riskAppetite: 0.5,
          pricesensitivity: 0.5,
          brandLoyalty: 0.5,
          digitalAdoption: 0.5,
        },
        predictionModels: {
          nextBestAction: null,
          churnRisk: 0.1,
          lifetimeValue: 0,
          goalAchievementProbability: 0.7,
        },
      },
    };

    try {
      await setDoc(userRef, initialProfile);
      return initialProfile;
    } catch (error) {
      console.error("사용자 프로필 생성 실패:", error);
      throw error;
    }
  }

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

  static async saveBasicInfo(userId, basicInfoData) {
    try {
      const userRef = doc(db, "users", userId);

      const normalizedData = this.normalizeBasicInfo(basicInfoData);

      const updateData = {
        basicInfo: {
          ...basicInfoData,
          completedAt: serverTimestamp(),
        },
        "searchableFields.ageGroup": this.getAgeGroup(basicInfoData.age),
        "searchableFields.occupation": basicInfoData.occupation,
        "searchableFields.residence": basicInfoData.residence,
        "searchableFields.familyStatus": basicInfoData.maritalStatus,
        "searchableFields.lastUpdated": serverTimestamp(),
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

      return updateData;
    } catch (error) {
      console.error("기본정보 저장 실패:", error);
      throw error;
    }
  }

  static async saveInvestmentProfile(userId, investmentProfileData) {
    try {
      const userRef = doc(db, "users", userId);

      const riskLevel = this.calculateRiskLevel(
        investmentProfileData.totalScore
      );

      const updateData = {
        investmentProfile: {
          ...investmentProfileData,
          riskLevel,
          completedAt: serverTimestamp(),
        },
        "searchableFields.riskLevel": riskLevel.level,
        "searchableFields.lastUpdated": serverTimestamp(),
        "aiLearningData.behaviorSignals.riskAppetite": riskLevel.level / 5,
        "preferences.inferredPreferences.riskReturnWeight.safety":
          riskLevel.level <= 2 ? 0.8 : 0.4,
        "preferences.inferredPreferences.riskReturnWeight.profitability":
          riskLevel.level >= 4 ? 0.8 : 0.4,
        "onboardingStatus.stepsCompleted.step2": true,
        "onboardingStatus.currentStep": 3,
        "onboardingStatus.lastActiveAt": serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);
      await this.logUserActivity(userId, "onboarding_step2_completed", {
        riskLevel: riskLevel.level,
        totalScore: investmentProfileData.totalScore,
      });

      return updateData;
    } catch (error) {
      console.error("투자성향 저장 실패:", error);
      throw error;
    }
  }

  static async saveFinancialStatus(userId, financialData) {
    try {
      const userRef = doc(db, "users", userId);

      const financialHealth = this.calculateFinancialHealth(financialData);
      const incomeRange = this.parseIncomeRange(financialData.monthlyIncome);

      const updateData = {
        financialStatus: {
          ...financialData,
          financialHealth,
          completedAt: serverTimestamp(),
        },
        "searchableFields.incomeRange": incomeRange,
        "searchableFields.lastUpdated": serverTimestamp(),
        "aiLearningData.behaviorSignals.pricesensitivity":
          this.calculatePriceSensitivity(financialData),
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

      return updateData;
    } catch (error) {
      console.error("재무상황 저장 실패:", error);
      throw error;
    }
  }

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
        "searchableFields.primaryGoal": goalsData.primaryGoals?.[0]?.value,
        "searchableFields.lastUpdated": serverTimestamp(),
        "aiLearningData.userSegment": this.calculateUserSegment(
          userProfile,
          goalsData
        ),
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

      return updateData;
    } catch (error) {
      console.error("투자목표 저장 실패:", error);
      throw error;
    }
  }

  static async recordRecommendationInteraction(
    userId,
    recommendationId,
    products,
    action,
    metadata = {}
  ) {
    try {
      const userRef = doc(db, "users", userId);
      const userProfile = await this.getUserProfile(userId);

      const interaction = {
        id: crypto.randomUUID(),
        timestamp: serverTimestamp(),
        recommendationId,
        products: products.map((p) => ({
          productId: p.id,
          productType: p.type,
          bank: p.bank,
          interestRate: p.rate,
        })),
        action, // 'view', 'click', 'save', 'ignore', 'convert'
        metadata,
        sessionId: this.getSessionId(),
      };

      const currentHistory =
        userProfile.behaviorAnalytics?.recommendationHistory || [];
      const updatedHistory = [...currentHistory, interaction].slice(-100); // 최근 100개만 유지

      const clickThroughData = this.calculateClickThroughRate(updatedHistory);

      const updateData = {
        "behaviorAnalytics.recommendationHistory": updatedHistory,
        "behaviorAnalytics.interactionPatterns.clickThrough": clickThroughData,
        "behaviorAnalytics.interactionPatterns.lastActiveAt": serverTimestamp(),
        "aiLearningData.behaviorSignals.digitalAdoption": Math.min(
          1.0,
          userProfile.aiLearningData?.behaviorSignals?.digitalAdoption + 0.01
        ),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);
      await this.updateUserSegment(userId);

      return interaction;
    } catch (error) {
      console.error("추천 상호작용 기록 실패:", error);
      throw error;
    }
  }

  static async recordSatisfactionFeedback(
    userId,
    recommendationId,
    rating,
    feedback = ""
  ) {
    try {
      const userRef = doc(db, "users", userId);
      const userProfile = await this.getUserProfile(userId);

      const feedbackEntry = {
        id: crypto.randomUUID(),
        timestamp: serverTimestamp(),
        recommendationId,
        rating, // 1-5
        feedback,
        sessionId: this.getSessionId(),
      };

      const currentFeedback =
        userProfile.behaviorAnalytics?.satisfactionData?.feedbackHistory || [];
      const updatedFeedback = [...currentFeedback, feedbackEntry].slice(-50);

      const newAverageRating = this.calculateAverageRating(updatedFeedback);

      const updateData = {
        "behaviorAnalytics.satisfactionData.feedbackHistory": updatedFeedback,
        "behaviorAnalytics.satisfactionData.averageRating": newAverageRating,
        "behaviorAnalytics.satisfactionData.totalRatings":
          updatedFeedback.length,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);
      await this.updateUserSegment(userId);

      return feedbackEntry;
    } catch (error) {
      console.error("만족도 피드백 기록 실패:", error);
      throw error;
    }
  }

  static async findSimilarUsers(userId, limit = 10) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const searchFields = userProfile.searchableFields;

      const similarUsersQuery = query(
        collection(db, "users"),
        where("searchableFields.ageGroup", "==", searchFields.ageGroup),
        where("searchableFields.riskLevel", "==", searchFields.riskLevel),
        where("onboardingStatus.isCompleted", "==", true),
        orderBy("behaviorAnalytics.satisfactionData.averageRating", "desc"),
        limit(limit)
      );

      const snapshot = await getDocs(similarUsersQuery);
      return snapshot.docs
        .map((doc) => doc.data())
        .filter((user) => user.userId !== userId);
    } catch (error) {
      console.error("유사 사용자 검색 실패:", error);
      return [];
    }
  }

  static async generatePersonalizedRecommendation(userProfile, goalsData) {
    const riskLevel = userProfile.investmentProfile?.riskLevel?.level || 3;
    const primaryGoal = goalsData.primaryGoals?.[0]?.value;
    const behaviorSignals = userProfile.aiLearningData?.behaviorSignals || {};

    return {
      source: "AI_generated_v2",
      generatedAt: serverTimestamp(),
      modelVersion: "collaborative-filtering-v2.1",
      recommendationLogic: "hybrid_collaborative_content",

      userSegment: this.calculateUserSegment(userProfile, goalsData),
      personalityScore: {
        conservatism: behaviorSignals.riskAppetite || 0.5,
        digitalSavvy: behaviorSignals.digitalAdoption || 0.5,
        priceConsciousness: behaviorSignals.pricesensitivity || 0.5,
      },

      monthlyTarget:
        this.parseRange(userProfile.financialStatus?.monthlyInvestment) || 300,
      successRate: Math.min(95, 60 + riskLevel * 8),
      confidenceScore: this.calculateConfidenceScore(userProfile),

      strategy: this.getRecommendationStrategy(
        riskLevel,
        primaryGoal,
        behaviorSignals
      ),
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

  static normalizeBasicInfo(basicInfoData) {
    return {
      ageGroup: this.getAgeGroup(basicInfoData.age),
      incomeRange: this.parseIncomeRange(basicInfoData.monthlyIncome),
      occupation: basicInfoData.occupation,
      residence: basicInfoData.residence,
      familyStatus: basicInfoData.maritalStatus,
    };
  }

  static getAgeGroup(age) {
    if (age < 25) return "20대 초반";
    if (age < 30) return "20대 후반";
    if (age < 35) return "30대 초반";
    if (age < 40) return "30대 후반";
    if (age < 45) return "40대 초반";
    if (age < 50) return "40대 후반";
    if (age < 60) return "50대";
    return "60대 이상";
  }

  static parseIncomeRange(incomeString) {
    if (!incomeString) return { min: 0, max: 0, category: "미입력" };

    const matches = incomeString.match(/(\d+)/g);
    if (!matches) return { min: 0, max: 0, category: "기타" };

    const min = parseInt(matches[0]) * 10000;
    const max = matches[1] ? parseInt(matches[1]) * 10000 : min + 1000000;

    let category;
    if (min < 2500000) category = "저소득";
    else if (min < 5000000) category = "중소득";
    else if (min < 8000000) category = "중고소득";
    else category = "고소득";

    return { min, max, category };
  }

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

  static calculateUserSegment(userProfile, goalsData) {
    const age = userProfile.basicInfo?.age || 30;
    const riskLevel = userProfile.investmentProfile?.riskLevel?.level || 3;
    const income =
      userProfile.searchableFields?.incomeRange?.category || "중소득";
    const goal = goalsData.primaryGoals?.[0]?.value || "안정적 저축";

    let segment = "";

    if (age < 30) segment += "young_";
    else if (age < 45) segment += "middle_";
    else segment += "mature_";

    if (income === "고소득") segment += "affluent_";
    else if (income === "중고소득") segment += "upper_middle_";
    else segment += "middle_";

    if (riskLevel <= 2) segment += "conservative";
    else if (riskLevel >= 4) segment += "aggressive";
    else segment += "balanced";

    return segment;
  }

  static calculatePriceSensitivity(financialData) {
    const income = this.parseRange(financialData.monthlyIncome);
    const investment = this.parseRange(financialData.monthlyInvestment);

    const investmentRatio = investment / income;

    if (investmentRatio > 0.3) return 0.3; // 낮은 가격 민감도
    if (investmentRatio > 0.2) return 0.5; // 보통 가격 민감도
    return 0.8; // 높은 가격 민감도
  }

  static calculateClickThroughRate(history) {
    const totalRecommendations = history.filter(
      (h) => h.action === "view"
    ).length;
    const totalClicks = history.filter((h) =>
      ["click", "save", "convert"].includes(h.action)
    ).length;

    return {
      totalRecommendations,
      totalClicks,
      rate: totalRecommendations > 0 ? totalClicks / totalRecommendations : 0,
    };
  }

  static calculateAverageRating(feedbackHistory) {
    if (feedbackHistory.length === 0) return 0;

    const sum = feedbackHistory.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );
    return Math.round((sum / feedbackHistory.length) * 100) / 100;
  }

  static calculateConfidenceScore(userProfile) {
    let score = 0.5; // 기본 점수

    if (userProfile.onboardingStatus?.isCompleted) score += 0.2;
    if (userProfile.behaviorAnalytics?.recommendationHistory?.length > 5)
      score += 0.1;
    if (userProfile.behaviorAnalytics?.satisfactionData?.averageRating > 3)
      score += 0.1;
    if (
      userProfile.behaviorAnalytics?.interactionPatterns?.clickThrough?.rate >
      0.2
    )
      score += 0.1;

    return Math.min(1.0, score);
  }

  static getRecommendationStrategy(riskLevel, primaryGoal, behaviorSignals) {
    if (riskLevel <= 2) return "보수적 안전 중심 포트폴리오";
    if (riskLevel >= 4) return "적극적 성장 중심 포트폴리오";
    return "균형잡힌 혼합형 포트폴리오";
  }

  static getRecommendedProducts(riskLevel, primaryGoal) {
    const productMap = {
      1: ["정기예금", "적금", "CMA"],
      2: ["적금", "채권형펀드", "원금보장ELS"],
      3: ["혼합형펀드", "ETF", "적금"],
      4: ["주식형펀드", "ETF", "개별주식"],
      5: ["성장주펀드", "파생상품", "대안투자"],
    };

    return productMap[riskLevel] || productMap[3];
  }

  static async updateUserSegment(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      const newSegment = this.calculateUserSegment(
        userProfile,
        userProfile.investmentGoals
      );

      await updateDoc(doc(db, "users", userId), {
        "aiLearningData.userSegment": newSegment,
        "aiLearningData.lastUpdated": serverTimestamp(),
      });
    } catch (error) {
      console.error("사용자 세그먼트 업데이트 실패:", error);
    }
  }

  static parseRange(rangeString) {
    if (!rangeString) return 0;
    const matches = rangeString.match(/(\d+)/g);
    if (!matches) return 0;
    return parseInt(matches[0]) * 10000;
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
}
