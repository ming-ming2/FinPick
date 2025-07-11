// finpick-front/src/components/layout/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800/50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">₩</span>
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
