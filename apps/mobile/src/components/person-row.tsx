import type { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import { Font, SQ } from "@/constants/sidequest";
import { avatarColor } from "@/lib/avatar";

// the one place row metrics live — skeleton.tsx mirrors these so nothing
// shifts when data lands
export const ROW_METRICS = {
  avatar: 44,
  gap: 13,
  paddingHorizontal: 24,
  paddingVertical: 12,
  subGap: 3,
} as const;

export function PersonRow({
  seed,
  name,
  sub,
  accent = false,
  style,
  children,
}: {
  /** id the avatar hue is derived from */
  seed: string;
  name: string;
  sub?: string;
  /** darkens the sub line and shows a leading dot */
  accent?: boolean;
  style?: ViewStyle;
  /** trailing action(s) — buttons, menus */
  children?: ReactNode;
}) {
  const color = avatarColor(seed);

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.avatar, { backgroundColor: color.bg }]}>
        <Text style={[styles.avatarText, { color: color.fg }]}>
          {(name[0] ?? "?").toUpperCase()}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {sub ? (
          <View style={styles.subRow}>
            {accent ? <View style={styles.dot} /> : null}
            <Text
              style={[styles.sub, accent && styles.subAccent]}
              numberOfLines={1}
            >
              {sub}
            </Text>
          </View>
        ) : null}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: ROW_METRICS.gap,
    paddingHorizontal: ROW_METRICS.paddingHorizontal,
    paddingVertical: ROW_METRICS.paddingVertical,
  },
  avatar: {
    width: ROW_METRICS.avatar,
    height: ROW_METRICS.avatar,
    borderRadius: ROW_METRICS.avatar / 2,
    borderWidth: 1,
    borderColor: SQ.line,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: Font.sansSemibold, fontSize: 15 },

  body: { flex: 1, minWidth: 0 },
  name: { fontFamily: Font.sansSemibold, fontSize: 15, color: SQ.ink },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: ROW_METRICS.subGap,
  },
  sub: { flex: 1, fontFamily: Font.sans, fontSize: 10.5, color: SQ.faint },
  subAccent: { color: SQ.ink },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: SQ.ink },
});
