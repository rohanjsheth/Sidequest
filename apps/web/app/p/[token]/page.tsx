// Public share page → sidequest.app/p/<shareToken>
//
// Server Component: runs before HTML is sent, so the plan ships in the markup
// (good link previews) and only the RSVP bar/sheets are a client island.
// In Next 16, `params` is async — await it.

import type { Metadata } from "next";

import { PlanCard } from "@/components/share/PlanCard";
import { RsvpFlow } from "@/components/share/RsvpFlow";
import { colors, font } from "@/lib/theme";
import { MOCK_EVENT, type ShareEvent } from "@/lib/types";

type Props = { params: Promise<{ token: string }> };

// ── DATA SEAM (yours) ────────────────────────────────────────────────────────
// TODO(you): fetch the real event and drop the mock.
//   const res = await fetch(`${process.env.API_URL}/e/${token}`, { cache: "no-store" });
//   if (!res.ok) notFound();            // import { notFound } from "next/navigation"
//   return (await res.json()).event;
async function getEvent(token: string): Promise<ShareEvent> {
  void token;
  return MOCK_EVENT;
}
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const event = await getEvent(token);
  // TODO(you): once the fetch is real, set openGraph.images for a rich preview.
  return {
    title: `${event.title} · Sidequest`,
    description: event.description ?? "Plans with friends, minus the group chat.",
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const event = await getEvent(token);
  const host = event.host.name ?? "Someone";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: colors.surface,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440, padding: "20px 18px 40px" }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 13, letterSpacing: 3, fontWeight: 700 }}>SIDEQUEST</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "16px 0",
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#A0A0A0",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontFamily: font.sans,
              fontWeight: 600,
            }}
          >
            {host[0]?.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, color: colors.muted, fontFamily: font.sans }}>
            <b style={{ color: colors.ink }}>{host}</b> invited you to a plan
          </span>
        </div>

        <PlanCard event={event} />
        <RsvpFlow event={event} />

        <div
          style={{
            textAlign: "center",
            padding: "24px 0 0",
            fontSize: 11,
            color: colors.faint,
            lineHeight: 1.6,
          }}
        >
          Sidequest — plans with friends,
          <br />
          minus the group chat.
        </div>
      </div>
    </main>
  );
}
