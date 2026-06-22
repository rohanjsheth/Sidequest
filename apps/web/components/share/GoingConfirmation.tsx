import { colors, font } from "@/lib/theme";
import { formatWhen, type ShareEvent } from "@/lib/types";

export function GoingConfirmation({ event }: { event: ShareEvent }) {
  const host = event.host.name ?? "Your host";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 28px 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: colors.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "sq-pop 0.45s cubic-bezier(0.2, 0.8, 0.2, 1.4) both",
        }}
      >
        <Check size={32} stroke="#fff" animate />
      </div>

      <div
        style={{
          fontFamily: font.sans,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.5px",
          marginTop: 20,
        }}
      >
        You&rsquo;re going!
      </div>

      <div style={{ fontSize: 13, color: colors.muted, lineHeight: 1.6, marginTop: 10 }}>
        <b style={{ color: colors.ink, fontFamily: font.sans }}>{event.title}</b>
        <br />
        {formatWhen(event.startsAt)} · {event.location}
      </div>

      <div
        style={{
          width: "100%",
          background: colors.card,
          border: `1px solid ${colors.hair}`,
          borderRadius: 16,
          padding: "6px 18px",
          marginTop: 26,
        }}
      >
        <ChecklistRow>Added to your plans</ChecklistRow>
        <ChecklistRow>{host} is now a friend</ChecklistRow>
        <ChecklistRow last>We&rsquo;ll remind you 1 hour before</ChecklistRow>
      </div>

      <div style={{ width: "100%", marginTop: 24, display: "flex", flexDirection: "column", gap: 11 }}>
        <button style={primaryBtn}>Get the app to manage</button>
        <button style={ghostBtn}>Add to calendar</button>
      </div>
    </div>
  );
}

function ChecklistRow({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "13px 0",
        borderBottom: last ? undefined : "1px solid #F2F2F2",
      }}
    >
      <Check size={15} stroke={colors.ink} />
      <span style={{ flex: 1, fontSize: 13, fontFamily: font.sans, textAlign: "left" }}>
        {children}
      </span>
    </div>
  );
}

function Check({
  size,
  stroke,
  animate,
}: {
  size: number;
  stroke: string;
  animate?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M5 12l5 5L20 6"
        style={
          animate
            ? {
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: "sq-draw 0.45s ease-out 0.18s forwards",
              }
            : undefined
        }
      />
    </svg>
  );
}

const primaryBtn: React.CSSProperties = {
  background: colors.ink,
  color: "#fff",
  border: "none",
  borderRadius: 13,
  padding: "16px 0",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: font.sans,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  border: "1.5px solid #E2E2DD",
  borderRadius: 13,
  padding: "14px 0",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: font.sans,
  cursor: "pointer",
};
