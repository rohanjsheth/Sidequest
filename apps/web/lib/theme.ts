// Share-page tokens, lifted from the Claude Design "Sidequest Share" file:
// warm paper + black ink + split-flap tiles. Mono = Recursive, sans = Inter.

export const colors = {
  paper: "#E7E5DF", // outer page
  surface: "#F6F6F4", // app surface
  card: "#FFFFFF",
  ink: "#111111",
  muted: "#777777",
  faint: "#999999",
  hair: "#ECECE8", // card borders
  rule: "#F0F0F0", // row dividers
  flapTop: "#3A3A3A",
  flapBottom: "#1B1B1B",
} as const;

export const font = {
  mono: "var(--font-recursive), ui-monospace, monospace",
  sans: "var(--font-inter), system-ui, sans-serif",
} as const;
