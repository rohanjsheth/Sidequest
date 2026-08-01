import { StyleSheet, Text, View } from "react-native";

import { Font, SQ } from "@/constants/sidequest";

type Size = "sm" | "lg";

export function FlapTile({ char, size }: { char: string; size: Size }) {
  const big = size === "lg";
  // letters are the unit suffix on compact countdowns ("3h") — they read
  // narrower and smaller than the digits they follow
  const isUnit = !big && /[a-z]/i.test(char);

  return (
    <View style={[styles.tile, big ? styles.tileLg : styles.tileSm, isUnit && styles.unit]}>
      <View style={[styles.bottom, big ? styles.bottomLg : styles.bottomSm]} />
      <Text style={[styles.char, big ? styles.charLg : styles.charSm, isUnit && styles.charUnit]}>
        {char}
      </Text>
    </View>
  );
}

export function FlapRow({ chars, size }: { chars: string[]; size: Size }) {
  return (
    <View style={styles.row}>
      {chars.map((char, i) => (
        <FlapTile key={i} char={char} size={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 3 },

  tile: {
    borderRadius: 5,
    backgroundColor: SQ.flapTop,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tileSm: { minWidth: 21, height: 32, paddingHorizontal: 3 },
  tileLg: { minWidth: 26, height: 42 },
  unit: { minWidth: 16 },

  bottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SQ.flapBottom,
  },
  bottomSm: { height: 16 },
  bottomLg: { height: 21 },

  char: { fontFamily: Font.monoBold, color: SQ.card },
  charSm: { fontSize: 16 },
  charLg: { fontSize: 22 },
  charUnit: { fontSize: 13 },
});
