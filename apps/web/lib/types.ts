// Mirrors the public GET /e/:shareToken response from apps/api.
// TODO(you): promote to @sidequest/shared when you wire the real fetch.

export type Host = { id: string; name: string | null; avatarUrl: string | null };

export type ShareEvent = {
  id: string;
  title: string;
  location: string;
  description: string | null;
  imageUrl: string | null;
  startsAt: string; // ISO
  cancelled: boolean;
  shareToken: string;
  host: Host;
  going: number;
};

// The little status chip on the plan card.
export function planStatus(e: { cancelled: boolean; startsAt: string }): string {
  if (e.cancelled) return "CANCELLED";
  const t = new Date(e.startsAt).getTime();
  const mins = Math.round((t - Date.now()) / 60000);
  if (mins < 0) return "ENDED";
  if (mins < 120) return `IN ${mins} MIN · SOON`;
  return "UPCOMING";
}

// "Today · 6:30 PM" / "Sat Jun 21 · 6:30 PM"
export function formatWhen(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const day = sameDay
    ? "Today"
    : d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return `${day} · ${time}`;
}

// TODO(you): delete once the real GET /e/:token fetch lands in page.tsx.
export const MOCK_EVENT: ShareEvent = {
  id: "evt_1",
  title: "Rooftop Sunset Hangs",
  location: "Cavalier Rooftop, SF",
  description:
    "Golden hour on the roof before it gets cold. Bring a layer — speaker and playlist handled.",
  imageUrl: null,
  startsAt: new Date(Date.now() + 45 * 60_000).toISOString(),
  cancelled: false,
  shareToken: "SQ-9F2K",
  host: { id: "u_maya", name: "Maya", avatarUrl: null },
  going: 6,
};
