// finpick-front/src/hooks/useRecommendations.js
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { RecommendationService } from "../services/RecommendationService";
import { UserService } from "../services/userService";

export const useRecommendations = (context = {}) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRecommendations = async (newContext = {}) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result =
        await RecommendationService.generatePersonalizedRecommendations(
          user.uid,
          { ...context, ...newContext }
        );
      setRecommendations(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const recordInteraction = async (
    recommendationId,
    products,
    action,
    metadata = {}
  ) => {
    if (!user) return;

    try {
      await UserService.recordRecommendationInteraction(
        user.uid,
        recommendationId,
        products,
        action,
        metadata
      );
    } catch (err) {
      console.error("상호작용 기록 실패:", err);
    }
  };

  const submitFeedback = async (recommendationId, rating, feedback = "") => {
    if (!user) return;

    try {
      await RecommendationService.recordUserFeedback(
        user.uid,
        recommendationId,
        rating,
        feedback
      );

      // 피드백 후 새로운 추천 생성
      await generateRecommendations();
    } catch (err) {
      setError(err.message);
    }
  };

  const getInsights = async () => {
    if (!user) return null;

    try {
      return await RecommendationService.getRecommendationInsights(user.uid);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  return {
    recommendations,
    loading,
    error,
    generateRecommendations,
    recordInteraction,
    submitFeedback,
    getInsights,
  };
};
