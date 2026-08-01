import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Font, SQ } from "@/constants/sidequest";
import { api, ApiError } from "@/lib/api";
import { ColorBlurBackground } from "@/components/color-blur-bg";
import { avatarColor } from "@/lib/avatar";

type Status = "going" | "declined";
type Activity = {
  id: string;
  status: Status;
  createdAt: string;
  attendee: { id: string; name: string | null; avatarUrl: string | null };
  event: { id: string; title: string };
};

function ago(iso: string) {
  const s = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const VERB: Record<Status, string> = {
  going: "is going to",
  declined: "can't make",
};

export default function Activity() {
  const insets = useSafeAreaInsets();
  const [activity, setActivity] = useState<Activity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    try {
      const { activity: rows } = await api<{ activity: Activity[] }>(
        "/me/activity",
        {
          auth: true,
        },
      );
      setActivity(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadActivity();
    }, [loadActivity]),
  );

  return (
    <ColorBlurBackground>
      <View style={styles.screen}>
        <Text style={[styles.title, { paddingTop: insets.top + 14 }]}>
          Activity
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading && activity === null ? (
          <Text style={styles.state}>Loading activity...</Text>
        ) : activity === null ? null : activity.length === 0 ? (
          <Text style={styles.empty}>
            No activity yet. When people respond to your plans, it shows up
            here.
          </Text>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          >
            {activity.map((a, index) => {
              const name = a.attendee.name ?? "Someone";
              const c = avatarColor(a.attendee.id);
              return (
                <Pressable
                  key={a.id}
                  style={[styles.row, index === 0 && styles.rowFirst]}
                  onPress={() => router.push(`/plan/${a.event.id}`)}
                >
                  <View style={[styles.avatar, { backgroundColor: c.bg }]}>
                    <Text style={[styles.avatarText, { color: c.fg }]}>
                      {name[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.text} numberOfLines={2}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.verb}> {VERB[a.status]} </Text>
                    <Text style={styles.event}>{a.event.title}</Text>
                  </Text>
                  <Text style={styles.time}>{ago(a.createdAt)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ColorBlurBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  title: {
    fontFamily: Font.sansBold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: SQ.ink,
    paddingHorizontal: 24,
    paddingBottom: 14,
  },

  empty: {
    fontFamily: Font.mono,
    fontSize: 13,
    color: SQ.faint,
    textAlign: "center",
    marginTop: 60,
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  state: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: SQ.faint,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  error: {
    fontFamily: Font.mono,
    fontSize: 12,
    color: SQ.danger,
    paddingHorizontal: 24,
    paddingTop: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: SQ.rule,
  },
  // the top-most rule would cut straight through the color wash
  rowFirst: { borderTopWidth: 0 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SQ.line,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: Font.sansSemibold, fontSize: 14 },

  text: { flex: 1, fontSize: 13.5, lineHeight: 19 },
  name: { fontFamily: Font.sansSemibold, color: SQ.ink },
  verb: { fontFamily: Font.mono, fontSize: 12, color: SQ.faint },
  event: { fontFamily: Font.sansSemibold, color: SQ.ink },

  time: { fontFamily: Font.mono, fontSize: 10.5, color: SQ.ghost },
});
