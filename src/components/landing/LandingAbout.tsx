import styles from "../../styles/landing/LandingAbout.module.css";

export default function LandingAbout() {
  return (
    <section className={styles.about} id="about">
      <div className={styles.aboutCard}>
        <div>
          <h2>About Math Games</h2>
          <p>
            Math Games is a tiny studio focused on fast, satisfying practice loops. No ads, no tracking, just
            playful drills that keep your brain sharp and your streaks alive.
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
  );
}
