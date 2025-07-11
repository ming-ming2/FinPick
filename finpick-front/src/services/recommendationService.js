// finpick-front/src/services/RecommendationService.js
import { ImprovedUserService } from "./improvedUserService";

export class RecommendationService {
  static async generatePersonalizedRecommendations(userId, context = {}) {
    try {
      const userProfile = await ImprovedUserService.getUserProfile(userId);
      const similarUsers = await ImprovedUserService.findSimilarUsers(
        userId,
        20
      );

      const recommendations = await this.hybridRecommendation(
        userProfile,
        similarUsers,
        context
      );

      await ImprovedUserService.recordRecommendationInteraction(
        userId,
        recommendations.id,
        recommendations.products,
        "view",
        { context, generationTime: Date.now() }
      );

      return recommendations;
    } catch (error) {
      console.error("개인화 추천 생성 실패:", error);
      throw error;
    }
  }

  static async hybridRecommendation(userProfile, similarUsers, context) {
    const contentBasedScore = this.calculateContentBasedScore(userProfile);
    const collaborativeScore = this.calculateCollaborativeScore(
      userProfile,
      similarUsers
    );
    const contextualScore = this.calculateContextualScore(userProfile, context);

    const hybridScore = {
      contentWeight: 0.4,
      collaborativeWeight: 0.3,
      contextualWeight: 0.3,
    };

    const products = await this.getAvailableProducts();
    const scoredProducts = products.map((product) => ({
      ...product,
      finalScore:
        contentBasedScore[product.type] * hybridScore.contentWeight +
        collaborativeScore[product.type] * hybridScore.collaborativeWeight +
        contextualScore[product.type] * hybridScore.contextualWeight,
      reasoning: this.generateReasoning(
        product,
        userProfile,
        contentBasedScore,
        collaborativeScore
      ),
    }));

    const topProducts = scoredProducts
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5);

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: userProfile.userId,
      products: topProducts,
      methodology: "hybrid_collaborative_content_contextual",
      confidence: this.calculateOverallConfidence(userProfile, topProducts),
      explanation: this.generateExplanation(userProfile, topProducts),
      nextActions: this.suggestNextActions(userProfile, topProducts),
    };
  }

  static calculateContentBasedScore(userProfile) {
    const riskLevel = userProfile.investmentProfile?.riskLevel?.level || 3;
    const primaryGoal = userProfile.searchableFields?.primaryGoal;
    const incomeCategory = userProfile.searchableFields?.incomeRange?.category;

    const scores = {
      deposit: 0.5,
      savings: 0.5,
      loan: 0.3,
      investment: 0.4,
    };

    if (riskLevel <= 2) {
      scores.deposit += 0.3;
      scores.savings += 0.3;
      scores.investment -= 0.2;
    } else if (riskLevel >= 4) {
      scores.investment += 0.3;
      scores.deposit -= 0.1;
    }

    if (primaryGoal === "안전한 저축") {
      scores.deposit += 0.2;
      scores.savings += 0.2;
    } else if (primaryGoal === "투자 수익") {
      scores.investment += 0.3;
    }

    if (incomeCategory === "고소득") {
      scores.investment += 0.1;
      scores.loan -= 0.1;
    } else if (incomeCategory === "저소득") {
      scores.deposit += 0.1;
      scores.loan += 0.1;
    }

    return this.normalizeScores(scores);
  }

  static calculateCollaborativeScore(userProfile, similarUsers) {
    if (similarUsers.length === 0) {
      return { deposit: 0.5, savings: 0.5, loan: 0.3, investment: 0.4 };
    }

    const productPreferences = {};
    let totalWeight = 0;

    similarUsers.forEach((similarUser) => {
      const weight = this.calculateSimilarityWeight(userProfile, similarUser);
      const preferences =
        similarUser.behaviorAnalytics?.recommendationHistory || [];

      preferences.forEach((interaction) => {
        if (["click", "save", "convert"].includes(interaction.action)) {
          interaction.products.forEach((product) => {
            const type = product.productType;
            if (!productPreferences[type]) productPreferences[type] = 0;
            productPreferences[type] += weight;
          });
        }
      });

      totalWeight += weight;
    });

    if (totalWeight === 0) {
      return { deposit: 0.5, savings: 0.5, loan: 0.3, investment: 0.4 };
    }

    Object.keys(productPreferences).forEach((type) => {
      productPreferences[type] /= totalWeight;
    });

    return this.normalizeScores({
      deposit: productPreferences.deposit || 0.5,
      savings: productPreferences.savings || 0.5,
      loan: productPreferences.loan || 0.3,
      investment: productPreferences.investment || 0.4,
    });
  }

  static calculateContextualScore(userProfile, context) {
    const scores = { deposit: 0.5, savings: 0.5, loan: 0.3, investment: 0.4 };

    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth === 12 || currentMonth === 1) {
      scores.savings += 0.1; // 연말/연초 적금 선호
    }

    if (context.searchQuery) {
      const query = context.searchQuery.toLowerCase();
      if (query.includes("안전") || query.includes("보장")) {
        scores.deposit += 0.2;
        scores.savings += 0.2;
      }
      if (query.includes("수익") || query.includes("투자")) {
        scores.investment += 0.2;
      }
      if (query.includes("대출") || query.includes("융자")) {
        scores.loan += 0.3;
      }
    }

    if (context.currentProducts) {
      context.currentProducts.forEach((product) => {
        if (product.type === "deposit") scores.savings += 0.1;
        if (product.type === "savings") scores.investment += 0.1;
      });
    }

    return this.normalizeScores(scores);
  }

  static calculateSimilarityWeight(user1, user2) {
    let weight = 0;

    if (user1.searchableFields?.ageGroup === user2.searchableFields?.ageGroup)
      weight += 0.3;
    if (user1.searchableFields?.riskLevel === user2.searchableFields?.riskLevel)
      weight += 0.3;
    if (
      user1.searchableFields?.incomeRange?.category ===
      user2.searchableFields?.incomeRange?.category
    )
      weight += 0.2;
    if (
      user1.searchableFields?.primaryGoal ===
      user2.searchableFields?.primaryGoal
    )
      weight += 0.2;

    return weight;
  }

  static normalizeScores(scores) {
    const values = Object.values(scores);
    const max = Math.max(...values);
    const min = Math.min(...values);

    if (max === min) return scores;

    const normalized = {};
    Object.keys(scores).forEach((key) => {
      normalized[key] = (scores[key] - min) / (max - min);
    });

    return normalized;
  }

  static generateReasoning(
    product,
    userProfile,
    contentScore,
    collaborativeScore
  ) {
    const reasons = [];

    const riskLevel = userProfile.investmentProfile?.riskLevel?.level || 3;
    if (product.riskLevel <= riskLevel + 1) {
      reasons.push("위험 성향에 적합");
    }

    const income = userProfile.searchableFields?.incomeRange?.min || 0;
    if (product.minimumAmount <= income * 0.3) {
      reasons.push("소득 수준에 적합");
    }

    if (contentScore[product.type] > 0.6) {
      reasons.push("개인 선호도 높음");
    }

    if (collaborativeScore[product.type] > 0.6) {
      reasons.push("유사 고객 선호");
    }

    if (product.interestRate > 3.5) {
      reasons.push("높은 금리");
    }

    return reasons;
  }

  static calculateOverallConfidence(userProfile, products) {
    let confidence = 0.5;

    if (userProfile.onboardingStatus?.isCompleted) confidence += 0.2;
    if (userProfile.behaviorAnalytics?.recommendationHistory?.length > 10)
      confidence += 0.1;
    if (userProfile.behaviorAnalytics?.satisfactionData?.averageRating > 3.5)
      confidence += 0.1;

    const avgScore =
      products.reduce((sum, p) => sum + p.finalScore, 0) / products.length;
    if (avgScore > 0.7) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  static generateExplanation(userProfile, products) {
    const riskLevel =
      userProfile.investmentProfile?.riskLevel?.name || "위험중립형";
    const primaryGoal =
      userProfile.searchableFields?.primaryGoal || "안정적 저축";
    const topProduct = products[0];

    return {
      summary: `${riskLevel} 성향과 '${primaryGoal}' 목표에 맞춰 ${topProduct.name}을(를) 최우선 추천드립니다.`,
      methodology:
        "사용자 프로필, 유사 고객 행동, 현재 시장 상황을 종합 분석하여 추천했습니다.",
      keyFactors: [
        `위험 성향: ${riskLevel}`,
        `투자 목표: ${primaryGoal}`,
        `추천 신뢰도: ${Math.round(
          this.calculateOverallConfidence(userProfile, products) * 100
        )}%`,
      ],
    };
  }

  static suggestNextActions(userProfile, products) {
    const actions = [];

    if (products.length > 1) {
      actions.push({
        type: "compare",
        title: "상품 비교하기",
        description: "추천 상품들을 자세히 비교해보세요",
        products: products.slice(0, 3).map((p) => p.id),
      });
    }

    if (userProfile.behaviorAnalytics?.satisfactionData?.totalRatings < 3) {
      actions.push({
        type: "feedback",
        title: "추천 평가하기",
        description: "추천이 도움이 되셨나요? 평가해주세요",
      });
    }

    actions.push({
      type: "simulate",
      title: "목표 시뮬레이션",
      description: "선택한 상품으로 목표 달성 가능성을 확인해보세요",
    });

    if (userProfile.searchableFields?.primaryGoal) {
      actions.push({
        type: "explore",
        title: "관련 상품 더 보기",
        description: `${userProfile.searchableFields.primaryGoal} 관련 다른 상품들도 살펴보세요`,
      });
    }

    return actions;
  }

  static async getAvailableProducts() {
    // 실제 구현에서는 금융상품 DB에서 가져옴
    return [
      {
        id: "dep_001",
        name: "KB스타정기예금",
        type: "deposit",
        bank: "KB국민은행",
        interestRate: 3.5,
        minimumAmount: 1000000,
        riskLevel: 1,
      },
      {
        id: "sav_001",
        name: "신한 첫걸음적금",
        type: "savings",
        bank: "신한은행",
        interestRate: 4.2,
        minimumAmount: 100000,
        riskLevel: 1,
      },
    ];
  }

  static async recordUserFeedback(userId, recommendationId, rating, feedback) {
    try {
      await ImprovedUserService.recordSatisfactionFeedback(
        userId,
        recommendationId,
        rating,
        feedback
      );

      // 실시간 모델 업데이트를 위한 피드백 처리
      await this.updateRecommendationModel(userId, rating, feedback);
    } catch (error) {
      console.error("사용자 피드백 기록 실패:", error);
      throw error;
    }
  }

  static async updateRecommendationModel(userId, rating, feedback) {
    try {
      const userProfile = await ImprovedUserService.getUserProfile(userId);

      // 만족도에 따른 선호도 조정
      if (rating >= 4) {
        // 긍정적 피드백: 현재 선호도 강화
        const currentPrefs =
          userProfile.preferences?.inferredPreferences?.productTypePreference ||
          {};
        const enhancedPrefs = {};

        Object.keys(currentPrefs).forEach((key) => {
          enhancedPrefs[
            `preferences.inferredPreferences.productTypePreference.${key}`
          ] = Math.min(1.0, currentPrefs[key] + 0.05);
        });

        await updateDoc(doc(db, "users", userId), enhancedPrefs);
      } else if (rating <= 2) {
        // 부정적 피드백: 선호도 조정 필요
        await this.adjustPreferencesBasedOnNegativeFeedback(userId, feedback);
      }
    } catch (error) {
      console.error("추천 모델 업데이트 실패:", error);
    }
  }

  static async adjustPreferencesBasedOnNegativeFeedback(userId, feedback) {
    // 피드백 내용 분석하여 선호도 조정
    if (feedback.includes("위험") || feedback.includes("안전")) {
      await updateDoc(doc(db, "users", userId), {
        "preferences.inferredPreferences.riskReturnWeight.safety": Math.min(
          1.0,
          userProfile.preferences.inferredPreferences.riskReturnWeight.safety +
            0.1
        ),
      });
    }

    if (feedback.includes("금리") || feedback.includes("수익")) {
      await updateDoc(doc(db, "users", userId), {
        "preferences.inferredPreferences.riskReturnWeight.profitability":
          Math.min(
            1.0,
            userProfile.preferences.inferredPreferences.riskReturnWeight
              .profitability + 0.1
          ),
      });
    }
  }

  static async getRecommendationInsights(userId) {
    try {
      const userProfile = await ImprovedUserService.getUserProfile(userId);
      const history =
        userProfile.behaviorAnalytics?.recommendationHistory || [];

      const insights = {
        totalRecommendations: history.length,
        clickThroughRate:
          userProfile.behaviorAnalytics?.interactionPatterns?.clickThrough
            ?.rate || 0,
        averageSatisfaction:
          userProfile.behaviorAnalytics?.satisfactionData?.averageRating || 0,
        preferredProductTypes: this.analyzePreferredProducts(history),
        behaviorPatterns: this.analyzeBehaviorPatterns(history),
        improvementSuggestions:
          this.generateImprovementSuggestions(userProfile),
      };

      return insights;
    } catch (error) {
      console.error("추천 인사이트 생성 실패:", error);
      throw error;
    }
  }

  static analyzePreferredProducts(history) {
    const productCounts = {};

    history.forEach((interaction) => {
      if (["click", "save", "convert"].includes(interaction.action)) {
        interaction.products.forEach((product) => {
          const type = product.productType;
          productCounts[type] = (productCounts[type] || 0) + 1;
        });
      }
    });

    return Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));
  }

  static analyzeBehaviorPatterns(history) {
    const patterns = {
      mostActiveTimeOfDay: this.getMostActiveTime(history),
      averageTimeToDecision: this.getAverageDecisionTime(history),
      preferredInteractionType: this.getPreferredInteractionType(history),
      seasonalTrends: this.getSeasonalTrends(history),
    };

    return patterns;
  }

  static getMostActiveTime(history) {
    const hourCounts = {};

    history.forEach((interaction) => {
      const hour = new Date(interaction.timestamp.toDate()).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const maxHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];

    return maxHour ? parseInt(maxHour[0]) : null;
  }

  static getAverageDecisionTime(history) {
    const decisions = history.filter((h) =>
      ["save", "convert"].includes(h.action)
    );
    if (decisions.length === 0) return null;

    let totalTime = 0;
    decisions.forEach((decision) => {
      const viewInteraction = history.find(
        (h) =>
          h.recommendationId === decision.recommendationId &&
          h.action === "view"
      );
      if (viewInteraction) {
        const timeDiff =
          decision.timestamp.toDate() - viewInteraction.timestamp.toDate();
        totalTime += timeDiff;
      }
    });

    return totalTime / decisions.length;
  }

  static getPreferredInteractionType(history) {
    const actionCounts = {};

    history.forEach((interaction) => {
      actionCounts[interaction.action] =
        (actionCounts[interaction.action] || 0) + 1;
    });

    return (
      Object.entries(actionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null
    );
  }

  static getSeasonalTrends(history) {
    const monthCounts = {};

    history.forEach((interaction) => {
      const month = new Date(interaction.timestamp.toDate()).getMonth();
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    return Object.entries(monthCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([month, count]) => ({ month: parseInt(month), count }));
  }

  static generateImprovementSuggestions(userProfile) {
    const suggestions = [];

    const satisfactionRating =
      userProfile.behaviorAnalytics?.satisfactionData?.averageRating || 0;
    if (satisfactionRating < 3) {
      suggestions.push({
        type: "satisfaction",
        title: "추천 정확도 개선",
        description: "더 정확한 추천을 위해 선호도를 업데이트해주세요",
        action: "update_preferences",
      });
    }

    const clickThroughRate =
      userProfile.behaviorAnalytics?.interactionPatterns?.clickThrough?.rate ||
      0;
    if (clickThroughRate < 0.1) {
      suggestions.push({
        type: "engagement",
        title: "더 다양한 상품 탐색",
        description: "관심사를 더 구체적으로 설정하면 맞춤 추천이 가능합니다",
        action: "explore_more",
      });
    }

    const totalInteractions =
      userProfile.behaviorAnalytics?.recommendationHistory?.length || 0;
    if (totalInteractions < 5) {
      suggestions.push({
        type: "onboarding",
        title: "추천 시스템 활용도 높이기",
        description:
          "더 많은 상품을 비교해보시면 최적의 선택을 도와드릴 수 있습니다",
        action: "use_more_features",
      });
    }

    return suggestions;
  }

  static async bulkUpdateUserSegments() {
    try {
      console.log("사용자 세그먼트 일괄 업데이트 시작...");

      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);

      let updatedCount = 0;

      for (const userDoc of snapshot.docs) {
        try {
          await ImprovedUserService.updateUserSegment(userDoc.id);
          updatedCount++;
        } catch (error) {
          console.error(`세그먼트 업데이트 실패: ${userDoc.id}`, error);
        }
      }

      console.log(`사용자 세그먼트 업데이트 완료: ${updatedCount}명`);
    } catch (error) {
      console.error("세그먼트 일괄 업데이트 실패:", error);
      throw error;
    }
  }

  static async getSegmentBasedRecommendations(segment, limit = 10) {
    try {
      const segmentUsers = await this.getUsersBySegment(segment);
      const popularProducts =
        this.calculateSegmentPopularProducts(segmentUsers);

      return {
        segment,
        userCount: segmentUsers.length,
        popularProducts: popularProducts.slice(0, limit),
        trends: this.analyzeSegmentTrends(segmentUsers),
        benchmarks: this.calculateSegmentBenchmarks(segmentUsers),
      };
    } catch (error) {
      console.error("세그먼트 기반 추천 생성 실패:", error);
      throw error;
    }
  }

  static async getUsersBySegment(segment) {
    const usersQuery = query(
      collection(db, "users"),
      where("aiLearningData.userSegment", "==", segment),
      where("onboardingStatus.isCompleted", "==", true),
      limit(100)
    );

    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map((doc) => doc.data());
  }

  static calculateSegmentPopularProducts(segmentUsers) {
    const productPopularity = {};

    segmentUsers.forEach((user) => {
      const history = user.behaviorAnalytics?.recommendationHistory || [];
      history.forEach((interaction) => {
        if (["click", "save", "convert"].includes(interaction.action)) {
          interaction.products.forEach((product) => {
            const key = `${product.productType}_${product.bank}`;
            if (!productPopularity[key]) {
              productPopularity[key] = {
                ...product,
                count: 0,
                conversions: 0,
              };
            }
            productPopularity[key].count++;
            if (interaction.action === "convert") {
              productPopularity[key].conversions++;
            }
          });
        }
      });
    });

    return Object.values(productPopularity).sort((a, b) => b.count - a.count);
  }

  static analyzeSegmentTrends(segmentUsers) {
    const trends = {
      avgSatisfaction: 0,
      avgClickThroughRate: 0,
      commonGoals: {},
      preferredBanks: {},
    };

    let totalSatisfaction = 0;
    let totalClickThrough = 0;
    let validUsers = 0;

    segmentUsers.forEach((user) => {
      const satisfaction =
        user.behaviorAnalytics?.satisfactionData?.averageRating;
      const clickThrough =
        user.behaviorAnalytics?.interactionPatterns?.clickThrough?.rate;

      if (satisfaction) {
        totalSatisfaction += satisfaction;
        validUsers++;
      }

      if (clickThrough) {
        totalClickThrough += clickThrough;
      }

      const goal = user.searchableFields?.primaryGoal;
      if (goal) {
        trends.commonGoals[goal] = (trends.commonGoals[goal] || 0) + 1;
      }
    });

    trends.avgSatisfaction =
      validUsers > 0 ? totalSatisfaction / validUsers : 0;
    trends.avgClickThroughRate =
      segmentUsers.length > 0 ? totalClickThrough / segmentUsers.length : 0;

    return trends;
  }

  static calculateSegmentBenchmarks(segmentUsers) {
    const benchmarks = {
      topPerformers: segmentUsers.filter(
        (u) => u.behaviorAnalytics?.satisfactionData?.averageRating >= 4
      ).length,
      activeUsers: segmentUsers.filter(
        (u) =>
          u.behaviorAnalytics?.interactionPatterns?.clickThrough?.rate > 0.2
      ).length,
      conversionRate: this.calculateSegmentConversionRate(segmentUsers),
    };

    return benchmarks;
  }

  static calculateSegmentConversionRate(segmentUsers) {
    let totalViews = 0;
    let totalConversions = 0;

    segmentUsers.forEach((user) => {
      const history = user.behaviorAnalytics?.recommendationHistory || [];
      totalViews += history.filter((h) => h.action === "view").length;
      totalConversions += history.filter((h) => h.action === "convert").length;
    });

    return totalViews > 0 ? totalConversions / totalViews : 0;
  }
}
