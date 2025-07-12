// finpick-front/src/services/backendApi.js

const API_BASE_URL = "http://localhost:8000/api";

// API 응답 래퍼 클래스
class ApiResponse {
  constructor(success, data, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
  }
}

// HTTP 요청 헬퍼 함수
const makeRequest = async (url, options = {}) => {
  try {
    // 기본 헤더 설정
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    // 인증 토큰이 있으면 추가
    const token = localStorage.getItem("authToken");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      headers: defaultHeaders,
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log(`🔗 API 요청: ${url}`, config);

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API 응답: ${url}`, data);

    return new ApiResponse(true, data);
  } catch (error) {
    console.error(`❌ API 오류: ${url}`, error);
    return new ApiResponse(false, null, error.message);
  }
};

// 🤖 추천 관련 API
export const RecommendationAPI = {
  // 사용자 프로필 분석
  analyzeProfile: async (profileData) => {
    return await makeRequest(
      `${API_BASE_URL}/recommendations/analyze-profile`,
      {
        method: "POST",
        body: JSON.stringify(profileData),
      }
    );
  },

  // 맞춤 상품 추천 생성
  generateRecommendations: async (requestData) => {
    return await makeRequest(`${API_BASE_URL}/recommendations/generate`, {
      method: "POST",
      body: JSON.stringify(requestData),
    });
  },

  // 자연어 입력 처리
  processNaturalLanguage: async (query) => {
    return await makeRequest(
      `${API_BASE_URL}/recommendations/natural-language`,
      {
        method: "POST",
        body: JSON.stringify({ query }),
      }
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

// 🏦 상품 관련 API (향후 확장용)
export const ProductAPI = {
  // 전체 상품 조회 (향후 구현)
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

// 🎯 고수준 추천 서비스 클래스
export class SmartRecommendationService {
  static async getPersonalizedRecommendations(userQuery, userProfile = null) {
    try {
      console.log("🎯 개인화 추천 요청 시작...");

      // 1단계: 자연어 처리
      console.log("1️⃣ 자연어 분석 중...");
      const nlpResult = await RecommendationAPI.processNaturalLanguage(
        userQuery
      );

      if (!nlpResult.success) {
        throw new Error("자연어 처리 실패: " + nlpResult.error);
      }

      // 2단계: 추천 생성 요청 구성
      const recommendationRequest = {
        natural_query: userQuery,
        user_profile: userProfile,
        filters: nlpResult.data.parsed_conditions || {},
        limit: 5,
      };

      // 3단계: 추천 생성
      console.log("2️⃣ 맞춤 추천 생성 중...");
      const recommendations = await RecommendationAPI.generateRecommendations(
        recommendationRequest
      );

      if (!recommendations.success) {
        throw new Error("추천 생성 실패: " + recommendations.error);
      }

      console.log("✅ 개인화 추천 완료!", recommendations.data);
      return recommendations;
    } catch (error) {
      console.error("❌ 개인화 추천 오류:", error);
      return new ApiResponse(false, null, error.message);
    }
  }

  static async submitProductFeedback(productId, rating, comment = null) {
    try {
      return await RecommendationAPI.submitFeedback(productId, rating, comment);
    } catch (error) {
      console.error("❌ 피드백 제출 오류:", error);
      return new ApiResponse(false, null, error.message);
    }
  }
}

// 🔧 유틸리티 함수들
export const ApiUtils = {
  // 서버 연결 상태 확인
  checkServerConnection: async () => {
    try {
      const response = await HealthAPI.healthCheck();
      return response.success;
    } catch (error) {
      return false;
    }
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
};

// 기본 내보내기
export default {
  RecommendationAPI,
  ProductAPI,
  AuthAPI,
  HealthAPI,
  SmartRecommendationService,
  ApiUtils,
};
