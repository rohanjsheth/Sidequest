import type { Metadata } from "next";
import Link from "next/link";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Sidequest",
  description:
    "How Sidequest collects, uses, and protects account and plan data.",
};

export default function PrivacyPage() {
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
          <p className={styles.kicker}>Privacy Policy</p>
          <h1>How Sidequest handles your information.</h1>
          <p className={styles.updated}>Last updated: June 25, 2026</p>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Overview</h2>
            <div className={styles.body}>
              <p>
                Sidequest is a planning app for friends. We collect the
                information needed to create an account, show plans to the right
                people, let users RSVP, and operate the service.
              </p>
              <p>
                If you have privacy questions, contact{" "}
                <a href="mailto:rsheth990@gmail.com">rsheth990@gmail.com</a>.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Information we collect</h2>
            <div className={styles.body}>
              <ul>
                <li>
                  Account information, including your phone number and display
                  name.
                </li>
                <li>
                  Plan information you create or respond to, including titles,
                  typed locations, notes, timestamps, hosts, attendees, share
                  tokens, and RSVP status.
                </li>
                <li>
                  Friendship and invite information, such as friend requests,
                  accepted friends, event invites, and activity generated when
                  people respond to hosted plans.
                </li>
                <li>
                  Technical information needed to run the service, such as
                  authentication tokens, server logs, device or app diagnostics,
                  and push notification tokens if notifications are enabled.
                </li>
              </ul>
              <p>
                Sidequest does not request GPS location access. Locations in
                plans are text entered by users.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>How we use information</h2>
            <div className={styles.body}>
              <ul>
                <li>Verify accounts and keep users signed in.</li>
                <li>Create, display, share, and update plans and RSVPs.</li>
                <li>
                  Show friend lists, invitations, attendees, and activity.
                </li>
                <li>
                  Provide support, investigate abuse, and enforce our terms.
                </li>
                <li>Improve reliability, security, and product quality.</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Service providers</h2>
            <div className={styles.body}>
              <p>
                We use vendors to operate Sidequest, including hosting,
                database, analytics or diagnostics, and SMS verification
                providers. SMS verification is handled through Twilio Verify.
                These providers process information on our behalf so the service
                can function.
              </p>
              <p>
                We do not sell personal information. We do not use your content
                for third-party advertising.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Sharing and visibility</h2>
            <div className={styles.body}>
              <p>
                Plans may be visible to invited friends, hosts, attendees, and
                people who receive a private share link. Share links are
                token-based and are not intended as public discovery pages.
              </p>
              <p>
                Other users may see your display name, RSVP status, attendee
                status, and plan content where those features are part of the
                app experience.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Deletion and choices</h2>
            <div className={styles.body}>
              <p>
                You can delete your account in the app from the You tab by
                choosing Delete account. Deleting your account removes your
                profile, friendships, RSVPs, and hosted plans from the active
                service.
              </p>
              <p>
                You may also contact support for help with account, privacy, or
                safety requests.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Safety reports</h2>
            <div className={styles.body}>
              <p>
                If you see abusive, offensive, spammy, or unsafe content, email{" "}
                <a href="mailto:rsheth990@gmail.com">rsheth990@gmail.com</a>{" "}
                with the plan, user, and reason. We review safety reports and
                may remove content or restrict accounts.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Children</h2>
            <div className={styles.body}>
              <p>
                Sidequest is not intended for children under 13. If you believe
                a child provided personal information, contact support so we can
                review and delete it.
              </p>
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <span>Sidequest</span>
          <span>rsheth990@gmail.com</span>
        </footer>
      </div>
    </main>
  );
}
