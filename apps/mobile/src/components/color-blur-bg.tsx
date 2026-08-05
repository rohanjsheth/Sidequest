import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const BASE = "#FFFFFF";

// soft color pools toward the top, washing down into the light base.
// cx: fraction of width · cy: px from top · r: ×width (bigger r reaches lower). tune freely.
const BLOBS = [
  { color: "#5C8DF0", cx: 0.22, cy: 15, r: 0.68, opacity: 0.5 }, // blue
  { color: "#74C0FF", cx: 0.82, cy: 10, r: 0.7, opacity: 0.4 }, // sky
  { color: "#FF6F9C", cx: 0.5, cy: 60, r: 0.64, opacity: 0.4 }, // rose
  { color: "#FFC56B", cx: 0.3, cy: 110, r: 0.66, opacity: 0.37 }, // gold
];

export function ColorBlurBackground({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.26],
  });
  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { opacity, transformOrigin: "top", transform: [{ scale }] },
        ]}
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            {BLOBS.map((b, i) => (
              <RadialGradient
                key={i}
                id={`blob${i}`}
                cx={width * b.cx}
                cy={b.cy}
                r={width * b.r}
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity} />
                <Stop offset="1" stopColor={b.color} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {BLOBS.map((_, i) => (
            <Rect
              key={i}
              x={0}
              y={0}
              width={width}
              height={height}
              fill={`url(#blob${i})`}
            />
          ))}
        </Svg>
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BASE },
});
