// one neutral ramp, darkest to lightest. no warm tints — the only color in the
// app is the top blur, the avatar hues, and `danger`.
export const SQ = {
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
  flapBottom: "#171717",

  danger: "#B3261E",
} as const;

export const Font = {
  mono: "Recursive_400",
  monoMedium: "Recursive_500",
  monoSemibold: "Recursive_600",
  monoBold: "Recursive_700",
  sans: "Inter_400",
  sansMedium: "Inter_500",
  sansSemibold: "Inter_600",
  sansBold: "Inter_700",
} as const;
