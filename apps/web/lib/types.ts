import { detailedCountdown } from "./countdown";

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

// chrome is written lowercase at the source, same as mobile's lib/countdown.ts
export function planStatus(e: {
  cancelled: boolean;
  startsAt: string;
}): string {
  if (e.cancelled) return "cancelled";
  if (new Date(e.startsAt).getTime() < Date.now()) return "ended";
  return detailedCountdown(e.startsAt).pill;
}

export { formatWhen } from "./countdown";
