import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, ApiError } from "@/lib/api";
import { compactCountdown, formatWhen } from "@/lib/countdown";
import { useSession } from "@/lib/session";
import { Font, SQ } from "@/constants/sidequest";
import { ColorBlurBackground } from "@/components/color-blur-bg";
import { FlapRow } from "@/components/flap-tile";
import { avatarColor } from "@/lib/avatar";

type FeedEvent = {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  host: { id: string; name: string | null; avatarUrl: string | null };
  going: number;
};

function EventRow({
  event,
  now,
  first,
}: {
  event: FeedEvent;
  now: number;
  first: boolean;
}) {
  const c = compactCountdown(event.startsAt, now);
  return (
    <Pressable
      style={[styles.row, first && styles.rowFirst]}
      onPress={() => router.push(`/plan/${event.id}`)}
    >
      <View style={styles.cdCol}>
        <FlapRow chars={c.chars} size="sm" />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          {c.soon ? (
            <View style={styles.soon}>
              <Text style={styles.soonText}>SOON</Text>
            </View>
          ) : null}
          <Text style={styles.when}>{formatWhen(event.startsAt, now)}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {event.location} · {event.host.name ?? "Someone"}
          </Text>
        </View>
      </View>

      <View style={styles.goingCol}>
        <Text style={styles.goingNum}>{event.going}</Text>
        <Text style={styles.goingLabel}>GOING</Text>
      </View>
    </Pressable>
  );
}

export default function Feed() {
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const [events, setEvents] = useState<FeedEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setNow(Date.now());
      (async () => {
        try {
          const { events: data } = await api<{ events: FeedEvent[] }>(
            "/events",
            {
              auth: true,
            },
          );
          if (active) {
            setEvents(data);
            setError(null);
          }
        } catch (err) {
          if (active)
            setError(
              err instanceof ApiError ? err.message : "Something went wrong",
            );
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const initial = (user?.name || "?")[0].toUpperCase();

  return (
    <ColorBlurBackground>
      <View style={styles.screen}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.wordmark}>SIDEQUEST</Text>
          <Pressable
            onPress={() => router.navigate("/you")}
            hitSlop={10}
            style={[
              styles.avatar,
              { backgroundColor: avatarColor(user?.id ?? "?").bg },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { color: avatarColor(user?.id ?? "?").fg },
              ]}
            >
              {initial}
            </Text>
          </Pressable>
        </View>

        {events === null && !error ? (
          <ActivityIndicator style={styles.center} color={SQ.ink} />
        ) : error ? (
          <Text style={styles.state}>{error}</Text>
        ) : events && events.length === 0 ? (
          <Text style={styles.state}>No plans yet. Tap + to start one.</Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(e) => e.id}
            renderItem={({ item, index }) => (
              <EventRow event={item} now={now} first={index === 0} />
            )}
            extraData={now}
            ListHeaderComponent={<Text style={styles.heading}>Upcoming</Text>}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          />
        )}
      </View>
    </ColorBlurBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  wordmark: {
    fontFamily: Font.monoBold,
    fontSize: 16,
    letterSpacing: 3.5,
    color: SQ.ink,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: SQ.line,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: Font.sansSemibold, fontSize: 11 },

  heading: {
    fontFamily: Font.sansBold,
    fontSize: 32,
    letterSpacing: -0.6,
    color: SQ.ink,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 15,
  },

  center: { marginTop: 60 },
  state: {
    fontFamily: Font.mono,
    fontSize: 13,
    color: SQ.faint,
    textAlign: "center",
    marginTop: 60,
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  row: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: SQ.rule,
    alignItems: "center",
  },
  // the top-most rule would cut straight through the color wash
  rowFirst: { borderTopWidth: 0 },
  cdCol: { minWidth: 55 },

  body: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: Font.sansSemibold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 22,
    color: SQ.ink,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 7 },
  soon: {
    backgroundColor: SQ.ink,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  soonText: {
    fontFamily: Font.sansSemibold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: SQ.card,
  },
  // the time never shrinks — a long venue name truncates instead
  when: {
    fontFamily: Font.monoMedium,
    fontSize: 11.5,
    color: SQ.ink,
    flexShrink: 0,
  },
  meta: { flex: 1, fontFamily: Font.mono, fontSize: 11.5, color: SQ.muted },

  goingCol: { alignItems: "flex-end" },
  goingNum: { fontFamily: Font.sansBold, fontSize: 17, color: SQ.ink },
  goingLabel: {
    fontFamily: Font.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: SQ.faint,
    marginTop: 3,
  },
});
