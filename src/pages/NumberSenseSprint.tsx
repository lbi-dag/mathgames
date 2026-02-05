import { Link } from "react-router-dom";

export default function NumberSenseSprint() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Number Sense Sprint</h1>
      <p>Placeholder game screen. The full game UI will be migrated next.</p>
      <Link to="/">Back to games</Link>
    </div>
  );
}
