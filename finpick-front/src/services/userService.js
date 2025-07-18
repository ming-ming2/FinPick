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
        totalSteps: 5, // 🔥 4에서 5로 변경 (새로운 온보딩)
        lastActiveAt: serverTimestamp(),
        stepsCompleted: {
          step1: false,
          step2: false,
          step3: false,
          step4: false,
          step5: false, // 🔥 추가
        },
      },

      basicInfo: null,
      investmentProfile: null,
      financialStatus: null,
      investmentGoals: null,
      onboardingAnswers: null, // 🔥 새로운 필드 추가

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
          communicationChannels: ["email", "push"],
        },
      },

      searchableFields: {
        ageGroup: null,
        occupation: null,
        residence: null,
        familyStatus: null,
        riskLevel: null,
        primaryGoal: null,
        incomeRange: null,
        lastUpdated: serverTimestamp(),
      },

      aiLearningData: {
        userSegment: "새로운사용자",
        behaviorSignals: {
          riskAppetite: 0.5,
          priceConsciousness: 0.5,
          digitalAdoption: 0.5,
        },
        lastUpdated: serverTimestamp(),
      },

      behaviorAnalytics: {
        recommendationHistory: [],
        interactionPatterns: {
          clickThrough: { total: 0, rate: 0 },
          sessionDuration: { average: 0, total: 0 },
          returnVisits: { count: 0, lastVisit: null },
        },
        satisfactionData: {
          totalRatings: 0,
          averageRating: 0,
          feedbackHistory: [],
        },
      },

      privacySettings: {
        dataSharing: false,
        marketingEmails: true,
        personalizedAds: false,
        analyticsTracking: true,
      },
    };

    try {
      await setDoc(userRef, initialProfile);
      console.log("✅ 사용자 프로필 생성 완료:", user.uid);
      return initialProfile;
    } catch (error) {
      console.error("❌ 사용자 프로필 생성 실패:", error);
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
        console.log("사용자 프로필을 찾을 수 없음:", userId);
        return null;
      }
    } catch (error) {
      console.error("사용자 프로필 조회 실패:", error);
      throw error;
    }
  }

  // 🔥 새로운 간소화된 온보딩 저장 메서드
  static async saveOnboardingAnswers(userId, answers) {
    try {
      console.log("💾 UserService.saveOnboardingAnswers 시작");
      console.log("📤 받은 데이터:", { userId, answers });

      const userRef = doc(db, "users", userId);

      // 기존 데이터 구조와 호환되도록 변환
      const convertedData = this.convertAnswersToProfile(answers);
      console.log("🔄 변환된 데이터:", convertedData);

      const updateData = {
        // 새로운 간소화된 온보딩 데이터
        onboardingAnswers: {
          ...answers,
          completedAt: serverTimestamp(),
          version: "2.0", // 새로운 버전임을 표시
        },

        // 기존 시스템과 호환성을 위한 데이터 매핑
        basicInfo: convertedData.basicInfo,
        investmentProfile: convertedData.investmentProfile,
        financialStatus: convertedData.financialStatus,
        investmentGoals: convertedData.investmentGoals,

        // 검색 가능한 필드들 업데이트
        "searchableFields.ageGroup": this.extractAgeGroup(answers.age?.value),
        "searchableFields.primaryGoal": this.extractGoalType(
          answers.goal?.value
        ),
        "searchableFields.investmentAmount": this.extractAmount(
          answers.amount?.value
        ),
        "searchableFields.investmentPeriod": this.extractPeriod(
          answers.period?.value
        ),
        "searchableFields.riskLevel": this.extractRiskLevel(
          answers.risk?.value
        ),
        "searchableFields.lastUpdated": serverTimestamp(),

        // 온보딩 상태 업데이트
        "onboardingStatus.isCompleted": true,
        "onboardingStatus.currentStep": 5, // 완료
        "onboardingStatus.lastActiveAt": serverTimestamp(),
        "onboardingStatus.completedAt": serverTimestamp(),

        // AI 학습용 데이터
        "aiLearningData.behaviorSignals.riskAppetite":
          this.calculateRiskAppetite(answers.risk?.value),
        "aiLearningData.behaviorSignals.digitalAdoption": 0.9, // 새로운 온보딩 사용했으므로 높음

        // 기본 설정
        updatedAt: serverTimestamp(),
      };

      console.log("📤 Firebase에 저장할 데이터:", updateData);

      await updateDoc(userRef, updateData);

      // 활동 로그 기록
      await this.logUserActivity(userId, "onboarding_completed_v2", {
        answers: answers,
        version: "2.0",
        completionTime: Date.now(),
      });

      console.log("✅ 새로운 온보딩 데이터 저장 완료:", updateData);
      return updateData;
    } catch (error) {
      console.error("❌ 온보딩 답변 저장 실패:", error);
      throw error;
    }
  }

  // 🔄 새로운 답변을 기존 구조로 변환하는 헬퍼 메서드
  static convertAnswersToProfile(answers) {
    console.log("🔄 답변 변환 시작:", answers);

    if (!answers || Object.keys(answers).length === 0) {
      console.warn("⚠️ 변환할 답변이 없습니다.");
      return {
        basicInfo: null,
        investmentProfile: null,
        financialStatus: null,
        investmentGoals: null,
      };
    }

    // basicInfo 생성
    const basicInfo = {
      age: answers.age?.value || "정보없음",
      ageGroup: this.extractAgeGroup(answers.age?.value),
      occupation: "온라인 사용자", // 새 온보딩에서는 수집하지 않음
      residence: "대한민국", // 새 온보딩에서는 수집하지 않음
      primaryGoal: answers.goal?.value || "정보없음",
      completedAt: new Date().toISOString(),
      version: "2.0_converted",
    };

    // investmentProfile 생성
    const riskScore = this.getRiskScore(answers.risk?.value);
    const periodScore = this.getPeriodScore(answers.period?.value);
    const totalScore = riskScore * 4 + periodScore * 2;

    const investmentProfile = {
      riskTolerance: {
        value: answers.risk?.value || "정보없음",
        score: riskScore,
      },
      investmentPeriod: {
        value: answers.period?.value || "정보없음",
        score: periodScore,
      },
      totalScore: totalScore,
      riskLevel: this.calculateRiskLevel(totalScore),
      completedAt: new Date().toISOString(),
      version: "2.0_converted",
    };

    // financialStatus 생성 (간소화된 버전)
    const financialStatus = {
      monthlyInvestmentAmount: answers.amount?.value || "정보없음",
      investmentCapacity: this.extractAmount(answers.amount?.value),
      completedAt: new Date().toISOString(),
      version: "2.0_converted",
    };

    // investmentGoals 생성
    const investmentGoals = [
      {
        goalType: this.extractGoalType(answers.goal?.value),
        targetAmount: this.getTargetAmountFromPeriodAndAmount(
          answers.period?.value,
          answers.amount?.value
        ),
        timeframe: answers.period?.value || "정보없음",
        priority: 1,
        description: `${answers.goal?.value} - ${answers.period?.value}에 ${answers.amount?.value}`,
        completedAt: new Date().toISOString(),
      },
    ];

    const result = {
      basicInfo,
      investmentProfile,
      financialStatus,
      investmentGoals,
    };

    console.log("✅ 답변 변환 완료:", result);
    return result;
  }

  // 🎯 헬퍼 메서드들
  static extractAgeGroup(ageValue) {
    const ageMap = {
      "20대": "20대",
      "30대": "30대",
      "40대": "40대",
      "50대 이상": "50대이상",
    };
    return ageMap[ageValue] || "기타";
  }

  static extractGoalType(goalValue) {
    if (!goalValue) return "기타";

    if (goalValue.includes("안전하게")) return "안전저축";
    if (goalValue.includes("목돈")) return "목표달성";
    if (goalValue.includes("투자")) return "투자수익";
    if (goalValue.includes("빌리기")) return "대출";
    return "기타";
  }

  static extractAmount(amountValue) {
    if (!amountValue) return 0;

    const amountMap = {
      "월 10만원": 100000,
      "월 30만원": 300000,
      "월 50만원": 500000,
      "월 100만원 이상": 1000000,
    };
    return amountMap[amountValue] || 0;
  }

  static extractPeriod(periodValue) {
    if (!periodValue) return "기타";

    const periodMap = {
      "1년 이내": "단기",
      "2-3년": "중기",
      "3-5년": "장기",
      "5년 이상": "초장기",
    };
    return periodMap[periodValue] || "기타";
  }

  static extractRiskLevel(riskValue) {
    if (!riskValue) return "보통";

    const riskMap = {
      "절대 안돼요": "안전",
      "조금은 괜찮아요": "보통",
      "수익을 위해서라면": "적극",
    };
    return riskMap[riskValue] || "보통";
  }

  static getRiskScore(riskValue) {
    const scoreMap = {
      "절대 안돼요": 1,
      "조금은 괜찮아요": 3,
      "수익을 위해서라면": 5,
    };
    return scoreMap[riskValue] || 3;
  }

  static getPeriodScore(periodValue) {
    const scoreMap = {
      "1년 이내": 1,
      "2-3년": 2,
      "3-5년": 3,
      "5년 이상": 4,
    };
    return scoreMap[periodValue] || 2;
  }

  static calculateRiskLevel(totalScore) {
    if (totalScore <= 8) return "안전";
    if (totalScore <= 12) return "보통";
    if (totalScore <= 16) return "적극";
    return "공격";
  }

  static calculateRiskAppetite(riskValue) {
    const appetiteMap = {
      "절대 안돼요": 0.2,
      "조금은 괜찮아요": 0.5,
      "수익을 위해서라면": 0.8,
    };
    return appetiteMap[riskValue] || 0.5;
  }

  static getTargetAmountFromPeriodAndAmount(periodValue, amountValue) {
    const monthlyAmount = this.extractAmount(amountValue);
    const months = this.getMonthsFromPeriod(periodValue);
    return monthlyAmount * months;
  }

  static getMonthsFromPeriod(periodValue) {
    const monthsMap = {
      "1년 이내": 12,
      "2-3년": 30,
      "3-5년": 48,
      "5년 이상": 60,
    };
    return monthsMap[periodValue] || 36;
  }

  // 🔥 활동 로그 기록 메서드
  static async logUserActivity(userId, activityType, metadata = {}) {
    try {
      const activityRef = collection(db, "userActivities");
      await addDoc(activityRef, {
        userId: userId,
        activityType: activityType,
        metadata: metadata,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      console.log("✅ 활동 로그 기록 완료:", activityType);
    } catch (error) {
      console.error("❌ 활동 로그 기록 실패:", error);
      // 로그 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  // 🔥 기타 필요한 메서드들
  static async saveBasicInfo(userId, basicInfoData) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        basicInfo: basicInfoData,
        "onboardingStatus.stepsCompleted.step1": true,
        "onboardingStatus.currentStep": Math.max(
          2,
          await this.getCurrentStep(userId)
        ),
        updatedAt: serverTimestamp(),
      });
      console.log("✅ 기본 정보 저장 완료");
    } catch (error) {
      console.error("❌ 기본 정보 저장 실패:", error);
      throw error;
    }
  }

  static async saveInvestmentProfile(userId, investmentProfileData) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        investmentProfile: investmentProfileData,
        "onboardingStatus.stepsCompleted.step2": true,
        "onboardingStatus.currentStep": Math.max(
          3,
          await this.getCurrentStep(userId)
        ),
        updatedAt: serverTimestamp(),
      });
      console.log("✅ 투자 프로필 저장 완료");
    } catch (error) {
      console.error("❌ 투자 프로필 저장 실패:", error);
      throw error;
    }
  }

  static async saveFinancialStatus(userId, financialData) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        financialStatus: financialData,
        "onboardingStatus.stepsCompleted.step3": true,
        "onboardingStatus.currentStep": Math.max(
          4,
          await this.getCurrentStep(userId)
        ),
        updatedAt: serverTimestamp(),
      });
      console.log("✅ 재무 상태 저장 완료");
    } catch (error) {
      console.error("❌ 재무 상태 저장 실패:", error);
      throw error;
    }
  }

  static async saveInvestmentGoals(userId, goalsData) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        investmentGoals: goalsData,
        "onboardingStatus.stepsCompleted.step4": true,
        "onboardingStatus.currentStep": Math.max(
          5,
          await this.getCurrentStep(userId)
        ),
        "onboardingStatus.isCompleted": true,
        "onboardingStatus.completedAt": serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("✅ 투자 목표 저장 완료");
    } catch (error) {
      console.error("❌ 투자 목표 저장 실패:", error);
      throw error;
    }
  }

  static async getCurrentStep(userId) {
    try {
      const userProfile = await this.getUserProfile(userId);
      return userProfile?.onboardingStatus?.currentStep || 1;
    } catch (error) {
      console.error("❌ 현재 단계 조회 실패:", error);
      return 1;
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
      const interactionRef = collection(db, "userInteractions");
      await addDoc(interactionRef, {
        userId: userId,
        recommendationId: recommendationId,
        products: products,
        action: action,
        metadata: metadata,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      console.log("✅ 상호작용 기록 완료");
    } catch (error) {
      console.error("❌ 상호작용 기록 실패:", error);
      throw error;
    }
  }
}
