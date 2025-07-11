//finpick-front/src/hooks/useOnboarding.js
import { useState, useCallback } from "react";
import { UserService } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";

export const useOnboarding = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveStep1 = useCallback(
    async (basicInfoData) => {
      if (!user) throw new Error("로그인이 필요합니다");

      setLoading(true);
      setError(null);

      try {
        await UserService.saveBasicInfo(user.uid, basicInfoData);
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const saveStep2 = useCallback(
    async (investmentData) => {
      if (!user) throw new Error("로그인이 필요합니다");

      setLoading(true);
      setError(null);

      try {
        await UserService.saveInvestmentProfile(user.uid, investmentData);
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const saveStep3 = useCallback(
    async (financialData) => {
      if (!user) throw new Error("로그인이 필요합니다");

      setLoading(true);
      setError(null);

      try {
        await UserService.saveFinancialStatus(user.uid, financialData);
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const saveStep4 = useCallback(
    async (goalsData) => {
      if (!user) throw new Error("로그인이 필요합니다");

      setLoading(true);
      setError(null);

      try {
        await UserService.saveInvestmentGoals(user.uid, goalsData);
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    saveStep1,
    saveStep2,
    saveStep3,
    saveStep4,
    loading,
    error,
  };
};
