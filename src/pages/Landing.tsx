import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>mathgames.win</h1>
      <p>Game launcher (coming next)</p>
      <div style={{ marginTop: 16 }}>
        <Link to="/games/number-sense-sprint">Number Sense Sprint</Link>
      </div>
      <div style={{ marginTop: 8 }}>
        <Link to="/games/coming-soon">Pattern Forge (coming soon)</Link>
      </div>
      <div style={{ marginTop: 8 }}>
        <Link to="/games/coming-soon">Factor Trails (coming soon)</Link>
      </div>
      <div style={{ marginTop: 16 }}>
        <Link to="/about">About</Link>
      </div>
    </div>
  );
}
