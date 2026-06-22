import { colors, font } from "@/lib/theme";

export function FlapTile({
  children,
  size = 21,
  width = 25,
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
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: width,
        height,
        background: `linear-gradient(180deg, ${colors.flapTop} 0 50%, ${colors.flapBottom} 50% 100%)`,
        color: "#fff",
        borderRadius: 5,
        fontSize: size,
        fontWeight: 700,
        fontFamily: font.mono,
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      {children}
    </span>
  );
}

export function SplitFlap({
  text,
  size,
  width,
  height,
  gap = 3,
}: {
  text: string;
  size?: number;
  width?: number;
  height?: number;
  gap?: number;
}) {
  return (
    <span style={{ display: "inline-flex", gap }}>
      {text.split("").map((ch, i) => (
        <FlapTile key={i} size={size} width={width} height={height}>
          {ch}
        </FlapTile>
      ))}
    </span>
  );
}
