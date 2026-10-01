import { colors, font } from "@/lib/theme";

// static take on mobile's flap-tile.tsx: tonal split, hairline seam, one case per pair
export function FlapTile({
  children,
  size = 22,
  width = 26,
  height = 42,
}: {
  children: React.ReactNode;
  size?: number;
  width?: number;
  height?: number;
}) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: width,
        height,
        background: `linear-gradient(180deg, ${colors.flapTop} 0 50%, ${colors.flapBottom} 50% 100%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.09)",
        color: colors.card,
        borderRadius: 4,
        fontSize: size,
        fontWeight: 700,
        fontFamily: font.mono,
        overflow: "hidden",
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 1,
          marginTop: -0.5,
          background: colors.flapSeam,
        }}
      />
    </span>
  );
}

export function SplitFlap({
  text,
  size,
  width,
  height,
}: {
  text: string;
  size?: number;
  width?: number;
  height?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        gap: 2,
        padding: 2,
        borderRadius: 7,
        background: colors.flapCase,
        boxShadow: "0 1px 3px rgba(0,0,0,0.14)",
      }}
    >
      {text.split("").map((ch, i) => (
        <FlapTile key={i} size={size} width={width} height={height}>
          {ch}
        </FlapTile>
      ))}
    </span>
  );
}
