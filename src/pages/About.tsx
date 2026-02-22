import { Link } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import pageShell from "../styles/PageShell.module.css";
import pageContent from "../styles/PageContent.module.css";
import styles from "../styles/About.module.css";

export default function About() {
  return (
    <SidebarLayout
      pageClassName={pageShell.pageShell}
      contentClassName={pageShell.content}
      sidebarAction={
        <Link className={styles.backLink} to="/">
          <span>&larr;</span>
          Back to Games
        </Link>
      }
    >
        <section className={pageContent.hero}>
          <div>
            <h1 className={pageContent.heroTitle}>About Math Games</h1>
            <p className={pageContent.heroCopy}>
              Math Games started as a tiny challenge: make practice feel as satisfying as play. What began as
              a weekend experiment in small classrooms has grown into a growing collection of micro-games that
              reward curiosity, speed, and grit.
            </p>
          </div>
          <div className={pageContent.card}>
            <h2 className={pageContent.cardTitle}>Our north star</h2>
            <p className={pageContent.cardBody}>
              Build a space where anyone can warm up, reset, and rediscover the joy of mental math without
              distractions. If it does not feel playful, it does not ship.
            </p>
          </div>
        </section>

        <section className={styles.timeline}>
          <h2>A brief history</h2>
          <div className={styles.entry}>
            <span>2025</span>
            <h3>First game online</h3>
            <p>The first Number Sense game, with a humble design, went online.</p>
          </div>

          <div className={styles.entry}>
            <span>Now</span>
            <h3>Growing the arcade</h3>
            <p>
              New games are in the pipeline, each built to spotlight a single math habit so players can feel
              mastery in minutes.
            </p>
          </div>
        </section>

        <section className={pageContent.gridAuto}>
          <div className={styles.valueCard}>
            <h3>Free &amp; open</h3>
            <p>Everything here is free to play and easy to share in class.</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Short sessions</h3>
            <p>Choose 1, 3, or 5-minute Sprint sessions that fit into busy days.</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Built for flow</h3>
            <p>Minimal friction, immediate feedback, and delightful pacing.</p>
          </div>
        </section>

        <p className={pageContent.bodyNote}>
          If you have ideas for new modes or want to collaborate, drop a note any time. Math Games is built in
          the open, and it grows with the community.
        </p>
    </SidebarLayout>
  );
}
