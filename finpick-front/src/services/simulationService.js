// finpick-front/src/services/simulationService.js

import { backendApi } from "./backendApi";

class SimulationService {
  constructor() {
    this.baseURL = "/api/simulation";
  }

  /**
   * 🧮 시뮬레이션 계산 실행
   */
  async calculateSimulation(simulationData) {
    try {
      console.log("🚀 시뮬레이션 계산 요청:", simulationData);

      const requestData = {
        scenario_id: simulationData.scenarioId,
        monthly_amount: simulationData.monthlyAmount,
        target_years: simulationData.targetYears,
        expected_return: simulationData.expectedReturn,
        user_profile: simulationData.userProfile || null,
      };

      const response = await backendApi.post(
        `${this.baseURL}/calculate`,
        requestData
      );

      if (response.success) {
        console.log("✅ 시뮬레이션 계산 성공:", response.data);
        return {
          success: true,
          data: this._transformSimulationResult(response.data),
        };
      } else {
        throw new Error(response.message || "시뮬레이션 계산 실패");
      }
    } catch (error) {
      console.error("❌ 시뮬레이션 계산 오류:", error);
      return {
        success: false,
        error: error.message || "시뮬레이션 계산 중 오류가 발생했습니다.",
      };
    }
  }

  /**
   * 📊 사용 가능한 시나리오 목록 조회
   */
  async getScenarios() {
    try {
      const response = await backendApi.get(`${this.baseURL}/scenarios`);

      if (response.success) {
        return {
          success: true,
          scenarios: response.data.scenarios,
        };
      } else {
        throw new Error("시나리오 조회 실패");
      }
    } catch (error) {
      console.error("❌ 시나리오 조회 오류:", error);

      // 폴백: 하드코딩된 시나리오 반환
      return {
        success: true,
        scenarios: this._getFallbackScenarios(),
      };
    }
  }

  /**
   * ⚡ 계획 최적화 제안
   */
  async optimizePlan(optimizationRequest) {
    try {
      const queryParams = new URLSearchParams();

      if (optimizationRequest.scenarioId) {
        queryParams.append("scenario_id", optimizationRequest.scenarioId);
      }
      if (optimizationRequest.targetAmount) {
        queryParams.append("target_amount", optimizationRequest.targetAmount);
      }
      if (optimizationRequest.availableMonthly) {
        queryParams.append(
          "available_monthly",
          optimizationRequest.availableMonthly
        );
      }
      if (optimizationRequest.targetYears) {
        queryParams.append("target_years", optimizationRequest.targetYears);
      }

      const response = await backendApi.post(
        `${this.baseURL}/optimize?${queryParams}`
      );

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        throw new Error("최적화 계산 실패");
      }
    } catch (error) {
      console.error("❌ 최적화 계산 오류:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * 📈 실시간 미리보기 계산 (로컬 계산)
   */
  calculatePreview(monthlyAmount, targetYears, expectedReturn) {
    try {
      const monthlyRate = expectedReturn / 100 / 12;
      const totalMonths = targetYears * 12;

      let futureValue = 0;
      if (monthlyRate > 0) {
        futureValue =
          monthlyAmount *
          (((1 + monthlyRate) ** totalMonths - 1) / monthlyRate);
      } else {
        futureValue = monthlyAmount * totalMonths;
      }

      const principal = monthlyAmount * totalMonths;
      const interest = futureValue - principal;

      return {
        finalAmount: Math.round(futureValue),
        totalPrincipal: Math.round(principal),
        totalInterest: Math.round(interest),
        effectiveRate: principal > 0 ? (interest / principal) * 100 : 0,
      };
    } catch (error) {
      console.error("❌ 미리보기 계산 오류:", error);
      return {
        finalAmount: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        effectiveRate: 0,
      };
    }
  }

  /**
   * 🎯 목표 달성 분석
   */
  analyzeAchievement(finalAmount, targetAmount) {
    const achievementRate = (finalAmount / targetAmount) * 100;
    const shortfall = Math.max(0, targetAmount - finalAmount);
    const surplus = Math.max(0, finalAmount - targetAmount);

    let status = "needs_major_adjustment";
    let statusText = "계획 재검토 필요";
    let statusColor = "text-red-400";

    if (achievementRate >= 100) {
      status = "achieved";
      statusText = "목표 달성!";
      statusColor = "text-emerald-400";
    } else if (achievementRate >= 90) {
      status = "almost_achieved";
      statusText = "거의 달성";
      statusColor = "text-yellow-400";
    } else if (achievementRate >= 70) {
      status = "needs_adjustment";
      statusText = "조정 필요";
      statusColor = "text-orange-400";
    }

    return {
      rate: Math.round(achievementRate * 10) / 10,
      shortfall,
      surplus,
      status,
      statusText,
      statusColor,
    };
  }

  /**
   * 📊 차트 데이터 변환
   */
  _transformSimulationResult(apiResult) {
    return {
      scenario: apiResult.scenario,
      calculation: apiResult.calculation,
      chartData: apiResult.chart_data.map((point) => ({
        year: point.year,
        amount: point.amount,
        principal: point.principal,
        interest: point.interest,
        interestRate: point.cumulative_interest_rate,
      })),
      aiAnalysis: {
        mainComment: apiResult.ai_analysis.main_comment,
        actionItems: apiResult.ai_analysis.action_items || [],
        motivation: apiResult.ai_analysis.motivation,
        confidence: apiResult.ai_analysis.confidence || 0.5,
        source: apiResult.ai_analysis.source || "unknown",
      },
      achievement: apiResult.achievement_status,
      recommendations: apiResult.recommendations || [],
    };
  }

  /**
   * 🔄 폴백 시나리오 데이터
   */
  _getFallbackScenarios() {
    return [
      {
        id: "house",
        emoji: "🏠",
        title: "집사기",
        description: "3억모으기",
        target_amount: 300000000,
        recommended_monthly: 800000,
        typical_timeframe: 8,
        risk_level: "conservative",
        category: "real_estate",
      },
      {
        id: "retire",
        emoji: "💼",
        title: "은퇴준비",
        description: "10억모으기",
        target_amount: 1000000000,
        recommended_monthly: 1500000,
        typical_timeframe: 15,
        risk_level: "moderate",
        category: "retirement",
      },
      {
        id: "baby",
        emoji: "👶",
        title: "육아",
        description: "5천만",
        target_amount: 50000000,
        recommended_monthly: 300000,
        typical_timeframe: 5,
        risk_level: "conservative",
        category: "education",
      },
    ];
  }

  /**
   * 💾 시뮬레이션 결과 로컬 저장
   */
  saveSimulationToLocal(simulationResult) {
    try {
      const saveData = {
        ...simulationResult,
        timestamp: new Date().toISOString(),
        version: "1.0",
      };

      const existingSaves = this.getLocalSimulations();
      const newSaves = [saveData, ...existingSaves.slice(0, 9)]; // 최대 10개 저장

      localStorage.setItem("finpick_simulations", JSON.stringify(newSaves));

      console.log("💾 시뮬레이션 로컬 저장 완료");
      return true;
    } catch (error) {
      console.error("❌ 로컬 저장 실패:", error);
      return false;
    }
  }

  /**
   * 📁 로컬 저장된 시뮬레이션 목록 조회
   */
  getLocalSimulations() {
    try {
      const saved = localStorage.getItem("finpick_simulations");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("❌ 로컬 데이터 조회 실패:", error);
      return [];
    }
  }

  /**
   * 🗑️ 로컬 시뮬레이션 삭제
   */
  deleteLocalSimulation(timestamp) {
    try {
      const existingSaves = this.getLocalSimulations();
      const filtered = existingSaves.filter(
        (save) => save.timestamp !== timestamp
      );

      localStorage.setItem("finpick_simulations", JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("❌ 로컬 삭제 실패:", error);
      return false;
    }
  }

  /**
   * 📱 모바일 최적화 계산 (간소화된 연산)
   */
  calculateMobilePreview(
    monthlyAmount,
    targetYears,
    expectedReturn,
    targetAmount
  ) {
    const preview = this.calculatePreview(
      monthlyAmount,
      targetYears,
      expectedReturn
    );
    const achievement = this.analyzeAchievement(
      preview.finalAmount,
      targetAmount
    );

    return {
      ...preview,
      achievement,
      monthlyBreakdown: {
        principal: monthlyAmount,
        expectedInterest: Math.round(
          preview.totalInterest / (targetYears * 12)
        ),
        totalMonthly:
          monthlyAmount +
          Math.round(preview.totalInterest / (targetYears * 12)),
      },
    };
  }

  /**
   * 🎯 스마트 추천 계산
   */
  getSmartRecommendations(currentParams, targetAmount) {
    const recommendations = [];
    const { monthlyAmount, targetYears, expectedReturn } = currentParams;

    // 현재 달성률 계산
    const currentResult = this.calculatePreview(
      monthlyAmount,
      targetYears,
      expectedReturn
    );
    const currentRate = (currentResult.finalAmount / targetAmount) * 100;

    // 1. 월 저축액 조정 추천
    if (currentRate < 100) {
      const requiredMonthly = this._calculateRequiredMonthly(
        targetAmount,
        targetYears,
        expectedReturn
      );
      const additionalAmount = requiredMonthly - monthlyAmount;

      if (additionalAmount > 0 && additionalAmount <= monthlyAmount * 0.5) {
        recommendations.push({
          type: "increase_monthly",
          title: `월 저축 ${additionalAmount.toLocaleString()}원 증액`,
          description: `목표 달성을 위해 월 ${additionalAmount.toLocaleString()}원만 더 저축하세요`,
          impact: `달성률 ${Math.round(currentRate)}% → 100%`,
          difficulty: "easy",
        });
      }
    }

    // 2. 기간 조정 추천
    const requiredYears = this._calculateRequiredYears(
      targetAmount,
      monthlyAmount,
      expectedReturn
    );
    if (requiredYears > targetYears && requiredYears <= targetYears + 3) {
      const additionalYears = Math.ceil(requiredYears - targetYears);
      recommendations.push({
        type: "extend_period",
        title: `${additionalYears}년 연장`,
        description: `기간을 ${additionalYears}년 연장하면 목표 달성 가능`,
        impact: `${targetYears}년 → ${targetYears + additionalYears}년`,
        difficulty: "medium",
      });
    }

    // 3. 수익률 개선 추천
    if (expectedReturn < 6.0) {
      const betterReturn = expectedReturn + 1.0;
      const betterResult = this.calculatePreview(
        monthlyAmount,
        targetYears,
        betterReturn
      );
      const betterRate = (betterResult.finalAmount / targetAmount) * 100;

      if (betterRate >= 90) {
        recommendations.push({
          type: "improve_return",
          title: `수익률 ${betterReturn}%로 개선`,
          description: "더 높은 수익률 상품을 찾아보세요",
          impact: `달성률 ${Math.round(currentRate)}% → ${Math.round(
            betterRate
          )}%`,
          difficulty: "hard",
        });
      }
    }

    return recommendations.slice(0, 3); // 최대 3개 추천
  }

  /**
   * 🧮 필요 월납입액 계산 (간단 버전)
   */
  _calculateRequiredMonthly(targetAmount, years, annualRate) {
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;

    if (monthlyRate > 0) {
      return (
        targetAmount / (((1 + monthlyRate) ** totalMonths - 1) / monthlyRate)
      );
    } else {
      return targetAmount / totalMonths;
    }
  }

  /**
   * ⏰ 필요 기간 계산 (간단 버전)
   */
  _calculateRequiredYears(targetAmount, monthlyPayment, annualRate) {
    const monthlyRate = annualRate / 100 / 12;

    if (monthlyRate > 0) {
      const requiredMonths =
        Math.log(1 + (targetAmount * monthlyRate) / monthlyPayment) /
        Math.log(1 + monthlyRate);
      return requiredMonths / 12;
    } else {
      return targetAmount / monthlyPayment / 12;
    }
  }

  /**
   * 📊 통계 데이터 생성
   */
  generateStatistics(simulationResults) {
    if (!simulationResults || !simulationResults.chartData) {
      return null;
    }

    const { chartData, calculation } = simulationResults;
    const finalData = chartData[chartData.length - 1];

    return {
      totalReturn: {
        amount: calculation.total_interest,
        percentage:
          (calculation.total_interest / calculation.total_principal) * 100,
      },
      monthlyGrowth: {
        principal: Math.round(
          calculation.total_principal / (chartData.length - 1)
        ),
        interest: Math.round(
          calculation.total_interest / (chartData.length - 1)
        ),
        total: Math.round(finalData.amount / (chartData.length - 1)),
      },
      milestones: this._calculateMilestones(chartData),
      projectedValue: {
        in5Years: this._getValueAtYear(chartData, 5),
        in10Years: this._getValueAtYear(chartData, 10),
        atTarget: finalData.amount,
      },
    };
  }

  /**
   * 🎯 마일스톤 계산
   */
  _calculateMilestones(chartData) {
    const milestones = [];
    const maxAmount = chartData[chartData.length - 1]?.amount || 0;

    // 25%, 50%, 75%, 100% 지점
    [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
      const targetAmount = maxAmount * ratio;
      const milestone = chartData.find((point) => point.amount >= targetAmount);

      if (milestone) {
        milestones.push({
          percentage: ratio * 100,
          year: milestone.year,
          amount: milestone.amount,
          description: `${ratio * 100}% 달성`,
        });
      }
    });

    return milestones;
  }

  /**
   * 📈 특정 연도의 예상 자산 조회
   */
  _getValueAtYear(chartData, targetYear) {
    const dataPoint = chartData.find(
      (point) => Math.abs(point.year - targetYear) < 0.1
    );
    return dataPoint ? dataPoint.amount : 0;
  }

  /**
   * 🔍 시뮬레이션 유효성 검증
   */
  validateSimulationParams(params) {
    const errors = [];

    if (!params.monthlyAmount || params.monthlyAmount < 10000) {
      errors.push("월 저축액은 최소 1만원 이상이어야 합니다.");
    }

    if (
      !params.targetYears ||
      params.targetYears < 0.5 ||
      params.targetYears > 50
    ) {
      errors.push("목표 기간은 0.5년 이상 50년 이하여야 합니다.");
    }

    if (
      !params.expectedReturn ||
      params.expectedReturn < 0 ||
      params.expectedReturn > 20
    ) {
      errors.push("예상 수익률은 0% 이상 20% 이하여야 합니다.");
    }

    if (!params.scenarioId) {
      errors.push("시나리오를 선택해주세요.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 🌟 시뮬레이션 품질 평가
   */
  evaluateSimulationQuality(params, result) {
    let score = 100;
    const feedback = [];

    // 달성률 평가
    if (result.achievement.rate >= 100) {
      feedback.push("✅ 목표 달성 가능한 현실적인 계획");
    } else if (result.achievement.rate >= 80) {
      score -= 10;
      feedback.push("⚠️ 목표 달성을 위해 약간의 조정 필요");
    } else {
      score -= 30;
      feedback.push("❌ 목표 달성을 위해 대폭 조정 필요");
    }

    // 월 저축 비율 평가 (가정: 월소득의 30% 이하가 적정)
    // 실제로는 사용자 프로필에서 소득 정보를 가져와야 함

    // 기간 적정성 평가
    if (params.targetYears >= 3 && params.targetYears <= 15) {
      feedback.push("✅ 적정한 저축 기간");
    } else if (params.targetYears < 3) {
      score -= 15;
      feedback.push("⚠️ 너무 짧은 저축 기간");
    } else {
      score -= 10;
      feedback.push("⚠️ 긴 저축 기간, 중간 목표 설정 권장");
    }

    // 수익률 현실성 평가
    if (params.expectedReturn >= 2 && params.expectedReturn <= 7) {
      feedback.push("✅ 현실적인 수익률 설정");
    } else if (params.expectedReturn > 7) {
      score -= 20;
      feedback.push("⚠️ 높은 수익률, 리스크 고려 필요");
    } else {
      score -= 10;
      feedback.push("⚠️ 낮은 수익률, 더 나은 상품 검토 권장");
    }

    return {
      score: Math.max(0, score),
      grade: score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D",
      feedback,
    };
  }
}

// 싱글톤 인스턴스 생성
const simulationService = new SimulationService();

export default simulationService;
