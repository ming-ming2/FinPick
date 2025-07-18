// finpick-front/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/main/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import Onboarding from "./pages/onboarding/Onboarding";
import MyPage from "./pages/main/MyPage";
import ChatRecommendation from "./pages/main/ChatRecommendation";
import HowToUsePage from "./pages/main/HowToUsePage";

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
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/chat" element={<ChatRecommendation />} />
          <Route path="/recommendations" element={<ChatRecommendation />} />
          <Route path="/how-to-use" element={<HowToUsePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
