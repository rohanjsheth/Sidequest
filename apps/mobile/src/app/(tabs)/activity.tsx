import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Font, SQ } from '@/constants/sidequest';

type Status = 'going' | 'maybe' | 'declined';
type Activity = {
  id: string;
  name: string;
  status: Status;
  event: string;
  time: string;
};

// TODO(you): no activity endpoint yet — would come from invites on your events + friends' RSVPs
const MOCK: Activity[] = [
  { id: '1', name: 'Maya', status: 'going', event: 'Rooftop Sunset Hangs', time: '2m' },
  { id: '2', name: 'Dev', status: 'going', event: 'Pickup Basketball', time: '18m' },
  { id: '3', name: 'Priya', status: 'maybe', event: 'Thai Night + Trivia', time: '1h' },
  { id: '4', name: 'Leo', status: 'declined', event: 'Beach Bonfire', time: '3h' },
  { id: '5', name: 'Ana', status: 'going', event: 'Rooftop Sunset Hangs', time: '5h' },
];

const COLORS = ['#A0A0A0', '#8A9BA8', '#B0A48F', '#7E8C99', '#9AA497', '#C2897A'];
const colorFor = (id: string) => COLORS[id.charCodeAt(0) % COLORS.length];

const VERB: Record<Status, string> = {
  going: 'is going to',
  maybe: 'might make',
  declined: "can't make",
};

export default function Activity() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <Text style={[styles.title, { paddingTop: insets.top + 14 }]}>Activity</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {MOCK.map((a) => (
          <View key={a.id} style={styles.row}>
            <View style={[styles.avatar, { backgroundColor: colorFor(a.id) }]}>
              <Text style={styles.avatarText}>{a.name[0]}</Text>
            </View>
            <Text style={styles.text} numberOfLines={2}>
              <Text style={styles.name}>{a.name}</Text>
              <Text style={styles.verb}> {VERB[a.status]} </Text>
              <Text style={styles.event}>{a.event}</Text>
            </Text>
            <Text style={styles.time}>{a.time}</Text>
          </View>
        ))}
      </ScrollView>
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
