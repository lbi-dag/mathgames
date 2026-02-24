import { Link } from "react-router-dom";
import styles from "../../styles/landing/LandingGallery.module.css";

export default function LandingGallery() {
  return (
    <section className={styles.gallery}>
      <article className={styles.card}>
        <div className={styles.thumb} aria-hidden="true">
          <span>&Sigma;</span>
        </div>
        <h2>Speed Arithmetic</h2>
        <p>Race the clock through bite-sized mental math. Choose Sprint or Survival and stack your best streak.</p>
        <Link to="/speed-arithmetic">
          <span>&#9654;</span>
          Play now
        </Link>
      </article>

      <article className={styles.card}>
        <div className={styles.thumb} aria-hidden="true">
          <svg className={styles.thumbIcon} viewBox="0 0 120 120" role="img" aria-label="">
            <defs>
              <linearGradient id="primeBadgeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent-deep)" />
                <stop offset="100%" stopColor="var(--mint)" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="40" fill="url(#primeBadgeGradient)" opacity="0.9" />
            <circle cx="60" cy="60" r="28" fill="var(--surface-elevated)" />
            <path
              d="M44 64l8-14 8 14 8-14"
              stroke="var(--violet)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h2>Factor Rush</h2>
        <p>Pick the three primes that multiply into the target number before time runs out.</p>
        <Link to="/factor-rush">
          <span>&#9654;</span>
          Play now
        </Link>
      </article>

      <article className={styles.card}>
        <div className={styles.thumb} aria-hidden="true">
          <span>
            2<sup>5</sup>
          </span>
        </div>
        <h2>Power Blitz</h2>
        <p>Start with squares and cubes, then race through higher powers as difficulty ramps up.</p>
        <Link to="/power-blitz">
          <span>&#9654;</span>
          Play now
        </Link>
      </article>
    </section>
  );
}
