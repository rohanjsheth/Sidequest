import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | Sidequest",
  description: "The rules for using Sidequest.",
};

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.nav} aria-label="Legal">
          <Link href="/" className={styles.wordmark}>
            SIDEQUEST
          </Link>
          <div className={styles.navLinks}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/support">Support</Link>
          </div>
        </nav>

        <header className={styles.hero}>
          <p className={styles.kicker}>Terms of Service</p>
          <h1>The rules for using Sidequest.</h1>
          <p className={styles.updated}>Last updated: June 25, 2026</p>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Agreement</h2>
            <div className={styles.body}>
              <p>
                These terms govern your use of Sidequest. By creating an account
                or using the app, you agree to these terms and our{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </p>
              <p>
                If you do not agree, do not use Sidequest. Contact{" "}
                <a href="mailto:support@sidequest.app">support@sidequest.app</a>{" "}
                with questions.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Your account</h2>
            <div className={styles.body}>
              <p>
                You are responsible for activity on your account and for keeping
                access to your phone number secure. Use accurate information and
                do not impersonate another person.
              </p>
              <p>
                You can delete your account in the app from the You tab. Account
                deletion removes your profile, friendships, RSVPs, and hosted
                plans from the active service.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>User content</h2>
            <div className={styles.body}>
              <p>
                You are responsible for plan titles, notes, typed locations,
                names, RSVPs, and other content you submit. You give Sidequest
                permission to host, display, transmit, and process that content
                so the service can work.
              </p>
              <p>
                Do not post content that is illegal, harassing, hateful,
                sexually exploitative, threatening, invasive of privacy,
                misleading, spammy, or otherwise unsafe.
              </p>
              <p>
                Sidequest has zero tolerance for objectionable content and
                abusive behavior. Content or users that violate these rules may
                be removed without notice.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Acceptable use</h2>
            <div className={styles.body}>
              <ul>
                <li>
                  Do not use Sidequest to harass, threaten, or abuse others.
                </li>
                <li>
                  Do not share private information about another person without
                  permission.
                </li>
                <li>Do not spam invites, friend requests, or share links.</li>
                <li>
                  Do not try to access accounts, plans, or systems you are not
                  allowed to access.
                </li>
                <li>
                  Do not interfere with Sidequest security, reliability, or
                  abuse-prevention systems.
                </li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Moderation</h2>
            <div className={styles.body}>
              <p>
                We may remove content, restrict features, suspend accounts, or
                delete accounts if we believe a user has violated these terms,
                created safety risk, or misused the service.
              </p>
              <p>
                You can report a plan from inside the app using the ⋯ menu, or
                email{" "}
                <a href="mailto:support@sidequest.app">support@sidequest.app</a>{" "}
                with the relevant details. We review reports within 24 hours and
                remove content or users that violate these terms.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Availability</h2>
            <div className={styles.body}>
              <p>
                Sidequest may change, pause, or discontinue features. We aim to
                keep the service reliable, but we do not promise uninterrupted
                availability or error-free operation.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Disclaimers</h2>
            <div className={styles.body}>
              <p>
                Sidequest helps people coordinate plans, but users are
                responsible for their own decisions, safety, transportation, and
                conduct when attending events. Sidequest is provided as is to
                the extent allowed by law.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Changes</h2>
            <div className={styles.body}>
              <p>
                We may update these terms. If changes are material, we will take
                reasonable steps to notify users. Continued use of Sidequest
                after an update means you accept the updated terms.
              </p>
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <span>Sidequest</span>
          <span>support@sidequest.app</span>
        </footer>
      </div>
    </main>
  );
}
