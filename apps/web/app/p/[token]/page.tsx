import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { PlanCard } from "@/components/share/PlanCard";
import { RsvpFlow } from "@/components/share/RsvpFlow";
import { api, ApiError } from "@/lib/api";
import { colors, font } from "@/lib/theme";
import { formatWhen, type ShareEvent } from "@/lib/types";

type Props = { params: Promise<{ token: string }> };

const getEvent = cache(async (token: string): Promise<ShareEvent> => {
  try {
    const { event } = await api<{ event: ShareEvent }>(`/e/${token}`);
    return event;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const event = await getEvent(token);
  return {
    title: `${event.title} · Sidequest`,
    description:
      event.description ?? "Plans with friends, minus the group chat.",
    openGraph: {
      title: event.title,
      description: `${formatWhen(event.startsAt)} · ${event.location}`,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const event = await getEvent(token);

  return (
    <main style={{ minHeight: "100vh", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 440, padding: "22px 24px 40px" }}>
        <div style={{ paddingBottom: 26 }}>
          <a
            href="/"
            style={{
              fontFamily: font.mono,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 3.5,
              color: colors.ink,
            }}
          >
            SIDEQUEST
          </a>
        </div>

        <PlanCard event={event} />
        <RsvpFlow event={event} />

        <div
          style={{
            textAlign: "center",
            padding: "28px 0 0",
            fontFamily: font.sans,
            fontSize: 11,
            color: colors.faint,
            lineHeight: 1.6,
          }}
        >
          sidequest — plans with friends,
          <br />
          minus the group chat.
        </div>
      </div>
    </main>
  );
}
