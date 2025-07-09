import React, { useState } from "react";
import { X, Sparkles, User, Check } from "lucide-react";

const NicknameModal = ({ isOpen, onClose, onSubmit }) => {
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsLoading(true);
    // 여기서 실제 API 호출하면 됨
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 가짜 로딩

    onSubmit(nickname.trim());
    setIsLoading(false);
  };

  const suggestedNicknames = [
    "돈모으는개미 🐜",
    "절약왕 👑",
    "투자초보 🌱",
    "재테크마스터 💎",
    "용돈벌이 🪙",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gray-900" />
            </div>
            <h2 className="text-xl font-bold text-white">환영합니다! 🎉</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-300 mb-2">
              마지막으로 닉네임을 설정해주세요
            </p>
            <p className="text-sm text-gray-400">언제든지 변경할 수 있어요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 닉네임 입력 */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력해주세요"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                maxLength="20"
                disabled={isLoading}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {nickname.length}/20
              </div>
            </div>

            {/* 추천 닉네임 */}
            <div>
              <p className="text-sm text-gray-400 mb-2">💡 추천 닉네임</p>
              <div className="flex flex-wrap gap-2">
                {suggestedNicknames.map((suggested, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setNickname(suggested)}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-sm text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    {suggested}
                  </button>
                ))}
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-700 rounded-xl text-gray-300 hover:bg-gray-800 transition-colors"
                disabled={isLoading}
              >
                나중에
              </button>
              <button
                type="submit"
                disabled={!nickname.trim() || isLoading}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                  nickname.trim() && !isLoading
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-900 hover:shadow-lg"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>저장중...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>완료</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NicknameModal;
