import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Font, SQ } from "@/constants/sidequest";

const LABELS: Record<string, string> = {
  index: "BOARD",
  friends: "FRIENDS",
  activity: "ACTIVITY",
  you: "YOU",
};

type TabRoute = { key: string; name: string };

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
      <Pressable
        key={route.key}
        style={styles.tab}
        hitSlop={{ top: 16, bottom: 16, left: 10, right: 10 }}
        onPress={() => {
          if (!focused) onTab(route.name, route.key);
        }}
      >
        <Text
          style={[styles.label, focused && styles.labelActive]}
          numberOfLines={1}
        >
          {LABELS[route.name] ?? route.name.toUpperCase()}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
      {renderTab(0)}
      {renderTab(1)}
      <Pressable style={styles.fab} onPress={() => router.push("/create")}>
        <Feather name="plus" size={23} color={SQ.card} />
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
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 9 },
  label: {
    fontFamily: Font.mono,
    fontSize: 11.5,
    letterSpacing: 1.3,
    color: SQ.ghost,
  },
  labelActive: { fontFamily: Font.monoBold, color: SQ.ink },
  // sits flush in the row, so it carries less weight than the old notched FAB
  fab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: SQ.ink,
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
