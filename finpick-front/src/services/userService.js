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
      const userRef = doc(db, "users", userId);

      // 기존 데이터 구조와 호환되도록 변환
      const convertedData = this.convertAnswersToProfile(answers);

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
        "searchableFields.ageGroup": this.extractAgeGroup(answers.age.value),
        "searchableFields.primaryGoal": this.extractGoalType(
          answers.goal.value
        ),
        "searchableFields.investmentAmount": this.extractAmount(
          answers.amount.value
        ),
        "searchableFields.investmentPeriod": this.extractPeriod(
          answers.period.value
        ),
        "searchableFields.riskLevel": this.extractRiskLevel(answers.risk.value),
        "searchableFields.lastUpdated": serverTimestamp(),

        // 온보딩 상태 업데이트
        "onboardingStatus.isCompleted": true,
        "onboardingStatus.currentStep": 5, // 완료
        "onboardingStatus.lastActiveAt": serverTimestamp(),
        "onboardingStatus.completedAt": serverTimestamp(),

        // AI 학습용 데이터
        "aiLearningData.behaviorSignals.riskAppetite":
          this.calculateRiskAppetite(answers.risk.value),
        "aiLearningData.behaviorSignals.digitalAdoption": 0.9, // 새로운 온보딩 사용했으므로 높음

        // 기본 설정
        updatedAt: serverTimestamp(),
      };

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
    return {
      basicInfo: {
        age: answers.age.value,
        ageGroup: this.extractAgeGroup(answers.age.value),
        occupation: "정보 없음", // 새 온보딩에서는 수집하지 않음
        residence: "정보 없음",
        completedAt: serverTimestamp(),
      },

      investmentProfile: {
        riskTolerance: {
          value: answers.risk.value,
          score: this.getRiskScore(answers.risk.value),
        },
        investmentPeriod: {
          value: answers.period.value,
          score: this.getPeriodScore(answers.period.value),
        },
        totalScore: this.calculateTotalScore(answers),
        riskLevel: this.calculateRiskLevel(this.calculateTotalScore(answers)),
        completedAt: serverTimestamp(),
      },

      financialStatus: {
        monthlyIncome: "정보 없음", // 직접 수집하지 않고 amount에서 추정
        estimatedInvestmentCapacity: answers.amount.value,
        completedAt: serverTimestamp(),
      },

      investmentGoals: {
        primaryGoal: answers.goal.value,
        timeframe: answers.period.value,
        targetAmount: answers.amount.value,
        completedAt: serverTimestamp(),
      },
    };
  }

  // 🎯 답변에서 정보 추출하는 헬퍼 메서드들
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
    const goalMap = {
      "안전하게 돈 모으기": "안전저축",
      "목돈 만들기": "목돈마련",
      "투자로 수익내기": "투자수익",
      "돈 빌리기": "대출필요",
    };
    return goalMap[goalValue] || "기타";
  }

  static extractAmount(amountValue) {
    const amountMap = {
      "월 10만원": 100000,
      "월 30만원": 300000,
      "월 50만원": 500000,
      "월 100만원 이상": 1000000,
    };
    return amountMap[amountValue] || 0;
  }

  static extractPeriod(periodValue) {
    const periodMap = {
      "1년 이내": "단기",
      "2-3년": "중기",
      "3-5년": "중장기",
      "5년 이상": "장기",
    };
    return periodMap[periodValue] || "중기";
  }

  static extractRiskLevel(riskValue) {
    const riskMap = {
      "절대 안돼요": 1,
      "조금은 괜찮아요": 3,
      "수익을 위해서라면": 5,
    };
    return riskMap[riskValue] || 2;
  }

  // 📊 점수 계산 메서드들
  static getRiskScore(riskValue) {
    const scoreMap = {
      "절대 안돼요": 1,
      "조금은 괜찮아요": 3,
      "수익을 위해서라면": 5,
    };
    return scoreMap[riskValue] || 2;
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

  static calculateTotalScore(answers) {
    const riskScore = this.getRiskScore(answers.risk.value);
    const periodScore = this.getPeriodScore(answers.period.value);

    // 간단한 총점 계산 (기존 시스템과 호환)
    return riskScore * 4 + periodScore * 2;
  }

  static calculateRiskLevel(totalScore) {
    if (totalScore <= 8) {
      return { level: 1, name: "매우 보수적", description: "안전성 최우선" };
    } else if (totalScore <= 12) {
      return { level: 2, name: "보수적", description: "낮은 위험 선호" };
    } else if (totalScore <= 16) {
      return { level: 3, name: "균형적", description: "적당한 위험 감수" };
    } else if (totalScore <= 20) {
      return { level: 4, name: "적극적", description: "높은 수익 추구" };
    } else {
      return { level: 5, name: "매우 적극적", description: "고위험 고수익" };
    }
  }

  static calculateRiskAppetite(riskValue) {
    const appetiteMap = {
      "절대 안돼요": 0.1,
      "조금은 괜찮아요": 0.5,
      "수익을 위해서라면": 0.9,
    };
    return appetiteMap[riskValue] || 0.3;
  }

  // 🗓️ 기존 4단계 온보딩 메서드들 (하위 호환성)
  static async saveBasicInfo(userId, basicInfoData) {
    try {
      const userRef = doc(db, "users", userId);

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

  // 📈 활동 로그 기록
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

  // 🔧 유틸리티 메서드들
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
