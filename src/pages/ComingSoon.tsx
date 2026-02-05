import { Link } from "react-router-dom";

export default function ComingSoon() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Coming Soon</h1>
      <p>This game is in the pipeline. Check back soon.</p>
      <Link to="/">Back to games</Link>
    </div>
  );
}
