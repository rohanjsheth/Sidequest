import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api, ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import { Font, SQ } from '@/constants/sidequest';

type FeedEvent = {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  host: { id: string; name: string | null; avatarUrl: string | null };
  going: number;
};

function countdown(startsAt: string) {
  const mins = Math.max(0, Math.round((new Date(startsAt).getTime() - Date.now()) / 60000));
  if (mins < 60) return { chars: [...String(mins), 'm'], soon: true };
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return { chars: [...String(hrs), 'h'], soon: false };
  return { chars: [...String(Math.round(hrs / 24)), 'd'], soon: false };
}

function FlapTile({ char }: { char: string }) {
  const isUnit = /[a-z]/i.test(char);
  return (
    <View style={[flap.tile, isUnit && flap.unit]}>
      <View style={flap.bottom} />
      <Text style={[flap.char, isUnit && flap.charUnit]}>{char}</Text>
    </View>
  );
}

function EventRow({ event }: { event: FeedEvent }) {
  const c = countdown(event.startsAt);
  return (
    <Pressable style={styles.row} onPress={() => router.push(`/plan/${event.id}`)}>
      <View style={styles.cdCol}>
        <View style={styles.flaps}>
          {c.chars.map((ch, i) => (
            <FlapTile key={i} char={ch} />
          ))}
        </View>
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
          <Text style={styles.meta} numberOfLines={1}>
            {event.location} · {event.host.name ?? 'Someone'}
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

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const { events: data } = await api<{ events: FeedEvent[] }>('/events', {
            auth: true,
          });
          if (active) {
            setEvents(data);
            setError(null);
          }
        } catch (err) {
          if (active)
            setError(err instanceof ApiError ? err.message : 'Something went wrong');
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const initials = (user?.name ?? '?').slice(0, 2).toUpperCase();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.wordmark}>SIDEQUEST</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
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
          renderItem={({ item }) => <EventRow event={item} />}
          ListHeaderComponent={<Text style={styles.heading}>Upcoming</Text>}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SQ.card },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Font.mono, fontSize: 10, color: '#666666' },

  heading: {
    fontFamily: Font.sansBold,
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: SQ.ink,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 26,
  },

  center: { marginTop: 60 },
  state: {
    fontFamily: Font.mono,
    fontSize: 13,
    color: SQ.faint,
    textAlign: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  row: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    alignItems: 'center',
  },
  cdCol: { minWidth: 55 },
  flaps: { flexDirection: 'row', gap: 3 },

  body: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: Font.sansSemibold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 22,
    color: SQ.ink,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
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
  meta: { flex: 1, fontFamily: Font.mono, fontSize: 11.5, color: '#666666' },

  goingCol: { alignItems: 'flex-end' },
  goingNum: { fontFamily: Font.sansBold, fontSize: 17, color: SQ.ink },
  goingLabel: {
    fontFamily: Font.mono,
    fontSize: 9,
    letterSpacing: 1.5,
    color: SQ.faint,
    marginTop: 3,
  },

});

const flap = StyleSheet.create({
  tile: {
    minWidth: 21,
    height: 32,
    borderRadius: 5,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 3,
  },
  unit: { minWidth: 16 },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 16,
    backgroundColor: '#161616',
  },
  char: { fontFamily: Font.monoBold, fontSize: 16, color: '#FFFFFF' },
  charUnit: { fontSize: 13 },
});
