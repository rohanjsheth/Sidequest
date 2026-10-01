import { avatarColor, colors, font } from "@/lib/theme";
import { formatWhen, planStatus, type ShareEvent } from "@/lib/types";
import { Countdown } from "./Countdown";

// laid out like the app's plan/[id] screen: open on the blur, no card chrome
export function PlanCard({ event }: { event: ShareEvent }) {
  const host = event.host.name ?? "Someone";
  const hostColor = avatarColor(event.host.id);

  return (
    <div>
      <span
        style={{
          ...s.pill,
          background: event.cancelled ? colors.danger : colors.ink,
        }}
      >
        {planStatus(event)}
      </span>

      <h1 style={s.title}>{event.title}</h1>

      <div style={s.hostRow}>
        <span
          style={{ ...s.hostAvatar, background: hostColor.bg, color: hostColor.fg }}
        >
          {host[0]?.toUpperCase()}
        </span>
        <span style={s.hostText}>hosted by {host}</span>
      </div>

      {event.cancelled ? null : (
        <div style={{ marginTop: 18 }}>
          <Countdown startsAt={event.startsAt} />
        </div>
      )}

      <div style={s.goingCard}>
        <span style={s.goingLabel}>{event.going} going</span>
        <AvatarStack seed={event.id} count={Math.min(event.going, 5)} />
      </div>

      <div style={{ marginTop: 6 }}>
        <div style={s.detailRow}>
          <ClockIcon />
          <span style={s.timeBadge}>{formatWhen(event.startsAt)}</span>
        </div>
        <div style={{ ...s.detailRow, borderBottom: "none" }}>
          <PinIcon />
          <span style={s.detailText}>{event.location}</span>
        </div>
      </div>

      {event.description ? (
        <p style={s.description}>{event.description}</p>
      ) : null}
    </div>
  );
}

function AvatarStack({ seed, count }: { seed: string; count: number }) {
  if (count === 0) return null;
  return (
    <span style={{ display: "flex" }}>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: avatarColor(`${seed}${i}`).bg,
            border: `2px solid ${colors.fill}`,
            marginLeft: i === 0 ? 0 : -9,
          }}
        />
      ))}
    </span>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={colors.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

const s: Record<string, React.CSSProperties> = {
  pill: {
    display: "inline-block",
    fontFamily: font.mono,
    fontWeight: 600,
    fontSize: 9,
    letterSpacing: 0.75,
    color: colors.card,
    borderRadius: 4,
    padding: "3px 8px",
  },
  title: {
    fontFamily: font.sans,
    fontSize: 34,
    lineHeight: "36px",
    fontWeight: 700,
    letterSpacing: "-0.5px",
    color: colors.ink,
    marginTop: 14,
  },
  hostRow: { display: "flex", alignItems: "center", gap: 9, marginTop: 12 },
  hostAvatar: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: `1px solid ${colors.line}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: font.sans,
    fontSize: 9,
  },
  hostText: { fontFamily: font.sans, fontSize: 12, color: colors.muted },
  goingCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    background: colors.fill,
    border: `1px solid ${colors.rule}`,
    borderRadius: 20,
    padding: "16px 18px",
  },
  goingLabel: {
    fontFamily: font.sans,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.muted,
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: "13px 0",
    borderBottom: `1px solid ${colors.rule}`,
  },
  timeBadge: {
    fontFamily: font.mono,
    fontWeight: 500,
    fontSize: 12.5,
    color: colors.card,
    background: colors.ink,
    borderRadius: 5,
    padding: "3px 8px",
  },
  detailText: {
    flex: 1,
    fontFamily: font.sans,
    fontWeight: 600,
    fontSize: 12.5,
    color: colors.ink,
  },
  description: {
    fontFamily: font.sans,
    fontSize: 15,
    lineHeight: "24px",
    color: colors.text,
    marginTop: 14,
    whiteSpace: "pre-wrap",
  },
};
