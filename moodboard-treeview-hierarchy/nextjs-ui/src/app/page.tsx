import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          <a href="/pulse">
            <code className={styles.code}>Goto the dashboard</code>
          </a>
        </p>
        <div>
          <a
            href="/pulse"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/inhabitr-new-logo.jpg"
              alt="Inhabitr Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center} style={{fontSize: 40}}>
        Moodboard Hierarchy
      </div>

      <div className={styles.grid}>
        <a
          href="https://bitbucket.org/Inhabitr/moodboard-treeview-hierarchy/src/master/flask-app/"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Repo <span>-&gt;</span>
          </h2>
          <p>Find information about moodboard hierarchy features and API.</p>
        </a>
      </div>
    </main>
  );
}
