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
  static async getPersonalizedRecommendations(
    userQuery,
    userProfile = null,
    options = {}
  ) {
    try {
      console.log("🎯 금융모델 기반 추천 요청 시작...");

      // 토큰 확인
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("로그인이 필요합니다. 다시 로그인해주세요.");
      }

      // 새로운 금융모델 API 호출
      const result = await FinancialModelAPI.getFinancialModelRecommendation(
        userQuery,
        userProfile,
        options
      );

      if (
        result.success &&
        result.recommendation_type === "financial_model_based"
      ) {
        console.log("✅ 금융모델 추천 성공:", result);

        return {
          success: true,
          type: "financial_model",
          data: {
            // 🎯 핵심: 금융모델 정보
            financialModel: {
              name: result.financial_model?.model_name,
              type: result.financial_model?.model_type,
              strategy: result.financial_model?.strategy,
              expectedOutcomes: result.financial_model?.expected_outcomes,
              implementationSteps: result.financial_model?.implementation_steps,
              confidence: result.financial_model?.confidence,
            },

            // 🏦 추천 상품들
            recommendations: result.recommendations || [],

            // 📊 포트폴리오 분석
            portfolioAnalysis: result.portfolio_analysis || {},

            // 🤖 AI 인사이트
            ai_insights: {
              method: result.ai_insights?.method || "Gemini AI 금융모델 분석",
              domainSpecialized: result.ai_insights?.domain_specialized || true,
              modelBased: result.ai_insights?.model_based || true,
              confidence_score: result.ai_insights?.confidence_score || 0.8,
              userAnalysis: result.ai_insights?.user_analysis || {},
              financialStrategy: result.ai_insights?.financial_strategy || {},
              expectedOutcomes: result.ai_insights?.expected_outcomes || {},
              recommendationSummary:
                result.ai_insights?.recommendation_summary || "",
            },

            // 📋 실행 계획
            nextSteps: result.next_steps || [],

            // 📈 메타데이터
            metadata: {
              userQuery: result.user_query,
              classifiedDomain: result.classified_domain,
              datasetSize: result.metadata?.dataset_size || 0,
              modelConfidence: result.metadata?.model_confidence || 3,
              timestamp: result.metadata?.timestamp,
              apiVersion: result.metadata?.api_version,
            },
          },
        };
      } else {
        console.warn("⚠️ 예상과 다른 응답 형식:", result);
        return {
          success: true,
          type: "fallback",
          data: {
            recommendations: result.recommendations || [],
            ai_insights: result.ai_insights || {},
          },
        };
      }
    } catch (error) {
      console.error("❌ 금융모델 추천 실패:", error);

      // 사용자 친화적 에러 메시지
      const userFriendlyMessage = ApiUtils.formatErrorMessage(error);

      return {
        success: false,
        error: userFriendlyMessage,
        originalError: error.message,
        type: "error",
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
