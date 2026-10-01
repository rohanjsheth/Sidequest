// mirrors apps/mobile/src/constants/sidequest.ts — one neutral ramp, no warm tints.
// the only color is the top blur, avatar hues, `danger`, and the `urgent` pair.
export const colors = {
  ink: "#111111",
  text: "#333333",
  muted: "#666666",
  faint: "#8E8E8E",
  ghost: "#B5B5B5",
  line: "#E3E3E3",
  rule: "#EDEDED",
  fill: "#F5F5F5",
  card: "#FFFFFF",

  flapTop: "#2E2E2E",
  flapBottom: "#1C1C1C",
  flapSeam: "#0D0D0D",
  flapCase: "#141414",

  danger: "#B3261E",
  urgent: "#FFBCBC",
  urgentInk: "#8C1D18",
} as const;

export const font = {
  mono: "var(--font-recursive), ui-monospace, monospace",
  sans: "var(--font-sans), system-ui, sans-serif",
} as const;

// same hash as mobile's lib/avatar.ts, so a person gets the same hue on both
export function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(h) % 360;
  return {
    bg: `hsl(${hue}, 70%, 92%)`,
    fg: `hsl(${hue}, 55%, 35%)`,
  };
}
