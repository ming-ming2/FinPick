// finpick-front/src/components/layout/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src="/logo.png"
                alt="FinPick"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold">FinPick</span>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            AI 기반 맞춤형 금융상품 추천 서비스
          </p>
          <p className="text-gray-500 text-xs">
            © 2025 FinPick. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
