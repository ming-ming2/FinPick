import React, { useState } from "react";
import { Chrome, MessageCircle, Github, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const result = await loginWithEmail(email, password);
        console.log("로그인 성공:", result);
      } else {
        const result = await registerWithEmail(email, password, displayName);
        console.log("회원가입 성공:", result);
      }

      // 로그인 성공 시 온보딩으로 이동
      navigate("/onboarding/step1");
    } catch (error) {
      setError(error.message);
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await loginWithGoogle();
      console.log("Google 로그인 성공:", result);

      // 로그인 성공 시 온보딩으로 이동
      navigate("/onboarding/step1");
    } catch (error) {
      setError(error.message);
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-gray-900 font-bold text-2xl">₩</span>
            </div>
            <div>
              <div className="text-3xl font-bold">FinPick</div>
              <div className="text-sm text-gray-400">AI 금융 어드바이저</div>
            </div>
          </div>

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
