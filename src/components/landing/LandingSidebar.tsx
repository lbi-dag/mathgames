import { Link } from "react-router-dom";
import styles from "../../styles/landing/LandingSidebar.module.css";

export function LandingSidebarBody() {
  return (
    <div className={styles.manifesto}>
      Math Games is a free (really), curious, no-ads playground for number lovers and classroom rebels. Build
      number sense, chase streaks, and learn by doing.
    </div>
  );
}

export function LandingSidebarAction() {
  return (
    <Link className={styles.aboutLink} to="/about">
      <span>?</span>
      About Math Games
    </Link>
  );
}
