import Link from "next/link";
import styles from "./page.module.css";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/support", label: "Support" },
];

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <nav className={styles.nav} aria-label="Main">
          <Link href="/" className={styles.wordmark}>
            SIDEQUEST
          </Link>
          <div className={styles.navLinks}>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className={styles.heroGrid}>
          <div className={styles.copy}>
            <p className={styles.kicker}>Plans with friends</p>
            <h1>Less group chat. More showing up.</h1>
            <p className={styles.lede}>
              Sidequest helps friends make lightweight plans, share a private
              invite link, and see who is going without another endless thread.
            </p>
            <div className={styles.actions}>
              <a
                href="https://testflight.apple.com/join/h425Mg6b"
                className={styles.primary}
                target="_blank"
                rel="noreferrer"
              >
                Get the app
              </a>
              <Link href="/support" className={styles.secondary}>
                Contact support
              </Link>
            </div>
          </div>

          <div className={styles.mock} aria-label="Sidequest plan preview">
            <div className={styles.mockTop}>
              <span>UPCOMING</span>
              <span>6 GOING</span>
            </div>
            <div className={styles.flaps}>
              {["0", "4", "h"].map((char) => (
                <span key={char} className={styles.flap}>
                  {char}
                </span>
              ))}
            </div>
            <h2>Rooftop sunset hangs</h2>
            <p>Cavalier Rooftop · Maya</p>
            <div className={styles.people}>
              {["A", "M", "D"].map((initial) => (
                <span key={initial}>{initial}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.info}>
        <div>
          <h2>Built for private invites</h2>
          <p>
            Shared plan pages are token-based and are not designed as public
            discovery pages.
          </p>
        </div>
        <div>
          <h2>Controls for social safety</h2>
          <p>
            Sidequest supports account deletion and is adding in-app reporting,
            blocking, and moderation workflows for public beta.
          </p>
        </div>
        <div>
          <h2>Support</h2>
          <p>
            For account, safety, or privacy questions, contact{" "}
            <a href="mailto:support@sidequest.app">support@sidequest.app</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
