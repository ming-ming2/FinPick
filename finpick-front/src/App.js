import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/main/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import Step1BasicInfo from "./pages/onboarding/Step1BasicInfo";
import Step2InvestmentProfile from "./pages/onboarding/Step2InvestmentProfile";
import Step3FinancialStatus from "./pages/onboarding/Step3FinancialStatus";
import Step4Goals from "./pages/onboarding/Step4Goals";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding/step1" element={<Step1BasicInfo />} />
        <Route path="/onboarding/step2" element={<Step2InvestmentProfile />} />
        <Route path="/onboarding/step3" element={<Step3FinancialStatus />} />
        <Route path="/onboarding/step4" element={<Step4Goals />} />
      </Routes>
    </Router>
  );
}

export default App;
