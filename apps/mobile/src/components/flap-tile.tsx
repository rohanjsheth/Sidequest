import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { SQ, Type } from "@/constants/sidequest";

const H = 42;
const HALF = H / 2;

// the one dial for how hard the split cuts. anything past a hairline starts
// taking bites out of the middle of 5, 8 and 0
const SEAM = StyleSheet.hairlineWidth * 2;

// the leaf falls fast and lands slow, the way a weighted one does
const FALL = 110;
const LAND = 130;

type Size = "sm" | "lg";

// a tile's whole content. `label` is the unit suffix on compact countdowns
// ("05" + "m"), which rides along so it flips with the digits it belongs to
type Cell = { value: string; label?: string };

const same = (a: Cell, b: Cell) => a.value === b.value && a.label === b.label;

/** one half of a character, drawn full-size and clipped to the half we want */
function Half({
  cell,
  part,
  fontSize,
}: {
  cell: Cell;
  part: "top" | "bottom";
  fontSize: number;
}) {
  return (
    <View
      style={[styles.half, part === "top" ? styles.halfTop : styles.halfBottom]}
    >
      <View
        style={[styles.halfInner, part === "bottom" && styles.halfInnerShift]}
      >
        <Text style={[styles.char, { fontSize }]}>
          {cell.value}
          {cell.label ? <Text style={styles.label}>{cell.label}</Text> : null}
        </Text>
      </View>
    </View>
  );
}

function Flap({
  cell,
  width,
  fontSize,
}: {
  cell: Cell;
  width: number;
  fontSize: number;
}) {
  const previous = useRef(cell);
  const [pair, setPair] = useState({ from: cell, to: cell });
  const p = useSharedValue(1);

  useEffect(() => {
    const before = previous.current;
    if (same(before, cell)) return;
    previous.current = cell;
    setPair({ from: before, to: cell });
    p.value = 0;
    p.value = withSequence(
      withTiming(0.5, { duration: FALL, easing: Easing.in(Easing.quad) }),
      withTiming(1, { duration: LAND, easing: Easing.out(Easing.quad) }),
    );
  }, [cell, p]);

  // the outgoing top leaf drops away about the seam, uncovering the new top
  const falling = useAnimatedStyle(() => ({
    opacity: p.value < 0.5 ? 1 : 0,
    transform: [{ perspective: 300 }, { rotateX: `${-180 * p.value}deg` }],
  }));

  // then the incoming bottom leaf swings down over the old bottom
  const landing = useAnimatedStyle(() => ({
    opacity: p.value < 0.5 ? 0 : 1,
    transform: [{ perspective: 300 }, { rotateX: `${180 * (1 - p.value)}deg` }],
  }));

  return (
    <View style={[styles.tile, { width }]}>
      <Half cell={pair.to} part="top" fontSize={fontSize} />
      <Half cell={pair.from} part="bottom" fontSize={fontSize} />

      <Animated.View style={[styles.leafTop, falling]}>
        <Half cell={pair.from} part="top" fontSize={fontSize} />
      </Animated.View>
      <Animated.View style={[styles.leafBottom, landing]}>
        <Half cell={pair.to} part="bottom" fontSize={fontSize} />
      </Animated.View>

      <View style={styles.seam} />
      <View style={styles.gloss} />
    </View>
  );
}

export function FlapRow({ chars, size }: { chars: string[]; size: Size }) {
  const big = size === "lg";
  return (
    <View style={styles.housing}>
      {chars.map((char, i) => (
        <Flap
          key={i}
          cell={{ value: char }}
          width={big ? 26 : 25}
          fontSize={big ? 22 : 19}
        />
      ))}
    </View>
  );
}

export function CompactFlapRow({
  units,
}: {
  units: { value: string; label: "d" | "h" | "m" }[];
}) {
  return (
    <View style={styles.housing}>
      {units.map((unit) => (
        <Flap key={unit.label} cell={unit} width={37} fontSize={19} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // the pair shares one case, the way a board's units do
  housing: {
    flexDirection: "row",
    gap: 2,
    padding: 2,
    borderRadius: 7,
    backgroundColor: SQ.flapCase,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  tile: { height: H, borderRadius: 4, overflow: "hidden" },

  half: { position: "absolute", left: 0, right: 0, height: HALF, overflow: "hidden" },
  halfTop: { top: 0, backgroundColor: SQ.flapTop },
  halfBottom: { bottom: 0, backgroundColor: SQ.flapBottom },
  halfInner: { height: H, alignItems: "center", justifyContent: "center" },
  halfInnerShift: { marginTop: -HALF },

  leafTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HALF,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    transformOrigin: "50% 100%",
  },
  leafBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: HALF,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    transformOrigin: "50% 0%",
  },

  // the gap between the leaves, and the light the top edge catches
  seam: {
    position: "absolute",
    left: 0,
    right: 0,
    top: HALF - SEAM / 2,
    height: SEAM,
    backgroundColor: SQ.flapSeam,
  },
  gloss: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  char: { ...Type.mechanical, color: SQ.card },
  label: { ...Type.mechanicalLabel, fontSize: 11, color: "rgba(255,255,255,0.45)" },
});
