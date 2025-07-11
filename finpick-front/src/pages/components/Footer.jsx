// finpick-front/src/components/Footer.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Instagram,
  Shield,
  FileText,
  HelpCircle,
  ExternalLink,
  Heart,
  Sparkles,
} from "lucide-react";

const Footer = ({
  variant = "default", // "default", "minimal", "landing"
  className = "",
}) => {
  const navigate = useNavigate();

  // 미니멀 푸터 (로그인 페이지 등)
  if (variant === "minimal") {
    return (
      <footer className={`py-8 border-t border-gray-800 ${className}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-xs">₩</span>
              </div>
              <span className="font-semibold">FinPick</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 FinPick. 모든 권리 보유.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // 랜딩 페이지용 풀 푸터
  if (variant === "landing") {
    return (
      <footer
        className={`bg-gray-900/50 border-t border-gray-800 ${className}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* 메인 푸터 콘텐츠 */}
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 브랜드 섹션 */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-sm">₩</span>
                </div>
                <span className="text-xl font-bold">FinPick</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                AI 기반 맞춤형 금융상품 추천 서비스. 복잡한 금융 시장에서
                당신만을 위한 최적의 투자 솔루션을 찾아드립니다.
              </p>

              {/* 소셜 미디어 */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Github className="w-5 h-5 text-gray-400" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Twitter className="w-5 h-5 text-gray-400" />
                </a>
                <a
                  href="#"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Instagram className="w-5 h-5 text-gray-400" />
                </a>
              </div>
            </div>

            {/* 서비스 */}
            <div>
              <h3 className="font-semibold mb-4 text-white">서비스</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => navigate("/recommendations")}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-left"
                  >
                    상품 추천
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-left"
                  >
                    대시보드
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/analytics")}
                    className="text-gray-400 hover:text-emerald-400 transition-colors text-left"
                  >
                    투자 분석
                  </button>
                </li>
                <li>
                  <a
                    href="#api"
                    className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center space-x-1"
                  >
                    <span>API</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* 지원 */}
            <div>
              <h3 className="font-semibold mb-4 text-white">지원</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#faq"
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a
                    href="#help"
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    도움말
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    고객 지원
                  </a>
                </li>
                <li>
                  <a
                    href="#blog"
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    블로그
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 법적 정보 & 연락처 */}
          <div className="py-6 border-t border-gray-800">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              {/* 법적 링크 */}
              <div className="flex flex-wrap items-center space-x-6">
                <a
                  href="#privacy"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center space-x-1"
                >
                  <Shield className="w-4 h-4" />
                  <span>개인정보처리방침</span>
                </a>
                <a
                  href="#terms"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center space-x-1"
                >
                  <FileText className="w-4 h-4" />
                  <span>이용약관</span>
                </a>
                <a
                  href="#cookies"
                  className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  쿠키 정책
                </a>
              </div>

              {/* 연락처 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@finpick.co.kr</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1588-0000</span>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 저작권 */}
          <div className="py-4 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <p className="text-sm text-gray-400">
                © 2024 FinPick. 모든 권리 보유.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-400" />
                <span>in Korea</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // 기본 앱 푸터 (간단한 버전)
  return (
    <footer className={`bg-gray-900/30 border-t border-gray-800 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-8">
          {/* 상단 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* 브랜드 */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-xs">₩</span>
                </div>
                <span className="font-semibold">FinPick</span>
              </div>
              <p className="text-sm text-gray-400">
                AI 기반 맞춤 금융상품 추천
              </p>
            </div>

            {/* 빠른 링크 */}
            <div>
              <h4 className="font-medium mb-3 text-white">빠른 링크</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    대시보드
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/mypage")}
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    마이페이지
                  </button>
                </li>
                <li>
                  <a
                    href="#help"
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    도움말
                  </a>
                </li>
              </ul>
            </div>

            {/* 고객지원 */}
            <div>
              <h4 className="font-medium mb-3 text-white">고객지원</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@finpick.co.kr</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <a
                    href="#faq"
                    className="hover:text-emerald-400 transition-colors"
                  >
                    자주 묻는 질문
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 섹션 */}
          <div className="pt-6 border-t border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <p className="text-xs text-gray-500">
                © 2024 FinPick. 모든 권리 보유.
              </p>
              <div className="flex space-x-4 text-xs">
                <a
                  href="#privacy"
                  className="text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  개인정보처리방침
                </a>
                <a
                  href="#terms"
                  className="text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  이용약관
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
