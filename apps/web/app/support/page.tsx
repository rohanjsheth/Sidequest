import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Support | Sidequest",
  description: "Get help with Sidequest accounts, plans, privacy, and safety.",
};

export default function SupportPage() {
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
          <p className={styles.kicker}>Support</p>
          <h1>Help with Sidequest.</h1>
          <p className={styles.updated}>Last updated: June 25, 2026</p>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Contact</h2>
            <div className={styles.body}>
              <div className={styles.callout}>
                Email{" "}
                <a href="mailto:support@sidequest.app">support@sidequest.app</a>{" "}
                for account, privacy, safety, or product help.
              </div>
              <p>
                Include your phone number only if it is needed to find your
                account. Do not send verification codes, passwords, or sensitive
                personal documents.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Account access</h2>
            <div className={styles.body}>
              <p>
                Sidequest uses phone verification for sign-in. If you are not
                receiving a code, confirm the phone number is correct, wait a
                few minutes, and try again. If the issue continues, contact
                support.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Delete account</h2>
            <div className={styles.body}>
              <p>
                You can delete your account in the app from the You tab by
                choosing Delete account. This removes your profile, friendships,
                RSVPs, and hosted plans from the active service.
              </p>
              <p>
                If you cannot access the app, email support and ask for account
                deletion help.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Report abuse</h2>
            <div className={styles.body}>
              <p>
                To report harassment, hate, sexual content, spam, impersonation,
                unsafe plans, or other objectionable content, email{" "}
                <a href="mailto:support@sidequest.app">support@sidequest.app</a>
                .
              </p>
              <p>
                Include the plan title or share link, the user involved, what
                happened, and whether there is immediate safety risk. We review
                reports and may remove content, restrict features, or suspend
                accounts.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Privacy requests</h2>
            <div className={styles.body}>
              <p>
                For privacy questions or data requests, contact support. More
                detail is available in the{" "}
                <Link href="/privacy">Privacy Policy</Link>.
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
