import { Link } from "react-router-dom";

export default function About() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>About Math Games</h1>
      <p>
        Placeholder about page. This will be replaced with the full layout from the
        existing static site.
      </p>
      <Link to="/">Back to games</Link>
    </div>
  );
}
