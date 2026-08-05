// one neutral ramp, darkest to lightest. no warm tints — the only color in the
// app is the top blur, the avatar hues, `danger`, and the `urgent` pair below.
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

  // the tonal step carries the split; the seam is only a hairline on top of it.
  // a thicker seam eats the glyph's waist and costs more than it buys.
  // `flapCase` is the housing the pair sits in.
  flapTop: "#2E2E2E",
  flapBottom: "#1C1C1C",
  flapSeam: "#0D0D0D",
  flapCase: "#141414",

  danger: "#B3261E",

  // the soon chip. a fill this light needs dark text on it, not white
  urgent: "#FFBCBC",
  urgentInk: "#8C1D18",
} as const;

// the sans family is a single switch — flip this line and every `Font.sans*`
// follows. both families ship in the bundle and are registered in `_layout`, so
// nothing else has to change. Instrument Sans runs a little wider and shorter in
// the x-height than Inter, so sizes tuned against one may want a point either way.
const SANS: "Inter" | "InstrumentSans" = "InstrumentSans";

// which file to load. what it's *for* lives in `Type` below.
export const Font = {
  mono: "Recursive_400",
  monoMedium: "Recursive_500",
  monoSemibold: "Recursive_600",
  monoBold: "Recursive_700",
  sans: `${SANS}_400`,
  sansMedium: `${SANS}_500`,
  sansSemibold: `${SANS}_600`,
  sansBold: `${SANS}_700`,
} as const;

// labels whisper, controls speak. annotation — section eyebrows, field labels,
// badges, the time, counts, countdown furniture — sets lowercase, because at 8-13px
// caps read as shouting and over-label the screen. anything you tap keeps sentence
// case: on a filled button there's no size or weight contrast left to carry the
// control, and lowercase there reads as unfinished rather than considered. the
// wordmark is its own thing and keeps its caps — it's a logotype.
//
// case is *written into the strings*, never applied with `textTransform`. a
// transform can't tell our words from the user's, so a style carrying one will
// happily flatten a venue called "Alamo Drafthouse" the day someone renders it
// there. authoring it means a user's caps always survive, by construction rather
// than by us remembering — which is what lets `hosted by {name}` lowercase its
// own half and leave theirs alone. lib-generated chrome (countdown.ts) is written
// lowercase at its source for the same reason.
//
// tracking on the lowercase roles is tuned for lowercase — putting caps back means
// roughly doubling those values, since caps need the air between letters.

// Inter is the default for body text — reach for `Font.sans*` directly. it has one
// named role, `label`, because that pattern recurs across six screens and had
// already drifted into four sizes and four tracking values before it was named.
//
// Recursive (mono) is not a default. it is reserved for six roles, and only these:
//
//   brand      — the wordmark, nothing else. the only mono that sets in caps
//   badge      — the soon chip and the countdown pill
//   control    — share / back / RSVP
//   tabular    — digits the user is entering, where the glyph advance must not
//                shift as characters change (phone entry, OTP cells)
//   mechanical — countdown numerals, whether bare on the board row or set in the
//                split-flap tiles, plus the furniture beside them (in, the colon,
//                unit letters), so the cluster reads as one part
//   meta       — the time badge on the board row and the event page. mono so it
//                reads as machine output rather than as words someone wrote
//
// family and tracking are brand decisions, so they live here. size and color are
// layout decisions, so they stay at the call site — with one standing exception:
// mono on a light surface always sets in `ink`. it's small and sparse enough that
// a greyed one reads as broken rather than as quiet, and the six roles only hang
// together if they share a color. reversed out on a dark fill it's `card`, and
// the `soon` chip keeps `urgentInk` because that pair is semantic.
export const Type = {
  // Inter. section eyebrows, field labels, inline tags — anything naming a thing
  // rather than saying it. tracking carries the label-ness now that caps don't.
  label: { fontFamily: Font.sans, letterSpacing: 0.5 },
  labelStrong: { fontFamily: Font.sansBold, letterSpacing: 0.8 },

  // Recursive.
  brand: { fontFamily: Font.monoBold, letterSpacing: 3.5 },
  badge: { fontFamily: Font.monoSemibold, letterSpacing: 0.75 },
  control: { fontFamily: Font.mono },
  controlStrong: { fontFamily: Font.monoSemibold },
  tabular: { fontFamily: Font.monoMedium },
  tabularStrong: { fontFamily: Font.monoBold },
  mechanical: { fontFamily: Font.monoBold },
  mechanicalLabel: { fontFamily: Font.mono },
  metaMedium: { fontFamily: Font.monoMedium },
} as const;
