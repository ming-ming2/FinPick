import React from "react";
import { Chrome, MessageCircle, Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSocialLogin = (provider) => {
    console.log(`${provider} Firebase 로그인 시도`);
    // Firebase 로그인 로직 구현 예정
    // 성공 시 신규 사용자면 온보딩으로, 기존 사용자면 대시보드로
    navigate("/onboarding/step1");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-8">
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
              맞춤형 금융상품 추천
            </span>
          </h1>
          <p className="text-gray-400 leading-relaxed">
            3분만에 당신에게 딱 맞는
            <br />
            금융상품을 찾아드립니다
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin("google")}
            className="w-full bg-white text-gray-900 py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            <Chrome className="w-6 h-6" />
            <span>Google로 시작하기</span>
          </button>

          <button
            onClick={() => handleSocialLogin("kakao")}
            className="w-full bg-yellow-400 text-gray-900 py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-yellow-500 transition-all transform hover:scale-105 shadow-lg"
          >
            <MessageCircle className="w-6 h-6" />
            <span>카카오로 시작하기</span>
          </button>

          <button
            onClick={() => handleSocialLogin("github")}
            className="w-full bg-gray-800 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-3 hover:bg-gray-700 transition-all transform hover:scale-105 border border-gray-700"
          >
            <Github className="w-6 h-6" />
            <span>GitHub로 시작하기</span>
          </button>
        </div>

        {/* Features Preview */}
        <div className="mt-12 space-y-4">
          <div className="text-center text-sm text-gray-400 mb-6">
            로그인하면 바로 체험할 수 있어요
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-emerald-400 text-xl mb-1">⚡</div>
              <div className="text-xs text-gray-300">30초 추천</div>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-cyan-400 text-xl mb-1">🎯</div>
              <div className="text-xs text-gray-300">맞춤 분석</div>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="text-blue-400 text-xl mb-1">🛡️</div>
              <div className="text-xs text-gray-300">중립 추천</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            로그인하면 <span className="text-emerald-400">이용약관</span> 및
            <span className="text-emerald-400"> 개인정보처리방침</span>에 동의한
            것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
