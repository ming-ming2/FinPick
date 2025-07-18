// finpick-front/src/pages/auth/LoginPage.jsx
import React, { useState } from "react";
import { Chrome, MessageCircle, Github, Mail, Lock } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { UserService } from "../../services/userService";

import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
} from "../../services/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 온보딩 완료 상태 확인 함수
  const checkOnboardingStatus = async (user) => {
    try {
      console.log("👤 온보딩 상태 확인 중...", user.uid);

      const userProfile = await UserService.getUserProfile(user.uid);
      console.log("📋 조회된 사용자 프로필:", userProfile);

      if (!userProfile) {
        console.log("📝 신규 사용자 - 온보딩 필요");
        return false;
      }

      // 🔥 새로운 온보딩 완료 확인 (더 엄격한 검증)
      if (
        userProfile.onboardingAnswers &&
        Object.keys(userProfile.onboardingAnswers).length >= 5 && // 최소 5개 답변 필요
        userProfile.onboardingStatus?.isCompleted === true
      ) {
        console.log("✅ 새로운 온보딩 완료됨", {
          answersCount: Object.keys(userProfile.onboardingAnswers).length,
          isCompleted: userProfile.onboardingStatus?.isCompleted,
        });
        return true;
      }

      // 🔄 기존 온보딩 완료 확인 (하위 호환성)
      if (
        userProfile.onboardingStatus?.isCompleted === true ||
        (userProfile.basicInfo && userProfile.investmentProfile)
      ) {
        console.log("✅ 기존 온보딩 완료됨");
        return true;
      }

      console.log("📝 온보딩 미완료", {
        onboardingAnswers: !!userProfile.onboardingAnswers,
        answersCount: userProfile.onboardingAnswers
          ? Object.keys(userProfile.onboardingAnswers).length
          : 0,
        isCompleted: userProfile.onboardingStatus?.isCompleted,
        basicInfo: !!userProfile.basicInfo,
        investmentProfile: !!userProfile.investmentProfile,
      });
      return false;
    } catch (error) {
      console.error("❌ 온보딩 상태 확인 실패:", error);
      // 에러 시 안전하게 온보딩으로 이동
      return false;
    }
  };

  // 🎯 로그인 후 리다이렉트 결정
  const handlePostLoginRedirect = async (user) => {
    try {
      console.log("🎯 로그인 후 리다이렉트 처리 시작");

      // 🔥 Firebase 데이터 동기화를 위한 약간의 딜레이
      console.log("⏳ Firebase 데이터 동기화 대기...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 🔥 최대 3번까지 재시도
      let attempts = 0;
      let hasCompletedOnboarding = false;

      while (attempts < 3) {
        attempts++;
        console.log(`🔄 온보딩 상태 확인 시도 ${attempts}/3`);

        hasCompletedOnboarding = await checkOnboardingStatus(user);

        if (hasCompletedOnboarding) {
          break;
        }

        // 실패 시 1초 대기 후 재시도
        if (attempts < 3) {
          console.log("⏳ 1초 후 재시도...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(
        `🏁 최종 결과: hasCompletedOnboarding = ${hasCompletedOnboarding}`
      );

      if (hasCompletedOnboarding) {
        console.log("🏠 추천 화면으로 이동");
        navigate("/recommendations");
      } else {
        console.log("📝 온보딩 페이지로 이동");
        navigate("/onboarding");
      }
    } catch (error) {
      console.error("❌ 리다이렉트 처리 실패:", error);
      // 에러 시 안전하게 온보딩으로 이동
      console.log("🔄 에러로 인해 온보딩으로 이동");
      navigate("/onboarding");
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      if (isLogin) {
        result = await loginWithEmail(email, password);
        console.log("✅ 로그인 성공:", result);
      } else {
        result = await registerWithEmail(email, password, displayName);
        console.log("✅ 회원가입 성공:", result);
      }

      // 🔥 토큰 저장 확인
      const savedToken = localStorage.getItem("authToken");
      if (savedToken) {
        console.log("✅ 토큰 저장 확인:", savedToken.substring(0, 20) + "...");
      } else {
        console.warn("⚠️ 토큰이 저장되지 않았습니다.");
      }

      // 🔥 스마트 리다이렉트
      await handlePostLoginRedirect(result.user);
    } catch (error) {
      setError(error.message);
      console.error("❌ Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await loginWithGoogle();
      console.log("✅ Google 로그인 성공:", result);

      // 🔥 토큰 저장 확인
      const savedToken = localStorage.getItem("authToken");
      if (savedToken) {
        console.log(
          "✅ Google 토큰 저장 확인:",
          savedToken.substring(0, 20) + "..."
        );
      } else {
        console.warn("⚠️ Google 토큰이 저장되지 않았습니다.");
      }

      // 🔥 스마트 리다이렉트
      await handlePostLoginRedirect(result.user);
    } catch (error) {
      setError(error.message);
      console.error("❌ Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="items-center cursor-pointer">
            <div className="flex items-center justify-center space-x-1 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src="/logo.png"
                  alt="FinPick"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-3xl font-bold">FinPick</div>
                <div className="text-sm text-gray-400">AI 금융 어드바이저</div>
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold mb-3">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              {isLogin ? "로그인" : "회원가입"}
            </span>
          </h1>
          <p className="text-gray-400 leading-relaxed">
            {isLogin ? "계정에 로그인하세요" : "새 계정을 만들어보세요"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading Message */}
        {loading && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
            {isLogin ? "로그인 중..." : "회원가입 중..."}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          {!isLogin && (
            <div>
              <input
                type="text"
                placeholder="이름"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-400 text-white"
                required
              />
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-400 text-white"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-400 text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-950 text-gray-400">또는</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-900 py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-3 hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            <Chrome className="w-5 h-5" />
            <span>Google로 {isLogin ? "로그인" : "회원가입"}</span>
          </button>
        </div>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 hover:text-emerald-300 text-sm"
          >
            {isLogin
              ? "계정이 없으신가요? 회원가입"
              : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
