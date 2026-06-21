import { colors, font } from "@/lib/theme";
import { formatWhen, planStatus, type ShareEvent } from "@/lib/types";
import { Countdown } from "./Countdown";

// Read-only plan — server-rendered (no interactivity), so it ships in the HTML
// for link previews. The interactive RSVP bar is a separate client island.
export function PlanCard({ event }: { event: ShareEvent }) {
  return (
    <div
      style={{
        background: colors.card,
        border: `1px solid ${colors.hair}`,
        borderRadius: 18,
        padding: "20px 20px 22px",
      }}
    >
      <span
        style={{
          fontSize: 9,
          letterSpacing: 1.5,
          background: colors.ink,
          color: "#fff",
          borderRadius: 4,
          padding: "3px 8px",
          fontWeight: 600,
        }}
      >
        {planStatus(event)}
      </span>

      <div
        style={{
          fontFamily: font.sans,
          fontSize: 27,
          lineHeight: 1.08,
          fontWeight: 700,
          letterSpacing: "-0.5px",
          marginTop: 13,
        }}
      >
        {event.title}
      </div>

      <div style={{ marginTop: 18 }}>
        <Countdown startsAt={event.startsAt} />
      </div>

      <div style={{ marginTop: 18 }}>
        <Row icon={<ClockIcon />}>{formatWhen(event.startsAt)}</Row>
        <Row icon={<PinIcon />}>{event.location}</Row>
        <Row icon={<AvatarStack />} last>
          {event.going} friends going
        </Row>
      </div>

      {event.description ? (
        <div
          style={{
            fontFamily: font.sans,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "#444",
            marginTop: 16,
          }}
        >
          {event.description}
        </div>
      ) : null}
    </div>
  );
}

function Row({
  icon,
  children,
  last,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        fontSize: 12.5,
        padding: "11px 0",
        borderTop: `1px solid ${colors.rule}`,
        borderBottom: last ? `1px solid ${colors.rule}` : undefined,
      }}
    >
      <span style={{ flex: "none", display: "flex" }}>{icon}</span>
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function AvatarStack() {
  const fills = ["#A0A0A0", "#8A9BA8", "#B0A48F"];
  return (
    <span style={{ display: "flex" }}>
      {fills.map((bg, i) => (
        <span
          key={i}
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: bg,
            border: "1.5px solid #fff",
            marginLeft: i === 0 ? 0 : -8,
          }}
        />
      ))}
    </span>
  );
}
