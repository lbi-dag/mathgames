import { Link } from "react-router-dom";
import styles from "../../styles/landing/LandingGallery.module.css";

export default function LandingGallery() {
  return (
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

      <article className={styles.card}>
        <div className={styles.thumb} aria-hidden="true">
          <svg viewBox="0 0 120 120" role="img" aria-label="">
            <defs>
              <linearGradient id="primeBadgeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#c7f4d9" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="40" fill="url(#primeBadgeGradient)" opacity="0.9" />
            <circle cx="60" cy="60" r="28" fill="#fff7ef" />
            <path
              d="M44 64l8-14 8 14 8-14"
              stroke="#2b2f8f"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h2>Prime Factor Challenge</h2>
        <p>Pick the three primes that multiply into the target number before time runs out.</p>
        <Link to="/games/prime-factor-challenge">
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
  );
}
