import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import ComingSoon from "./pages/ComingSoon";
import Landing from "./pages/Landing";
import NumberSenseSprint from "./pages/NumberSenseSprint";
import PrimeFactorChallenge from "./pages/PrimeFactorChallenge";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/games/number-sense-sprint" element={<NumberSenseSprint />} />
        <Route path="/games/prime-factor-challenge" element={<PrimeFactorChallenge />} />
        <Route path="/games/coming-soon" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  );
}
