// Public share page → sidequest.app/p/<shareToken>
//
// This is a Server Component: it runs on the server before any HTML is sent, which
// is what lets us (a) emit per-event <meta og:*> tags for rich link previews, and
// (b) fetch the plan without shipping a loading spinner.
//
// In Next 16, `params` is async — you must await it.

import type { Metadata } from "next";

type Props = { params: Promise<{ token: string }> };

// ── DATA SEAM (yours) ────────────────────────────────────────────────────────
// TODO(you): fetch the public event by share token from the Hono API.
//   async function getEvent(token: string) {
//     const res = await fetch(`${process.env.API_URL}/e/${token}`, { cache: "no-store" });
//     if (!res.ok) return null;
//     return (await res.json()).event; // shape = EventDetail from @sidequest/shared
//   }
// Set API_URL in apps/web/.env.local (e.g. http://localhost:3000 in dev).
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  // TODO(you): const event = await getEvent(token); then build og:title /
  // og:description / og:image from it so the SMS preview shows the real plan.
  return { title: "Sidequest" };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;

  // TODO(you): const event = await getEvent(token); if (!event) notFound();
  // Then Claude fills in the design markup (read-only plan) and the client-side
  // RSVP → OTP → set-name → confirm flow lives in a sibling client component.

  return (
    <main>
      <p>Share page — token: {token}</p>
    </main>
  );
}
