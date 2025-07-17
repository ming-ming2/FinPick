// finpick-front/src/services/backendApi.js

import { auth, db } from "../firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const makeRequest = async (url, options = {}) => {
  try {
    const user = auth.currentUser;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (user) {
      const token = await user.getIdToken(true);
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    console.log(`🔗 API 요청: ${url}`);
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401 && user) {
        console.log("🔄 토큰 만료, 새 토큰으로 재시도");
        const newToken = await user.getIdToken(true);
        headers.Authorization = `Bearer ${newToken}`;

        const retryConfig = {
          ...options,
          headers,
        };

        const retryResponse = await fetch(url, retryConfig);

        if (!retryResponse.ok) {
          throw new Error(
            `HTTP ${retryResponse.status}: ${retryResponse.statusText}`
          );
        }

        const retryData = await retryResponse.json();
        console.log(`✅ API 재시도 성공: ${url}`);
        return retryData;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API 응답 성공: ${url}`);
    return data;
  } catch (error) {
    console.error(`❌ API 요청 실패: ${url}`, error);
    throw error;
  }
};

export const RecommendationAPI = {
  getNaturalLanguageRecommendations: async (query, userProfile = null) => {
    return await makeRequest(
      `${API_BASE_URL}/recommendations/natural-language`,
      {
        method: "POST",
        body: JSON.stringify({
          query,
          user_profile: userProfile,
          filters: {},
          limit: 5,
        }),
      }
    );
  },

  submitFeedback: async (recommendationId, rating, feedback) => {
    return await makeRequest(`${API_BASE_URL}/recommendations/feedback`, {
      method: "POST",
      body: JSON.stringify({
        recommendationId,
        rating,
        feedback,
      }),
    });
  },

  getUserInsights: async () => {
    return await makeRequest(`${API_BASE_URL}/recommendations/user-insights`);
  },

  getRecommendationHistory: async (limit = 10) => {
    return await makeRequest(
      `${API_BASE_URL}/recommendations/history?limit=${limit}`
    );
  },
};

export const ProductAPI = {
  getAllProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await makeRequest(`${API_BASE_URL}/products?${params}`);
  },

  getProductDetail: async (productId) => {
    return await makeRequest(`${API_BASE_URL}/products/${productId}`);
  },
};

export const AuthAPI = {
  verifyToken: async (token) => {
    return await makeRequest(`${API_BASE_URL}/auth/verify-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getUserProfile: async () => {
    return await makeRequest(`${API_BASE_URL}/auth/profile`);
  },
};

export const HealthAPI = {
  checkStatus: async () => {
    return await makeRequest(`${API_BASE_URL}/status`);
  },

  healthCheck: async () => {
    return await makeRequest(`${API_BASE_URL}/../health`);
  },
};

export class SmartRecommendationService {
  static async getPersonalizedRecommendations(query, userProfile = null) {
    try {
      console.log("🎯 개인화 추천 요청:", { query, userProfile });

      const storedUserProfile =
        userProfile || (await this.getComprehensiveUserProfile());

      const requestBody = {
        query: query,
        user_profile: storedUserProfile,
        filters: {},
        limit: 5,
      };

      console.log("📤 전송할 요청 데이터:", requestBody);

      const response = await makeRequest(
        `${API_BASE_URL}/recommendations/natural-language`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      if (response.is_financial_related === false) {
        return {
          success: false,
          is_financial_related: false,
          message: response.message || "관련 없는 질문입니다.",
          confidence: response.confidence || 0,
          reason: response.reason || "",
          data: [],
        };
      }

      if (response.success) {
        console.log("✅ 개인화 추천 성공:", response.data);

        if (storedUserProfile?.userId) {
          await this.saveRecommendationToFirestore(
            storedUserProfile.userId,
            query,
            response.data
          );
        }

        return {
          success: true,
          data: response.data,
          personalized: true,
          personalization_level: response.personalization_level,
          user_insights: response.user_insights,
          recommendation_reasoning: response.recommendation_reasoning,
          ai_metadata: response.ai_metadata,
        };
      } else {
        throw new Error(response.error || "추천 생성 실패");
      }
    } catch (error) {
      console.error("❌ 개인화 추천 실패:", error);
      return await this.getFallbackRecommendations(query);
    }
  }

  // 🔥 업데이트된 종합 사용자 프로필 메서드
  static async getComprehensiveUserProfile() {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("❌ 로그인된 사용자 없음");
        return null;
      }

      const userId = currentUser.uid;

      // 🔥 Firebase에서 사용자 프로필 가져오기 (우선순위 1)
      const firestoreProfile = await this.getUserProfileFromFirestore(userId);

      // 🔥 새로운 온보딩 데이터 확인
      if (firestoreProfile?.onboardingAnswers) {
        console.log(
          "✅ 새로운 온보딩 데이터 발견:",
          firestoreProfile.onboardingAnswers
        );

        // 새로운 온보딩 형식으로 프로필 구성
        const comprehensiveProfile = {
          userId: userId,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,

          // 🔥 새로운 온보딩 데이터 우선 사용
          ...firestoreProfile,

          // 🔥 백엔드 호환성을 위한 매핑
          basicInfo:
            firestoreProfile.basicInfo ||
            this.mapOnboardingToBasicInfo(firestoreProfile.onboardingAnswers),
          investmentProfile:
            firestoreProfile.investmentProfile ||
            this.mapOnboardingToInvestmentProfile(
              firestoreProfile.onboardingAnswers
            ),

          dataSource: {
            type: "new_onboarding",
            firestore: true,
            localStorage: false,
            version: "2.0",
            timestamp: new Date().toISOString(),
          },
        };

        console.log("🔥 새로운 온보딩 기반 종합 프로필:", comprehensiveProfile);
        return comprehensiveProfile;
      }

      // 🔄 기존 온보딩 데이터가 있는 경우 (하위 호환성)
      if (firestoreProfile?.basicInfo || firestoreProfile?.investmentProfile) {
        console.log("✅ 기존 온보딩 데이터 발견");

        const comprehensiveProfile = {
          userId: userId,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          ...firestoreProfile,

          dataSource: {
            type: "legacy_onboarding",
            firestore: true,
            localStorage: false,
            version: "1.0",
            timestamp: new Date().toISOString(),
          },
        };

        console.log("🔄 기존 온보딩 기반 종합 프로필:", comprehensiveProfile);
        return comprehensiveProfile;
      }

      // 💾 로컬스토리지 폴백 (기존 로직)
      const localProfile = this.getUserProfileFromStorage();
      if (localProfile && Object.keys(localProfile).length > 0) {
        console.log("📱 로컬스토리지 데이터 사용");

        const comprehensiveProfile = {
          userId: userId,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          ...localProfile,

          dataSource: {
            type: "localStorage_fallback",
            firestore: false,
            localStorage: true,
            version: "0.9",
            timestamp: new Date().toISOString(),
          },
        };

        // 로컬 데이터를 Firebase에 저장
        await this.saveUserProfileToFirestore(userId, comprehensiveProfile);

        console.log("💾 로컬스토리지 기반 종합 프로필:", comprehensiveProfile);
        return comprehensiveProfile;
      }

      // ⚠️ 프로필이 전혀 없는 경우
      console.log("⚠️ 사용자 프로필이 없음 - 온보딩 필요");
      return {
        userId: userId,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        needsOnboarding: true,
        dataSource: {
          type: "empty_profile",
          firestore: false,
          localStorage: false,
          version: "0.0",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("❌ 종합 사용자 프로필 수집 실패:", error);
      return null;
    }
  }

  // 🔄 새로운 온보딩 답변을 기존 basicInfo 형식으로 매핑
  static mapOnboardingToBasicInfo(onboardingAnswers) {
    if (!onboardingAnswers) return null;

    return {
      age: onboardingAnswers.age?.value || "정보없음",
      ageGroup: this.extractAgeGroup(onboardingAnswers.age?.value),
      occupation: "정보없음", // 새 온보딩에서는 수집하지 않음
      residence: "정보없음", // 새 온보딩에서는 수집하지 않음
      primaryGoal: onboardingAnswers.goal?.value || "정보없음",
      investmentAmount: onboardingAnswers.amount?.value || "정보없음",
      timeframe: onboardingAnswers.period?.value || "정보없음",
      completedAt: onboardingAnswers.completedAt,
      version: "2.0_mapped",
    };
  }

  // 🔄 새로운 온보딩 답변을 기존 investmentProfile 형식으로 매핑
  static mapOnboardingToInvestmentProfile(onboardingAnswers) {
    if (!onboardingAnswers) return null;

    const riskScore = this.getRiskScore(onboardingAnswers.risk?.value);
    const periodScore = this.getPeriodScore(onboardingAnswers.period?.value);
    const totalScore = riskScore * 4 + periodScore * 2;

    return {
      riskTolerance: {
        value: onboardingAnswers.risk?.value || "정보없음",
        score: riskScore,
      },
      investmentPeriod: {
        value: onboardingAnswers.period?.value || "정보없음",
        score: periodScore,
      },
      totalScore: totalScore,
      riskLevel: this.calculateRiskLevel(totalScore),
      completedAt: onboardingAnswers.completedAt,
      version: "2.0_mapped",
    };
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

  static async getUserProfileFromFirestore(userId) {
    try {
      console.log("📊 Firestore에서 사용자 정보 조회:", userId);

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log("✅ Firestore 사용자 데이터:", userData);
        return userData;
      } else {
        console.log("❌ 사용자 데이터가 Firestore에 없음");
        return null;
      }
    } catch (error) {
      console.error("❌ Firestore 사용자 정보 조회 실패:", error);
      return null;
    }
  }

  static async saveUserProfileToFirestore(userId, profileData) {
    try {
      console.log("💾 Firestore에 사용자 정보 저장:", { userId, profileData });

      const userRef = doc(db, "users", userId);
      const enrichedData = {
        ...profileData,
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };

      await setDoc(userRef, enrichedData, { merge: true });
      console.log("✅ Firestore 저장 완료");

      return enrichedData;
    } catch (error) {
      console.error("❌ Firestore 저장 실패:", error);
      throw error;
    }
  }

  static async saveRecommendationToFirestore(userId, query, recommendations) {
    try {
      const userRef = doc(db, "users", userId);
      const currentTime = new Date().toISOString();

      const recommendationData = {
        timestamp: currentTime,
        query: query,
        recommendations: recommendations,
        sessionId: this.getSessionId(),
      };

      const currentProfile = await this.getUserProfileFromFirestore(userId);
      const existingHistory = currentProfile?.recommendationHistory || [];
      const updatedHistory = [recommendationData, ...existingHistory].slice(
        0,
        50
      );

      await updateDoc(userRef, {
        recommendationHistory: updatedHistory,
        lastRecommendationRequest: recommendationData,
        "behaviorAnalytics.totalRecommendationRequests":
          (currentProfile?.behaviorAnalytics?.totalRecommendationRequests ||
            0) + 1,
        updatedAt: serverTimestamp(),
      });

      console.log("✅ 추천 기록 Firestore 저장 완료");
    } catch (error) {
      console.error("❌ 추천 기록 저장 실패:", error);
    }
  }

  static getUserProfileFromStorage() {
    try {
      const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
      const basicInfo = JSON.parse(
        localStorage.getItem("onboarding_step1") || "{}"
      );
      const investmentPersonality = JSON.parse(
        localStorage.getItem("onboarding_step2") || "{}"
      );
      const financialStatus = JSON.parse(
        localStorage.getItem("onboarding_step3") || "{}"
      );
      const goals = JSON.parse(
        localStorage.getItem("onboarding_step4") || "[]"
      );

      if (Object.keys(basicInfo).length === 0) {
        return null;
      }

      const userProfile = {
        userId: authUser.uid,
        email: authUser.email,
        basicInfo: basicInfo,
        investmentPersonality: investmentPersonality,
        financialStatus: financialStatus,
        goals: goals,
        completedOnboarding: this.checkOnboardingComplete(
          basicInfo,
          investmentPersonality,
          financialStatus,
          goals
        ),
      };

      console.log("📋 수집된 사용자 프로필:", userProfile);
      return userProfile;
    } catch (error) {
      console.error("❌ 사용자 정보 가져오기 실패:", error);
      return null;
    }
  }

  static checkOnboardingComplete(basic, investment, financial, goals) {
    return !!(
      basic &&
      Object.keys(basic).length > 0 &&
      investment &&
      Object.keys(investment).length > 0 &&
      financial &&
      Object.keys(financial).length > 0 &&
      goals &&
      goals.length > 0
    );
  }

  static async getFallbackRecommendations(query) {
    try {
      console.log("🔄 일반 추천으로 폴백:", query);

      const response = await makeRequest(
        `${API_BASE_URL}/recommendations/natural-language`,
        {
          method: "POST",
          body: JSON.stringify({
            query,
            user_profile: null,
            limit: 5,
          }),
        }
      );

      return {
        success: true,
        data: response.data || [],
        personalized: false,
        fallback: true,
      };
    } catch (error) {
      console.error("❌ 폴백 추천도 실패:", error);
      return {
        success: false,
        data: [],
        error: "추천을 가져올 수 없습니다.",
      };
    }
  }

  static getSessionId() {
    let sessionId = sessionStorage.getItem("recommendationSessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("recommendationSessionId", sessionId);
    }
    return sessionId;
  }

  static async getBehaviorAnalytics(userId) {
    try {
      const userProfile = await this.getUserProfileFromFirestore(userId);
      return (
        userProfile?.behaviorAnalytics || {
          totalRecommendationRequests: 0,
          averageSatisfactionRating: 0,
          preferredProductTypes: {},
          lastActivity: null,
        }
      );
    } catch (error) {
      console.error("❌ 행동 분석 데이터 조회 실패:", error);
      return {};
    }
  }

  static async updateUserBehaviorScore(userId, interactionType) {
    try {
      const userRef = doc(db, "users", userId);
      const currentData = await this.getUserProfileFromFirestore(userId);

      const behaviorScore =
        (currentData?.behaviorAnalytics?.engagementScore || 0) + 1;

      await updateDoc(userRef, {
        "behaviorAnalytics.engagementScore": behaviorScore,
        "behaviorAnalytics.lastInteraction": {
          type: interactionType,
          timestamp: serverTimestamp(),
        },
      });

      console.log(`✅ 사용자 행동 점수 업데이트: ${interactionType}`);
    } catch (error) {
      console.error("❌ 행동 점수 업데이트 실패:", error);
    }
  }

  static async getRecommendationHistory(userId, limit = 10) {
    try {
      const userProfile = await this.getUserProfileFromFirestore(userId);
      const history = userProfile?.recommendationHistory || [];
      return history.slice(0, limit);
    } catch (error) {
      console.error("❌ 추천 기록 조회 실패:", error);
      return [];
    }
  }

  static async submitFeedback(userId, recommendationId, rating, feedback) {
    try {
      const userRef = doc(db, "users", userId);
      const feedbackData = {
        id: crypto.randomUUID(),
        recommendationId,
        rating,
        feedback,
        timestamp: serverTimestamp(),
      };

      const currentProfile = await this.getUserProfileFromFirestore(userId);
      const existingFeedback = currentProfile?.feedbackHistory || [];
      const updatedFeedback = [feedbackData, ...existingFeedback].slice(0, 100);

      const avgRating =
        updatedFeedback.reduce((sum, fb) => sum + fb.rating, 0) /
        updatedFeedback.length;

      await updateDoc(userRef, {
        feedbackHistory: updatedFeedback,
        "behaviorAnalytics.averageSatisfactionRating": avgRating,
        "behaviorAnalytics.totalFeedback": updatedFeedback.length,
      });

      console.log("✅ 피드백 저장 완료");
      return feedbackData;
    } catch (error) {
      console.error("❌ 피드백 저장 실패:", error);
      throw error;
    }
  }
}

export const ApiUtils = {
  checkServerConnection: async () => {
    try {
      const response = await HealthAPI.healthCheck();
      return response && response.success !== false;
    } catch (error) {
      console.warn("서버 연결 확인 실패:", error);
      return false;
    }
  },

  checkAuthStatus: () => {
    return !!auth.currentUser;
  },

  formatErrorMessage: (error) => {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    return "알 수 없는 오류가 발생했습니다.";
  },

  simulateLoading: (ms = 2000) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  refreshAuthToken: async () => {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      const token = await user.getIdToken(true);
      return !!token;
    } catch (error) {
      console.error("토큰 검증 실패:", error);
      return false;
    }
  },
};

export const FinancialModelAPI = {
  getFinancialModelRecommendation: async (
    query,
    userProfile = null,
    options = {}
  ) => {
    return await SmartRecommendationService.getPersonalizedRecommendations(
      query,
      userProfile
    );
  },

  testDomainClassification: async (query) => {
    return await makeRequest(
      `${API_BASE_URL}/recommendations/test/domain-classification`,
      {
        method: "POST",
        body: JSON.stringify({ query }),
      }
    );
  },

  testDatasetPreparation: async (domain) => {
    return await makeRequest(
      `${API_BASE_URL}/recommendations/test/dataset-preparation`,
      {
        method: "POST",
        body: JSON.stringify({ domain }),
      }
    );
  },
};

export default {
  FinancialModelAPI,
  RecommendationAPI,
  ProductAPI,
  AuthAPI,
  HealthAPI,
  SmartRecommendationService,
  ApiUtils,
};
