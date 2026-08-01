type CountdownUnit = {
  value: string;
  label: "DAYS" | "HRS" | "MIN";
};

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

function getTotalMinutes(startsAt: string, now: number) {
  return Math.max(0, Math.round((new Date(startsAt).getTime() - now) / 60000));
}

function twoDigits(n: number) {
  return String(n).padStart(2, "0");
}

export function compactCountdown(startsAt: string, now: number) {
  const totalMinutes = getTotalMinutes(startsAt, now);

  if (totalMinutes < MINUTES_PER_HOUR) {
    return { chars: [...String(totalMinutes), "m"], soon: true };
  }

  if (totalMinutes < MINUTES_PER_DAY) {
    return {
      chars: [...String(Math.floor(totalMinutes / MINUTES_PER_HOUR)), "h"],
      soon: false,
    };
  }

  return {
    chars: [...String(Math.floor(totalMinutes / MINUTES_PER_DAY)), "d"],
    soon: false,
  };
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "Today 7:30 PM" · "Tomorrow 7:30 PM" · "Fri 7:30 PM" */
export function formatWhen(startsAt: string, now = Date.now()) {
  const date = new Date(startsAt);
  const time = date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, today)) return `Today ${time}`;
  if (isSameDay(date, tomorrow)) return `Tomorrow ${time}`;

  const day = date.toLocaleString(undefined, { weekday: "short" });
  return `${day} ${time}`;
}

export function detailedCountdown(startsAt: string, now = Date.now()) {
  const totalMinutes = getTotalMinutes(startsAt, now);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);

  if (days > 0) {
    const hours = Math.floor(
      (totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR,
    );
    const pill = hours > 0 ? `IN ${days}D ${hours}H` : `IN ${days}D`;
    return {
      pill,
      units: [
        { value: twoDigits(days), label: "DAYS" },
        { value: twoDigits(hours), label: "HRS" },
      ] satisfies CountdownUnit[],
    };
  }

  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return {
    pill:
      totalMinutes < MINUTES_PER_HOUR
        ? `IN ${minutes} MIN · SOON`
        : `IN ${hours}H ${minutes}M`,
    units: [
      { value: twoDigits(hours), label: "HRS" },
      { value: twoDigits(minutes), label: "MIN" },
    ] satisfies CountdownUnit[],
  };
}
