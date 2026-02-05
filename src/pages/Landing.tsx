import { Link } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import pageShell from "../styles/PageShell.module.css";
import styles from "../styles/Landing.module.css";

export default function Landing() {
  return (
    <SidebarLayout
      pageClassName={pageShell.pageShell}
      contentClassName={pageShell.content}
      sidebarClassName={styles.sidebarLarge}
      sidebarBody={
        <div className={styles.manifesto}>
          Math Games is a free (really), curious, no-ads playground for number lovers and classroom rebels.
          Build number sense, chase streaks, and learn by doing.
        </div>
      }
      sidebarAction={
        <Link className={styles.aboutLink} to="/about">
          <span>?</span>
          About Math Games
        </Link>
      }
    >
        <section className={styles.hero}>
          <h1>Playful drills. Serious growth.</h1>
          <p>Short, focused math games that warm up your brain in minutes. New games drop regularly.</p>
        </section>

        <section className={styles.gallery}>
          <article className={styles.card}>
            <div className={styles.thumb} aria-hidden="true">
              <span>&Sigma;</span>
            </div>
            <h2>Number Sense Sprint</h2>
            <p>Race the clock through bite-sized mental math. Choose Sprint or Survival and stack your best streak.</p>
            <Link to="/games/number-sense-sprint">
              <span>&#9654;</span>
              Play now
            </Link>
          </article>

          <article className={`${styles.card} ${styles.upcoming}`} aria-label="Coming soon game">
            <div className={`${styles.thumb} ${styles.thumbUpcoming}`} aria-hidden="true">
              <svg viewBox="0 0 140 140" role="img" aria-label="">
                <defs>
                  <linearGradient id="badgeGradientA" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2b2f8f" />
                    <stop offset="100%" stopColor="#ff7b3e" />
                  </linearGradient>
                </defs>
                <circle cx="70" cy="70" r="52" fill="url(#badgeGradientA)" opacity="0.9" />
                <circle cx="70" cy="70" r="38" fill="#fff7ef" />
                <path d="M45 72h50" stroke="#2b2f8f" strokeWidth="7" strokeLinecap="round" />
                <path d="M70 45v50" stroke="#2b2f8f" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </div>
            <h2>Pattern Forge</h2>
            <p>Practice spotting sequences and building rules. Coming soon.</p>
            <Link to="/games/coming-soon">
              <span>&#9654;</span>
              Learn more
            </Link>
            <div className={styles.tagline}>Badge preview</div>
          </article>

          <article className={`${styles.card} ${styles.upcoming}`} aria-label="Coming soon game">
            <div className={`${styles.thumb} ${styles.thumbUpcoming}`} aria-hidden="true">
              <svg viewBox="0 0 140 140" role="img" aria-label="">
                <defs>
                  <linearGradient id="badgeGradientB" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0b3a20" />
                    <stop offset="100%" stopColor="#c7f4d9" />
                  </linearGradient>
                </defs>
                <rect x="18" y="18" width="104" height="104" rx="24" fill="url(#badgeGradientB)" />
                <rect x="34" y="34" width="72" height="72" rx="18" fill="#fff7ef" />
                <path
                  d="M48 78l16-28 16 28 16-28"
                  stroke="#0b3a20"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <h2>Factor Trails</h2>
            <p>Hunt prime factor paths and build speed. Coming soon.</p>
            <Link to="/games/coming-soon">
              <span>&#9654;</span>
              Learn more
            </Link>
            <div className={styles.tagline}>Badge preview</div>
          </article>
        </section>

        <section className={styles.about} id="about">
          <div className={styles.aboutCard}>
            <div>
              <h2>About Math Games</h2>
              <p>
                Math Games is a tiny studio focused on fast, satisfying practice loops. No ads, no tracking,
                just playful drills that keep your brain sharp and your streaks alive.
              </p>
            </div>
            <div className={styles.aboutHighlights}>
              <div className={styles.highlight}>
                <h3>Free &amp; open</h3>
                <p>Everything here is free to play and easy to share in class.</p>
              </div>
              <div className={styles.highlight}>
                <h3>Short sessions</h3>
                <p>Each game is built for 2-5 minute bursts that fit into busy days.</p>
              </div>
              <div className={styles.highlight}>
                <h3>Built for flow</h3>
                <p>Minimal friction, immediate feedback, and delightful pacing.</p>
              </div>
            </div>
          </div>
        </section>
    </SidebarLayout>
  );
}
