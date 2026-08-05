// chrome strings are written lowercase here rather than lowercased in a style, so
// that no `textTransform` exists anywhere that could catch a user's own words.
type CountdownUnit = {
  value: string;
  label: "days" | "hrs" | "min";
};

type CompactCountdownUnit = {
  value: string;
  label: "d" | "h" | "m";
};

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

function getTotalMinutes(startsAt: string, now: number) {
  return Math.max(0, Math.round((new Date(startsAt).getTime() - now) / 60000));
}

function twoDigits(n: number) {
  return String(n).padStart(2, "0");
}

// both units are always padded, so the two tiles stay the same width. rolls over
// to days past 24h — a plan three days out reads as "03d 06h", not "78h"
export function compactCountdown(startsAt: string, now: number) {
  const totalMinutes = getTotalMinutes(startsAt, now);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);

  const units: CompactCountdownUnit[] =
    days > 0
      ? [
          { value: twoDigits(days), label: "d" },
          {
            value: twoDigits(
              Math.floor((totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR),
            ),
            label: "h",
          },
        ]
      : [
          {
            value: twoDigits(Math.floor(totalMinutes / MINUTES_PER_HOUR)),
            label: "h",
          },
          { value: twoDigits(totalMinutes % MINUTES_PER_HOUR), label: "m" },
        ];

  return { units, soon: totalMinutes < MINUTES_PER_HOUR };
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "today 7:30 pm" · "tomorrow 7:30 pm" · "fri 7:30 pm" */
export function formatWhen(startsAt: string, now = Date.now()) {
  const date = new Date(startsAt);
  // toLocaleString decides the meridiem's case for us, so lower it here — this is
  // our string, not the user's
  const time = date
    .toLocaleString(undefined, { hour: "numeric", minute: "2-digit" })
    .toLowerCase();

  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, today)) return `today ${time}`;
  if (isSameDay(date, tomorrow)) return `tomorrow ${time}`;

  const day = date
    .toLocaleString(undefined, { weekday: "short" })
    .toLowerCase();
  return `${day} ${time}`;
}

export function detailedCountdown(startsAt: string, now = Date.now()) {
  const totalMinutes = getTotalMinutes(startsAt, now);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);

  if (days > 0) {
    const hours = Math.floor(
      (totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR,
    );
    const pill = hours > 0 ? `in ${days}d ${hours}h` : `in ${days}d`;
    return {
      pill,
      units: [
        { value: twoDigits(days), label: "days" },
        { value: twoDigits(hours), label: "hrs" },
      ] satisfies CountdownUnit[],
    };
  }

  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return {
    pill:
      totalMinutes < MINUTES_PER_HOUR
        ? `in ${minutes} min · soon`
        : `in ${hours}h ${minutes}m`,
    units: [
      { value: twoDigits(hours), label: "hrs" },
      { value: twoDigits(minutes), label: "min" },
    ] satisfies CountdownUnit[],
  };
}
