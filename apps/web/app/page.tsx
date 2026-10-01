import Link from "next/link";
import styles from "./page.module.css";

const links = [
  { href: "/privacy", label: "privacy" },
  { href: "/terms", label: "terms" },
  { href: "/support", label: "support" },
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
            <p className={styles.kicker}>plans with friends</p>
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
              <span className={styles.pill}>in 4h 12m</span>
              <span>6 going</span>
            </div>
            <div className={styles.flaps}>
              <span className={styles.flap}>
                04<small>h</small>
              </span>
              <span className={styles.flap}>
                12<small>m</small>
              </span>
            </div>
            <h2>Rooftop sunset hangs</h2>
            <p>
              <span className={styles.time}>today 7:30 pm</span>
              Cavalier Rooftop
            </p>
            <div className={styles.people}>
              {[
                ["M", 212],
                ["A", 340],
                ["D", 28],
              ].map(([initial, hue]) => (
                <span
                  key={initial}
                  style={{
                    background: `hsl(${hue}, 70%, 92%)`,
                    color: `hsl(${hue}, 55%, 35%)`,
                  }}
                >
                  {initial}
                </span>
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
            Sidequest supports in-app reporting, blocking, and account deletion.
            Reported content and users are reviewed, and we remove content or
            restrict accounts that violate our terms.
          </p>
        </div>
        <div>
          <h2>Support</h2>
          <p>
            For account, safety, or privacy questions, contact{" "}
            <a href="mailto:rsheth990@gmail.com">rsheth990@gmail.com</a>.
          </p>
        </div>
      </section>
    </main>
  );
}
