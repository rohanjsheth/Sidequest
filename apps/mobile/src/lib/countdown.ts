type CountdownUnit = {
  value: string;
  label: "DAYS" | "HRS" | "MIN";
};

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

function getTotalMinutes(startsAt: string, now: number) {
  return Math.max(
    0,
    Math.round((new Date(startsAt).getTime() - now) / 60000),
  );
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

export function detailedCountdown(startsAt: string, now = Date.now()) {
  const totalMinutes = getTotalMinutes(startsAt, now);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);

  if (days > 0) {
    const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
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
