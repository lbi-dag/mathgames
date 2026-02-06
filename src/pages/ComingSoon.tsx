import { Link } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import pageShell from "../styles/PageShell.module.css";
import pageContent from "../styles/PageContent.module.css";
import styles from "../styles/ComingSoon.module.css";

export default function ComingSoon() {
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
            <h1 className={pageContent.heroTitle}>Coming Soon</h1>
            <p className={pageContent.heroCopy}>
              The next batch of Math Games is taking shape. Expect new drills that spotlight one skill at a
              time, with fast feedback loops and playful pacing.
            </p>
          </div>
          <div className={pageContent.card}>
            <h2 className={pageContent.cardTitle}>What we are building</h2>
            <p className={pageContent.cardBody}>
              Each new game starts as a tiny experiment: a single habit, a short loop, and a satisfying sense
              of progress in just a few minutes.
            </p>
          </div>
        </section>

        <section className={pageContent.gridAuto}>
          <div className={styles.milestone}>
            <h3>Pattern Forge</h3>
            <p>Practice spotting sequences and building rules with quick ramping challenges.</p>
          </div>
          <div className={styles.milestone}>
            <h3>More to come</h3>
            <p>We are testing a few surprise formats that blend logic, speed, and number sense.</p>
          </div>
        </section>

        <p className={pageContent.bodyNote}>
          Want to influence what ships next? Share ideas and classroom use cases, and we will prioritize the
          most-requested drills.
        </p>
    </SidebarLayout>
  );
}
