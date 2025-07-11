import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/main/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import Step1BasicInfo from "./pages/onboarding/Step1BasicInfo";
import Step2InvestmentProfile from "./pages/onboarding/Step2InvestmentProfile";
import Step3FinancialStatus from "./pages/onboarding/Step3FinancialStatus";
import Step4Goals from "./pages/onboarding/Step4Goals";
import MyPage from "./pages/main/MyPage";
import ChatRecommendation from "./pages/main/ChatRecommendation";
// 스크롤 초기화 컴포넌트
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding/step1" element={<Step1BasicInfo />} />
          <Route
            path="/onboarding/step2"
            element={<Step2InvestmentProfile />}
          />
          <Route path="/onboarding/step3" element={<Step3FinancialStatus />} />
          <Route path="/onboarding/step4" element={<Step4Goals />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/chat" element={<ChatRecommendation />} />
          <Route path="/recommendations" element={<ChatRecommendation />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
