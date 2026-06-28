export type Host = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

export type ShareEvent = {
  id: string;
  title: string;
  location: string;
  description: string | null;
  imageUrl: string | null;
  startsAt: string;
  cancelled: boolean;
  shareToken: string;
  host: Host;
  going: number;
};

export function planStatus(e: {
  cancelled: boolean;
  startsAt: string;
}): string {
  if (e.cancelled) return "CANCELLED";
  const t = new Date(e.startsAt).getTime();
  const mins = Math.round((t - Date.now()) / 60000);
  if (mins < 0) return "ENDED";
  if (mins < 120) return `IN ${mins} MIN · SOON`;
  return "UPCOMING";
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const day = sameDay
    ? "Today"
    : d.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
  return `${day} · ${time}`;
}
