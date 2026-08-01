import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type DimensionValue,
  type ViewStyle,
} from "react-native";

import { SQ } from "@/constants/sidequest";

// one driver for every skeleton on screen — a loop per row would be wasteful
const sweep = new Animated.Value(0);
let live = 0;
let loop: Animated.CompositeAnimation | null = null;

function useSweep() {
  useEffect(() => {
    live++;
    if (live === 1) {
      loop = Animated.loop(
        Animated.timing(sweep, {
          toValue: 1,
          duration: 1150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      );
      loop.start();
    }
    return () => {
      live--;
      if (live === 0) {
        loop?.stop();
        loop = null;
        sweep.setValue(0);
      }
    };
  }, []);
  return sweep;
}

export function Skeleton({
  width,
  height,
  radius = 6,
  style,
}: {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const value = useSweep();
  const [measured, setMeasured] = useState(0);

  const translateX = value.interpolate({
    inputRange: [0, 1],
    outputRange: [-measured, measured],
  });

  return (
    <View
      onLayout={(e) => setMeasured(e.nativeEvent.layout.width)}
      style={[
        { width, height, borderRadius: radius, backgroundColor: SQ.hair },
        styles.clip,
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { width: measured, transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.55)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// mirrors the real person row's metrics so nothing shifts when data lands
export function SkeletonPersonRow() {
  return (
    <View style={styles.row}>
      <Skeleton width={44} height={44} radius={22} />
      <View style={styles.rowBody}>
        <Skeleton width={132} height={13} />
        <Skeleton width={88} height={10} style={styles.rowSub} />
      </View>
    </View>
  );
}

export function SkeletonChip({ width = 116 }: { width?: number }) {
  return <Skeleton width={width} height={38} radius={20} />;
}

const styles = StyleSheet.create({
  clip: { overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowSub: { marginTop: 7 },
});
