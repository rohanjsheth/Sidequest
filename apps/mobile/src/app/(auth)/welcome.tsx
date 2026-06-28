import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Font, SQ } from '@/constants/sidequest';

const WEB_BASE = (
  process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');

const TEASE = [
  {
    digits: ['4', '5'],
    title: 'Rooftop Sunset Hangs',
    sub: 'Cavalier Rooftop · Maya',
    count: '6 IN',
    opacity: 0.9,
    border: '#EEEEEE',
  },
  {
    digits: ['5'],
    title: 'Pickup Basketball',
    sub: 'Mission Rec Center · Dev',
    count: '9 IN',
    opacity: 0.5,
    border: '#F2F2F2',
  },
  {
    digits: ['2'],
    title: 'Beach Bonfire',
    sub: null,
    count: null,
    opacity: 0.22,
    border: '#F7F7F7',
  },
];

function FlapTile({ d }: { d: string }) {
  return (
    <View style={flap.tile}>
      <View style={flap.bottom} />
      <Text style={flap.digit}>{d}</Text>
    </View>
  );
}

export default function Welcome() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <Text style={[styles.wordmark, { marginTop: insets.top + 18 }]}>
        SIDEQUEST
      </Text>

      <View style={styles.tease}>
        {TEASE.map((card) => (
          <View
            key={card.title}
            style={[styles.card, { opacity: card.opacity, borderColor: card.border }]}>
            <View style={styles.badges}>
              {card.digits.map((d, i) => (
                <FlapTile key={i} d={d} />
              ))}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              {card.sub ? <Text style={styles.cardSub}>{card.sub}</Text> : null}
            </View>
            {card.count ? <Text style={styles.cardCount}>{card.count}</Text> : null}
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      <View style={styles.copy}>
        <Text style={styles.headline}>
          Plans with friends,{'\n'}minus the group chat.
        </Text>
        <Text style={styles.sub}>
          {"See what everyone's up to. RSVP in a tap. Show up."}
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 18 }]}>
        <Pressable style={styles.cta} onPress={() => router.push('/phone')}>
          <Text style={styles.ctaText}>Continue with phone</Text>
        </Pressable>
        <Text style={styles.terms}>
          By continuing you agree to our{'\n'}
          <Text
            style={styles.termsLink}
            onPress={() => Linking.openURL(`${WEB_BASE}/terms`)}>
            Terms
          </Text>
          {' & '}
          <Text
            style={styles.termsLink}
            onPress={() => Linking.openURL(`${WEB_BASE}/privacy`)}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SQ.card },
  wordmark: {
    paddingHorizontal: 28,
    fontFamily: Font.monoBold,
    fontSize: 16,
    letterSpacing: 3.5,
    color: SQ.ink,
  },

  tease: { marginTop: 30, paddingHorizontal: 22, gap: 10 },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badges: { flexDirection: 'row', gap: 2 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { fontFamily: Font.sansSemibold, fontSize: 14, color: SQ.ink },
  cardSub: { fontFamily: Font.mono, fontSize: 10, color: SQ.faint, marginTop: 3 },
  cardCount: {
    fontFamily: Font.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: SQ.hint,
  },

  spacer: { flex: 1 },

  copy: { paddingHorizontal: 28 },
  headline: {
    fontFamily: Font.sansBold,
    fontSize: 33,
    lineHeight: 36,
    letterSpacing: -0.8,
    color: SQ.ink,
  },
  sub: {
    fontFamily: Font.mono,
    fontSize: 13,
    lineHeight: 20,
    color: SQ.muted,
    marginTop: 14,
  },

  footer: { paddingHorizontal: 24, paddingTop: 24 },
  cta: {
    backgroundColor: SQ.ink,
    borderRadius: 13,
    alignItems: 'center',
    paddingVertical: 17,
  },
  ctaText: { fontFamily: Font.sansSemibold, fontSize: 14, color: SQ.card },
  terms: {
    fontFamily: Font.mono,
    fontSize: 10,
    lineHeight: 15,
    color: SQ.faint,
    textAlign: 'center',
    marginTop: 14,
  },
  termsLink: { color: SQ.muted, textDecorationLine: 'underline' },
});

const flap = StyleSheet.create({
  tile: {
    minWidth: 20,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 3,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 15,
    backgroundColor: '#1B1B1B',
  },
  digit: { fontFamily: Font.monoBold, fontSize: 16, color: '#FFFFFF' },
});
