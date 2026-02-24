import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import ComingSoon from "./pages/ComingSoon";
import FactorRush from "./pages/FactorRush";
import Landing from "./pages/Landing";
import PowerBlitz from "./pages/PowerBlitz";
import SpeedArithmetic from "./pages/SpeedArithmetic";
import Target24 from "./pages/Target24";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/speed-arithmetic" element={<SpeedArithmetic />} />
        <Route path="/factor-rush" element={<FactorRush />} />
        <Route path="/power-blitz" element={<PowerBlitz />} />
        <Route path="/target-24" element={<Target24 />} />

        <Route path="/games/number-sense-sprint" element={<Navigate to="/speed-arithmetic" replace />} />
        <Route path="/games/prime-factor-challenge" element={<Navigate to="/factor-rush" replace />} />
        <Route path="/games/exponent-sprint" element={<Navigate to="/power-blitz" replace />} />
        <Route path="/games/number-sense" element={<Navigate to="/speed-arithmetic" replace />} />
        <Route path="/games/exponent-practice" element={<Navigate to="/power-blitz" replace />} />
        <Route path="/games/speed-arithmetic" element={<Navigate to="/speed-arithmetic" replace />} />
        <Route path="/games/factor-rush" element={<Navigate to="/factor-rush" replace />} />
        <Route path="/games/power-blitz" element={<Navigate to="/power-blitz" replace />} />
        <Route path="/games/coming-soon" element={<ComingSoon />} />
      </Routes>
    </BrowserRouter>
  );
}
