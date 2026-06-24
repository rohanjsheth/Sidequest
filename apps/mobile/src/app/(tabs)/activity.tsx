import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Font, SQ } from '@/constants/sidequest';

type Status = 'going' | 'declined';
type Activity = {
  id: string;
  status: Status;
  createdAt: string;
  attendee: { id: string; name: string | null; avatarUrl: string | null };
  event: { id: string; title: string };
};

// TODO(you): GET /me/activity (auth) → replace MOCK with data.activity (same shape as Activity)
const MOCK: Activity[] = [
  { id: '1', status: 'going', createdAt: minsAgo(2), attendee: { id: 'u1', name: 'Maya', avatarUrl: null }, event: { id: 'e1', title: 'Rooftop Sunset Hangs' } },
  { id: '2', status: 'going', createdAt: minsAgo(18), attendee: { id: 'u2', name: 'Dev', avatarUrl: null }, event: { id: 'e2', title: 'Pickup Basketball' } },
  { id: '3', status: 'declined', createdAt: minsAgo(64), attendee: { id: 'u3', name: 'Priya', avatarUrl: null }, event: { id: 'e3', title: 'Thai Night + Trivia' } },
  { id: '4', status: 'going', createdAt: minsAgo(190), attendee: { id: 'u4', name: 'Leo', avatarUrl: null }, event: { id: 'e4', title: 'Beach Bonfire' } },
  { id: '5', status: 'declined', createdAt: minsAgo(320), attendee: { id: 'u5', name: 'Ana', avatarUrl: null }, event: { id: 'e1', title: 'Rooftop Sunset Hangs' } },
];

function minsAgo(m: number) {
  return new Date(Date.now() - m * 60000).toISOString();
}

function ago(iso: string) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const VERB: Record<Status, string> = {
  going: 'is going to',
  declined: "can't make",
};

const COLORS = ['#A0A0A0', '#8A9BA8', '#B0A48F', '#7E8C99', '#9AA497', '#C2897A'];
const colorFor = (id: string) => COLORS[id.charCodeAt(id.length - 1) % COLORS.length];

export default function Activity() {
  const insets = useSafeAreaInsets();
  const activity = MOCK;

  return (
    <View style={styles.screen}>
      <Text style={[styles.title, { paddingTop: insets.top + 14 }]}>Activity</Text>

      {activity.length === 0 ? (
        <Text style={styles.empty}>
          No activity yet. When people respond to your plans, it shows up here.
        </Text>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {activity.map((a) => {
            const name = a.attendee.name ?? 'Someone';
            return (
              <View key={a.id} style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: colorFor(a.attendee.id) }]}>
                  <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.text} numberOfLines={2}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.verb}> {VERB[a.status]} </Text>
                  <Text style={styles.event}>{a.event.title}</Text>
                </Text>
                <Text style={styles.time}>{ago(a.createdAt)}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SQ.card },
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
    textAlign: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
    lineHeight: 20,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: Font.sansSemibold, fontSize: 14, color: SQ.card },

  text: { flex: 1, fontSize: 13.5, lineHeight: 19 },
  name: { fontFamily: Font.sansSemibold, color: SQ.ink },
  verb: { fontFamily: Font.mono, fontSize: 12, color: SQ.faint },
  event: { fontFamily: Font.sansSemibold, color: SQ.ink },

  time: { fontFamily: Font.mono, fontSize: 10.5, color: SQ.ghost },
});
