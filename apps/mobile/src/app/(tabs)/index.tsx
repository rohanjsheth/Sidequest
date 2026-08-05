import { Feather } from "@expo/vector-icons";
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
import { Font, SQ, Type } from "@/constants/sidequest";
import { ColorBlurBackground } from "@/components/color-blur-bg";
import { CompactFlapRow } from "@/components/flap-tile";
import { avatarColor } from "@/lib/avatar";

type FeedEvent = {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  going: number;
};

function EventRow({
  event,
  now,
}: {
  event: FeedEvent;
  now: number;
}) {
  const c = compactCountdown(event.startsAt, now);
  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push(`/plan/${event.id}`)}
    >
      <View style={styles.cdCol}>
        <CompactFlapRow units={c.units} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={12} color={SQ.ghost} />
          <Text style={styles.location} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        <View style={[styles.metaRow, styles.metaRowChips]}>
          {c.soon ? (
            <View style={styles.soon}>
              <Text style={styles.soonText}>soon</Text>
            </View>
          ) : null}
          <View style={styles.whenBadge}>
            <Text style={styles.when}>{formatWhen(event.startsAt, now)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.goingCol}>
        <Text style={styles.goingNum}>{event.going}</Text>
        <Text style={styles.goingLabel}>going</Text>
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

  // the tiles only show minutes, so tick on the minute boundary rather than every
  // second — one re-render per minute, and the flap flips exactly when it should
  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setTimeout>;
      const schedule = () =>
        setTimeout(() => {
          setNow(Date.now());
          timer = schedule();
        }, 60000 - (Date.now() % 60000));

      timer = schedule();
      return () => clearTimeout(timer);
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
            renderItem={({ item }) => <EventRow event={item} now={now} />}
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
    ...Type.brand,
    fontSize: 16,
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
    paddingBottom: 26,
  },

  center: { marginTop: 60 },
  state: {
    fontFamily: Font.sans,
    fontSize: 13,
    color: SQ.faint,
    textAlign: "center",
    marginTop: 60,
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  // each plan is its own card rather than a slice of one list — same radius and
  // outline as the going box inside it, so the row and its parts agree
  row: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    padding: 14,
    // 10 + 14 puts the card's *contents* on the screen's 24 gutter, so the cards
    // run wide while the text inside still lines up with the heading above
    marginHorizontal: 10,
    marginBottom: 2,
    // not quite white — the wash behind carries through, so the cards tint with
    // whatever colour is pooling at their height on the screen
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: SQ.line,
    borderRadius: 12,
    // barely there — enough to lift the card off the wash without a second line
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // the housing is 80 wide (two 37 tiles, a 2 seam, 2 of case either side) —
  // this leaves it a hair of room and keeps every title on the same line
  cdCol: { width: 82 },

  body: { flex: 1, minWidth: 0 },
  // bold at 17 wants the air taken back out — the heavier the face, the tighter
  // it can set before the words stop separating, and Instrument Sans fits wide
  title: {
    fontFamily: Font.sansBold,
    fontSize: 20,
    letterSpacing: 0,
    lineHeight: 24,
    color: SQ.ink,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  // the chips sit flush with the title and the pin rather than on the venue's
  // text rail: a pill only reaches its leftmost point at the middle of the curve,
  // so an inset one reads as pushed right even when the box is aligned. gap is
  // chip-to-chip here rather than icon-to-content, which wants a touch more air
  metaRowChips: { gap: 6 },
  // tracked open rather than tightened: at this size the extra air is what makes
  // it read as a label under the title instead of a smaller second headline
  location: {
    flex: 1,
    ...Type.label,
    fontSize: 11.5,
    lineHeight: 15,
    color: SQ.muted,
  },
  // pill too, so the pair reads as one set rather than two unrelated chips
  // the same mark the plan page leads with, so a plan carries one chip across
  // both screens rather than a pink one here and a black one there
  soon: {
    backgroundColor: SQ.ink,
    borderWidth: 1,
    borderColor: SQ.ink,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  soonText: {
    ...Type.badge,
    fontSize: 9,
    lineHeight: 14,
    color: SQ.card,
  },
  // white rather than a grey fill: on a wash this light a tint reads as smudge,
  // where an outlined bubble holds its own edge. same treatment as `goingCol`.
  whenBadge: {
    backgroundColor: SQ.card,
    borderWidth: 1,
    borderColor: SQ.line,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  when: {
    ...Type.metaMedium,
    fontSize: 10.5,
    lineHeight: 14,
    color: SQ.ink,
  },

  goingCol: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 54,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: SQ.line,
    borderRadius: 12,
  },
  goingNum: { fontFamily: Font.sansBold, fontSize: 20, color: SQ.ink },
  goingLabel: {
    ...Type.label,
    fontSize: 9,
    color: SQ.faint,
    marginTop: 3,
  },
});
