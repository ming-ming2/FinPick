// finpick-front/src/hooks/useOnboarding.js
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserService } from "../services/userService";

export const useOnboarding = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveStep1 = async (basicInfoData) => {
    if (!user) return false;

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
  };

  const saveStep2 = async (investmentProfileData) => {
    if (!user) return false;

    setLoading(true);
    setError(null);

    try {
      await UserService.saveInvestmentProfile(user.uid, investmentProfileData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveStep3 = async (financialData) => {
    if (!user) return false;

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
  };

  const saveStep4 = async (goalsData) => {
    if (!user) return false;

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
  };

  return {
    saveStep1,
    saveStep2,
    saveStep3,
    saveStep4,
    loading,
    error,
  };
};
