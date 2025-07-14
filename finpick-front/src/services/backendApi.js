// finpick-front/src/services/backendApi.js

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// 🔧 공통 API 요청 함수
const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem("authToken");

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error;
  }
};

// 🎯 금융모델 추천 API (새로운 메인 API)
export const FinancialModelAPI = {
  // 🚀 자연어 기반 금융모델 추천 (메인 기능)
  getFinancialModelRecommendation: async (
    query,
    userProfile = null,
    options = {}
  ) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("토큰이 없습니다. 로그인이 필요합니다.");
      throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
    }

    const requestData = {
      query: query.trim(),
      user_profile: userProfile,
      filters: options.filters || {},
      limit: options.limit || 5,
    };

    console.log("🎯 금융모델 추천 요청:", requestData);

    try {
      const response = await makeRequest(
        `${API_BASE_URL}/recommendations/natural-language`,
        {
          method: "POST",
          body: JSON.stringify(requestData),
        }
      );

      console.log("✅ 금융모델 추천 응답:", response);
      return response;
    } catch (error) {
      console.error("❌ 금융모델 추천 실패:", error);
      throw error;
    }
  },

  // 🧪 도메인 분류 테스트
  testDomainClassification: async (query) => {
    return await makeRequest(
      `${API_BASE_URL}/recommendations/test/domain-classification`,
      {
        method: "POST",
        body: JSON.stringify({ query }),
      }
    );
  },

  // 🧪 데이터셋 준비 테스트
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

// 🏦 기존 추천 API (호환성 유지)
export const RecommendationAPI = {
  // 🔄 자연어 처리 (새로운 금융모델 API로 리다이렉트)
  processNaturalLanguage: async (query, userProfile = null, options = {}) => {
    console.log("⚠️ 기존 API 호출됨, 새로운 금융모델 API로 리다이렉트");
    return await FinancialModelAPI.getFinancialModelRecommendation(
      query,
      userProfile,
      options
    );
  },

  // 추천 이력 조회
  getRecommendationHistory: async (limit = 10) => {
    return await makeRequest(
      `${API_BASE_URL}/recommendations/history?limit=${limit}`
    );
  },

  // 피드백 제출
  submitFeedback: async (recommendationId, rating, feedback = null) => {
    return await makeRequest(`${API_BASE_URL}/recommendations/feedback`, {
      method: "POST",
      body: JSON.stringify({
        recommendation_id: recommendationId,
        rating,
        feedback,
      }),
    });
  },

  // 사용자 인사이트 조회
  getUserInsights: async () => {
    return await makeRequest(`${API_BASE_URL}/recommendations/user-insights`);
  },
};

// 🏦 상품 관련 API
export const ProductAPI = {
  // 전체 상품 조회
  getAllProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await makeRequest(`${API_BASE_URL}/products?${params}`);
  },

  // 상품 상세 조회
  getProductDetail: async (productId) => {
    return await makeRequest(`${API_BASE_URL}/products/${productId}`);
  },
};

// 🔐 인증 관련 API
export const AuthAPI = {
  // 토큰 검증
  verifyToken: async (token) => {
    return await makeRequest(`${API_BASE_URL}/auth/verify-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // 사용자 프로필 조회
  getUserProfile: async () => {
    return await makeRequest(`${API_BASE_URL}/auth/profile`);
  },
};

// 🏥 헬스체크 API
export const HealthAPI = {
  // 서버 상태 확인
  checkStatus: async () => {
    return await makeRequest(`${API_BASE_URL}/status`);
  },

  // 기본 헬스체크
  healthCheck: async () => {
    return await makeRequest(`${API_BASE_URL}/../health`);
  },
};

// 🎯 고수준 추천 서비스 클래스 - 완전 개편
export class SmartRecommendationService {
  // 🚀 메인 기능: 금융모델 기반 개인화 추천
  static async getPersonalizedRecommendations(query, userProfile = null) {
    try {
      console.log("🎯 개인화 추천 요청:", { query, userProfile });

      // 🔥 사용자 정보 가져오기 (로컬스토리지 또는 전역 상태에서)
      const storedUserProfile = userProfile || this.getUserProfileFromStorage();

      const requestBody = {
        query: query,
        user_profile: storedUserProfile, // 🔥 사용자 정보 포함
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

      if (response.success) {
        console.log("✅ 개인화 추천 성공:", response.data);
        return {
          success: true,
          data: response.data, // response.data.data가 아니라 response.data 전체를 반환
          personalized: true,
        };
      } else {
        throw new Error(response.error || "추천 생성 실패");
      }
    } catch (error) {
      console.error("❌ 개인화 추천 실패:", error);

      // 🔄 사용자 정보 없이 일반 추천으로 폴백
      return await this.getFallbackRecommendations(query);
    }
  }

  // 🔥 로컬스토리지에서 사용자 정보 가져오기
  static getUserProfileFromStorage() {
    try {
      // Firebase Auth 사용자 정보
      const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");

      // 온보딩 완료 정보들
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

  // 온보딩 완료 여부 확인
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

  // 폴백 추천 (사용자 정보 없이)
  static async getFallbackRecommendations(query) {
    try {
      console.log("🔄 일반 추천으로 폴백:", query);

      const requestBody = {
        query: query,
        user_profile: null,
        filters: {},
        limit: 5,
      };

      const response = await makeRequest(
        `${API_BASE_URL}/recommendations/natural-language`,
        {
          method: "POST",
          body: JSON.stringify(requestBody),
        }
      );

      return {
        success: true,
        data: response.data, // response.data.data가 아니라 response.data 전체를 반환
        personalized: false,
      };
    } catch (error) {
      console.error("❌ 폴백 추천도 실패:", error);
      return {
        success: false,
        error: ApiUtils.formatErrorMessage(error),
        personalized: false,
      };
    }
  }

  // 피드백 제출
  static async submitProductFeedback(productId, rating, comment = null) {
    try {
      return await RecommendationAPI.submitFeedback(productId, rating, comment);
    } catch (error) {
      console.error("❌ 피드백 제출 오류:", error);
      return { success: false, error: error.message };
    }
  }

  // 🧪 개발/테스트용 기능들
  static async testDomainClassification(query) {
    try {
      return await FinancialModelAPI.testDomainClassification(query);
    } catch (error) {
      console.error("도메인 분류 테스트 실패:", error);
      return { error: error.message };
    }
  }

  static async testDatasetPreparation(domain) {
    try {
      return await FinancialModelAPI.testDatasetPreparation(domain);
    } catch (error) {
      console.error("데이터셋 준비 테스트 실패:", error);
      return { error: error.message };
    }
  }

  // 📊 사용자 인사이트 관련
  static async getUserInsights() {
    try {
      return await RecommendationAPI.getUserInsights();
    } catch (error) {
      console.error("사용자 인사이트 조회 실패:", error);
      return { success: false, error: error.message };
    }
  }

  static async getRecommendationHistory(limit = 10) {
    try {
      return await RecommendationAPI.getRecommendationHistory(limit);
    } catch (error) {
      console.error("추천 이력 조회 실패:", error);
      return { success: false, error: error.message };
    }
  }
}

// 🔧 유틸리티 함수들 - ApiUtils export 추가!
export const ApiUtils = {
  // 서버 연결 상태 확인
  checkServerConnection: async () => {
    try {
      const response = await HealthAPI.healthCheck();
      return response && response.success !== false;
    } catch (error) {
      console.warn("서버 연결 확인 실패:", error);
      return false;
    }
  },

  // 인증 상태 확인
  checkAuthStatus: () => {
    const token = localStorage.getItem("authToken");
    return !!token;
  },

  // 에러 메시지 포맷팅
  formatErrorMessage: (error) => {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    return "알 수 없는 오류가 발생했습니다.";
  },

  // 로딩 시뮬레이션 (개발용)
  simulateLoading: (ms = 2000) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  // 토큰 새로고침
  refreshAuthToken: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return false;

      const response = await AuthAPI.verifyToken(token);
      return response.success;
    } catch (error) {
      console.error("토큰 검증 실패:", error);
      localStorage.removeItem("authToken");
      return false;
    }
  },
};

// 🔗 레거시 호환성을 위한 기본 export
export default {
  FinancialModelAPI,
  RecommendationAPI,
  ProductAPI,
  AuthAPI,
  HealthAPI,
  SmartRecommendationService,
  ApiUtils,
};
