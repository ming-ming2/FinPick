// finpick-front/src/pages/portfolio/PortfolioBuilderPage.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Calculator,
  PiggyBank,
  CreditCard,
  Target,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Home,
  TrendingUp,
  Zap,
  Building2,
  Wallet,
  Filter,
  X,
  ChevronUp,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PortfolioService } from "../../services/portfolioService";

const PortfolioBuilderPage = () => {
  const navigate = useNavigate();
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showPortfolio, setShowPortfolio] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProducts.length > 0) {
      const value = PortfolioService.calculatePortfolioValue(
        selectedProducts,
        36
      );
      setPortfolioValue(value);
    } else {
      setPortfolioValue(null);
    }
  }, [selectedProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await PortfolioService.getAllProducts();
      setAvailableProducts(products);
    } catch (error) {
      console.error("상품 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product) => {
    if (selectedProducts.find((p) => p.id === product.id)) return;

    setSelectedProducts((prev) => [
      ...prev,
      {
        ...product,
        monthlyAmount: product.monthlyAmount || 300000,
      },
    ]);
    setShowPortfolio(true);
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateMonthlyAmount = (productId, amount) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, monthlyAmount: amount } : p
      )
    );
  };

  const getFilteredProducts = () => {
    if (activeCategory === "all") return availableProducts;
    return availableProducts.filter((p) => p.type === activeCategory);
  };

  const categories = [
    {
      id: "all",
      name: "전체",
      icon: Building2,
      color: "emerald",
      count: availableProducts.length,
    },
    {
      id: "정기예금",
      name: "예금",
      icon: PiggyBank,
      color: "blue",
      count: availableProducts.filter((p) => p.type === "정기예금").length,
    },
    {
      id: "적금",
      name: "적금",
      icon: Target,
      color: "purple",
      count: availableProducts.filter((p) => p.type === "적금").length,
    },
    {
      id: "신용대출",
      name: "대출",
      icon: CreditCard,
      color: "orange",
      count: availableProducts.filter((p) => p.type === "신용대출").length,
    },
  ];

  const formatAmount = (amount) => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만원`;
    return `${amount.toLocaleString()}원`;
  };

  const formatRate = (rate) => {
    return rate ? `${rate.toFixed(2)}%` : "문의";
  };

  const getProductIcon = (type) => {
    switch (type) {
      case "정기예금":
        return PiggyBank;
      case "적금":
        return Target;
      case "신용대출":
        return CreditCard;
      default:
        return Wallet;
    }
  };

  const getProductTheme = (type) => {
    switch (type) {
      case "정기예금":
        return {
          bg: "from-blue-500/10 to-blue-600/5",
          border: "border-blue-400/20 hover:border-blue-400/40",
          icon: "bg-blue-500/20 text-blue-400",
          rate: "bg-blue-500/10 border-blue-400/30 text-blue-400",
          button:
            "bg-blue-500/10 hover:bg-blue-500/20 border-blue-400/30 text-blue-400",
        };
      case "적금":
        return {
          bg: "from-purple-500/10 to-purple-600/5",
          border: "border-purple-400/20 hover:border-purple-400/40",
          icon: "bg-purple-500/20 text-purple-400",
          rate: "bg-purple-500/10 border-purple-400/30 text-purple-400",
          button:
            "bg-purple-500/10 hover:bg-purple-500/20 border-purple-400/30 text-purple-400",
        };
      case "신용대출":
        return {
          bg: "from-orange-500/10 to-orange-600/5",
          border: "border-orange-400/20 hover:border-orange-400/40",
          icon: "bg-orange-500/20 text-orange-400",
          rate: "bg-orange-500/10 border-orange-400/30 text-orange-400",
          button:
            "bg-orange-500/10 hover:bg-orange-500/20 border-orange-400/30 text-orange-400",
        };
      default:
        return {
          bg: "from-gray-500/10 to-gray-600/5",
          border: "border-gray-400/20 hover:border-gray-400/40",
          icon: "bg-gray-500/20 text-gray-400",
          rate: "bg-gray-500/10 border-gray-400/30 text-gray-400",
          button:
            "bg-gray-500/10 hover:bg-gray-500/20 border-gray-400/30 text-gray-400",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* 모바일 헤더 */}
      <div className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>

            <h1 className="text-lg font-bold text-white">포트폴리오 빌더</h1>

            <button
              onClick={() => setShowPortfolio(!showPortfolio)}
              className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 relative"
            >
              <BarChart3 className="w-5 h-5" />
              {selectedProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {selectedProducts.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* 메인 컨텐츠 */}
        <div className="px-4 py-6">
          {/* 카테고리 필터 */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                  <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded">
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 상품 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getFilteredProducts().map((product) => {
              const IconComponent = getProductIcon(product.type);
              const theme = getProductTheme(product.type);
              const isSelected = selectedProducts.find(
                (p) => p.id === product.id
              );

              return (
                <div
                  key={`${product.id}-${product.bank}-${product.name}`}
                  onClick={() => !isSelected && addProduct(product)}
                  className={`relative p-4 rounded-2xl bg-gradient-to-br ${
                    theme.bg
                  } border ${theme.border} transition-all duration-300 ${
                    isSelected
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:scale-105 hover:shadow-xl active:scale-95"
                  }`}
                >
                  {/* 선택됨 표시 */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-900">✓</span>
                    </div>
                  )}

                  {/* 아이콘 & 금리 */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${theme.icon} flex items-center justify-center`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {product.hasRateInfo && (
                      <div
                        className={`px-2 py-1 rounded-lg border text-xs font-bold ${theme.rate}`}
                      >
                        {formatRate(product.interestRate)}
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="mb-3">
                    <h3 className="font-bold text-white text-sm leading-tight mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-1">{product.bank}</p>
                    <p className="text-xs text-gray-500">{product.period}</p>
                  </div>

                  {/* 추가 버튼 */}
                  {!isSelected && (
                    <button
                      className={`w-full py-2 rounded-lg border transition-all text-xs font-medium flex items-center justify-center space-x-1 ${theme.button}`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>추가</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 포트폴리오 사이드바 (모바일에서는 바텀시트) */}
        <div
          className={`fixed inset-x-0 bottom-0 z-40 transform transition-transform duration-300 ${
            showPortfolio ? "translate-y-0" : "translate-y-full"
          } lg:translate-y-0 lg:fixed lg:top-0 lg:right-0 lg:bottom-0 lg:w-96 lg:inset-x-auto`}
        >
          <div className="bg-gray-900 border-t border-gray-800 lg:border-t-0 lg:border-l rounded-t-3xl lg:rounded-none h-[70vh] lg:h-full flex flex-col">
            {/* 핸들 바 (모바일 전용) */}
            <div className="lg:hidden flex justify-center pt-2 pb-4">
              <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
            </div>

            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white">내 포트폴리오</h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                  {selectedProducts.length}
                </span>
                <button
                  onClick={() => setShowPortfolio(false)}
                  className="lg:hidden p-1 text-gray-400 hover:text-white"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* 포트폴리오 요약 */}
              {portfolioValue && (
                <div className="p-4 border-b border-gray-800">
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">3년 후 예상</p>
                    <p className="text-2xl font-bold text-white">
                      {formatAmount(portfolioValue.netWorth)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-emerald-400">
                          총 자산
                        </span>
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      </div>
                      <p className="text-sm font-bold text-white">
                        {formatAmount(portfolioValue.totalAssets)}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-800/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">월 흐름</span>
                        {portfolioValue.monthlyFlow >= 0 ? (
                          <ArrowUp className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                      <p
                        className={`text-sm font-bold ${
                          portfolioValue.monthlyFlow >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {formatAmount(Math.abs(portfolioValue.monthlyFlow))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 선택된 상품들 */}
              <div className="p-4">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">상품을 선택해주세요</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedProducts.map((product) => {
                      const theme = getProductTheme(product.type);

                      return (
                        <div
                          key={`portfolio-${product.id}-${Date.now()}`}
                          className="p-3 rounded-xl bg-gray-800/50 border border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white text-sm truncate">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-400">
                                {product.bank}
                              </p>
                            </div>
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400">
                                월 납입
                              </span>
                              <span className="text-sm font-bold text-emerald-400">
                                {formatAmount(product.monthlyAmount)}
                              </span>
                            </div>

                            <input
                              type="range"
                              min={product.minAmount || 100000}
                              max={product.maxAmount || 2000000}
                              step={100000}
                              value={product.monthlyAmount}
                              onChange={(e) =>
                                updateMonthlyAmount(
                                  product.id,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
                            />

                            <div className="flex justify-between text-xs text-gray-500">
                              <span>
                                {formatAmount(product.minAmount || 100000)}
                              </span>
                              <span>
                                {formatAmount(product.maxAmount || 2000000)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 오버레이 (모바일) */}
        {showPortfolio && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowPortfolio(false)}
          />
        )}
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #10b981, #06b6d4);
          cursor: pointer;
          border: 2px solid #111827;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #10b981, #06b6d4);
          cursor: pointer;
          border: 2px solid #111827;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        /* 스크롤바 숨기기 */
        ::-webkit-scrollbar {
          display: none;
        }
        
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PortfolioBuilderPage;
