import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SQ } from "@/constants/sidequest";

const LABELS: Record<string, string> = {
  index: "Board",
  friends: "Friends",
  activity: "Activity",
  you: "You",
};

type FeatherName = ComponentProps<typeof Feather>["name"];

const ICONS: Record<string, FeatherName> = {
  index: "home",
  friends: "users",
  activity: "bell",
  you: "user",
};

// p drives the whole select animation: the icon pops first, the pill lands second.
const SELECT_MS = 250;
const DESELECT_MS = 105;

type TabRoute = { key: string; name: string };

type TabProps = {
  route: TabRoute;
  focused: boolean;
  onPress: () => void;
};

function Tab({ route, focused, onPress }: TabProps) {
  const p = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    p.value = withTiming(focused ? 1 : 0, {
      duration: focused ? SELECT_MS : DESELECT_MS,
      easing: Easing.linear,
    });
  }, [focused, p]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(p.value, [0, 0.45, 1], [1, 1.32, 1]) }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.45, 1], [0, 0, 1]),
    transform: [
      {
        scale: interpolate(
          p.value,
          [0.45, 1],
          [0.75, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0.45, 0.85], [0, 1], Extrapolation.CLAMP),
  }));

  const name = ICONS[route.name] ?? "circle";

  return (
    <Pressable
      style={styles.tab}
      accessibilityLabel={LABELS[route.name] ?? route.name}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      hitSlop={{ top: 18, bottom: 18, left: 12, right: 12 }}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.pill, pillStyle]} />
        <Animated.View style={iconStyle}>
          <Feather name={name} size={21} color={SQ.ghost} />
          <Animated.View style={[styles.iconOverlay, activeIconStyle]}>
            <Feather name={name} size={21} color={SQ.card} />
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}

type Props = {
  routes: TabRoute[];
  activeIndex: number;
  onTab: (name: string, key: string) => void;
};

export function TabBar({ routes, activeIndex, onTab }: Props) {
  const insets = useSafeAreaInsets();

  function renderTab(index: number) {
    const route = routes[index];
    if (!route) return null;
    const focused = activeIndex === index;
    return (
      <Tab
        key={route.key}
        route={route}
        focused={focused}
        onPress={() => {
          if (!focused) onTab(route.name, route.key);
        }}
      />
    );
  }

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(8, insets.bottom - 8) }]}>
      {renderTab(0)}
      {renderTab(1)}
      <Pressable
        accessibilityLabel="Create plan"
        accessibilityRole="button"
        style={styles.fab}
        onPress={() => router.push("/create")}
      >
        <Feather name="plus" size={21} color={SQ.card} />
      </Pressable>
      {renderTab(2)}
      {renderTab(3)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SQ.card,
    borderTopWidth: 1,
    borderTopColor: SQ.line,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 1,
  },
  iconWrap: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
    backgroundColor: SQ.ink,
  },
  iconOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SQ.ink,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
