// finpick-front/src/services/portfolioService.js
const API_BASE_URL = "http://localhost:8000/api";

export class PortfolioService {
  // 🏦 전체 상품 목록 가져오기
  static async getAllProducts() {
    try {
      console.log("🔄 전체 상품 데이터 로딩 시작...");

      // 인증 토큰 가져오기
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${API_BASE_URL}/products/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log("📦 원본 API 응답:", data);

      // 백엔드 응답 구조에 따라 상품 데이터 추출
      let products = [];

      if (data.financial_products) {
        // financial_products.json 구조인 경우
        products = this.extractProductsFromJson(data.financial_products);
      } else if (Array.isArray(data)) {
        // 직접 배열인 경우
        products = data;
      } else if (data.data && Array.isArray(data.data)) {
        // {data: [...]} 구조인 경우
        products = data.data;
      }

      console.log(`✅ 총 ${products.length}개 상품 로드 완료`);

      // 프론트엔드 형식으로 변환
      const convertedProducts = this.convertToPortfolioFormat(products);
      console.log(`🔄 ${convertedProducts.length}개 상품 변환 완료`);

      return convertedProducts;
    } catch (error) {
      console.error("❌ 상품 데이터 로딩 실패:", error);

      // 폴백: 로컬 JSON 파일에서 로드 시도
      return await this.loadFromLocalJson();
    }
  }

  // 📁 로컬 JSON 파일에서 상품 데이터 로드
  static async loadFromLocalJson() {
    try {
      console.log("🔄 로컬 JSON 파일에서 데이터 로드 시도...");

      const response = await fetch("/financial_products.json");
      if (!response.ok) {
        throw new Error("로컬 JSON 파일 로드 실패");
      }

      const data = await response.json();
      const products = this.extractProductsFromJson(data);

      console.log(`📁 로컬에서 ${products.length}개 상품 로드 완료`);
      return this.convertToPortfolioFormat(products);
    } catch (error) {
      console.error("❌ 로컬 JSON 로드도 실패:", error);
      return this.getFallbackProducts();
    }
  }

  // 🔧 JSON 구조에서 상품 배열 추출
  static extractProductsFromJson(jsonData) {
    let allProducts = [];

    // financial_products.json의 구조 처리
    if (jsonData.deposits) allProducts.push(...jsonData.deposits);
    if (jsonData.savings) allProducts.push(...jsonData.savings);
    if (jsonData.credit_loans) allProducts.push(...jsonData.credit_loans);
    if (jsonData.mortgage_loans) allProducts.push(...jsonData.mortgage_loans);

    return allProducts;
  }

  // 🔄 백엔드 데이터를 포트폴리오 형식으로 변환
  static convertToPortfolioFormat(products) {
    return products
      .map((product, index) => {
        try {
          // 기본 정보 추출
          const id = product.id || `product_${Date.now()}_${index}`;
          const name = product.name || "상품명 미제공";
          const type = product.type || "정기예금";
          const bank = product.provider?.name || "은행명 미제공";

          // 금리 정보 처리 (신용대출 주의!)
          let interestRate = null;
          let hasRateInfo = false;

          if (
            product.details?.interest_rate &&
            product.details.interest_rate > 0
          ) {
            interestRate = product.details.interest_rate;
            hasRateInfo = true;
          } else if (product.rates && product.rates.length > 0) {
            // rates 배열에서 가장 높은 금리 선택
            const maxRate = Math.max(
              ...product.rates.map((r) => r.max_rate || r.base_rate || 0)
            );
            if (maxRate > 0) {
              interestRate = maxRate;
              hasRateInfo = true;
            }
          }

          // 최소/최대 금액
          const minAmount = product.details?.minimum_amount || 100000;
          const maxAmount = product.details?.maximum_amount || null;

          // 가입 조건
          const joinWays = product.conditions?.join_way || [];
          const features = [];

          // 온라인 가입 가능 여부
          if (joinWays.includes("인터넷") || joinWays.includes("스마트폰")) {
            features.push("온라인 가입");
          }
          if (joinWays.includes("영업점")) {
            features.push("영업점 가입");
          }

          // 특별 조건이 있으면 추가
          if (product.conditions?.special_conditions) {
            features.push(product.conditions.special_conditions);
          }

          return {
            id,
            name,
            type,
            bank,
            interestRate,
            hasRateInfo,
            minAmount,
            maxAmount,
            features: features.slice(0, 3), // 최대 3개만
            period: this.extractPeriod(product),

            // 포트폴리오용 추가 필드
            monthlyAmount: type === "신용대출" ? 1000000 : 300000,

            // 원본 데이터 보존
            originalProduct: product,
          };
        } catch (error) {
          console.error("❌ 상품 변환 오류:", error, product);
          return null;
        }
      })
      .filter(Boolean); // null 제거
  }

  // 🔧 상품 기간 정보 추출
  static extractPeriod(product) {
    if (product.details?.maturity_period) {
      return product.details.maturity_period;
    }
    if (product.details?.loan_period_max) {
      const months = product.details.loan_period_max;
      if (months >= 12) {
        return `최대 ${Math.floor(months / 12)}년`;
      }
      return `최대 ${months}개월`;
    }
    return "기간 문의";
  }

  // 🔍 상품 검색 및 필터링
  static filterProducts(products, filters = {}) {
    let filtered = [...products];

    // 카테고리 필터
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(
        (product) => product.type === filters.category
      );
    }

    // 검색어 필터
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.bank.toLowerCase().includes(term)
      );
    }

    // 금리 범위 필터
    if (filters.minRate !== undefined) {
      filtered = filtered.filter(
        (product) =>
          product.hasRateInfo && product.interestRate >= filters.minRate
      );
    }

    if (filters.maxRate !== undefined) {
      filtered = filtered.filter(
        (product) =>
          product.hasRateInfo && product.interestRate <= filters.maxRate
      );
    }

    // 은행 필터
    if (filters.banks && filters.banks.length > 0) {
      filtered = filtered.filter((product) =>
        filters.banks.includes(product.bank)
      );
    }

    // 온라인 가입 가능 필터
    if (filters.onlineOnly) {
      filtered = filtered.filter((product) =>
        product.features.some(
          (feature) =>
            feature.includes("온라인") || feature.includes("스마트폰")
        )
      );
    }

    return filtered;
  }

  // 📊 상품 통계 생성
  static generateProductStats(products) {
    const stats = {
      total: products.length,
      byType: {},
      byBank: {},
      rateRange: { min: null, max: null },
      hasRateInfo: 0,
    };

    products.forEach((product) => {
      // 타입별 통계
      stats.byType[product.type] = (stats.byType[product.type] || 0) + 1;

      // 은행별 통계
      stats.byBank[product.bank] = (stats.byBank[product.bank] || 0) + 1;

      // 금리 통계
      if (product.hasRateInfo) {
        stats.hasRateInfo++;
        if (
          stats.rateRange.min === null ||
          product.interestRate < stats.rateRange.min
        ) {
          stats.rateRange.min = product.interestRate;
        }
        if (
          stats.rateRange.max === null ||
          product.interestRate > stats.rateRange.max
        ) {
          stats.rateRange.max = product.interestRate;
        }
      }
    });

    return stats;
  }

  // 🔄 폴백 상품 데이터 (API 실패 시)
  static getFallbackProducts() {
    console.log("🔄 폴백 데이터 사용");

    return [
      {
        id: "fallback_001",
        name: "KB Star 정기예금",
        type: "정기예금",
        bank: "KB국민은행",
        interestRate: 3.5,
        hasRateInfo: true,
        minAmount: 100000,
        maxAmount: 100000000,
        features: ["온라인 가입", "자동이체 우대"],
        period: "12개월",
        monthlyAmount: 300000,
      },
      {
        id: "fallback_002",
        name: "신한 쏠편한 적금",
        type: "적금",
        bank: "신한은행",
        interestRate: 3.8,
        hasRateInfo: true,
        minAmount: 100000,
        maxAmount: 1000000,
        features: ["모바일 전용", "금리우대"],
        period: "12~36개월",
        monthlyAmount: 300000,
      },
      {
        id: "fallback_003",
        name: "우리 일반신용대출",
        type: "신용대출",
        bank: "우리은행",
        interestRate: null,
        hasRateInfo: false,
        minAmount: 10000000,
        maxAmount: null,
        features: ["온라인 신청", "한도 조회"],
        period: "최대 5년",
        monthlyAmount: 1000000,
      },
    ];
  }

  // 📈 포트폴리오 계산 유틸리티
  static calculatePortfolioValue(selectedProducts, months = 12) {
    let totalAssets = 0;
    let totalDebt = 0;
    let totalMonthlyFlow = 0;

    selectedProducts.forEach((product) => {
      const monthlyAmount = product.monthlyAmount;

      if (product.type === "신용대출") {
        // 대출은 부채
        totalDebt += monthlyAmount * months;
        totalMonthlyFlow -= monthlyAmount; // 월 상환금
      } else {
        // 예금/적금
        const principal = monthlyAmount * months;
        let interest = 0;

        if (product.hasRateInfo && product.interestRate) {
          interest = principal * (product.interestRate / 100) * (months / 12);
        }

        totalAssets += principal + interest;
        totalMonthlyFlow += monthlyAmount; // 월 저축액
      }
    });

    return {
      totalAssets,
      totalDebt,
      netWorth: totalAssets - totalDebt,
      monthlyFlow: totalMonthlyFlow,
      estimatedReturn:
        totalAssets > 0
          ? ((totalAssets - totalMonthlyFlow * months) /
              (totalMonthlyFlow * months)) *
            100
          : 0,
    };
  }
}
