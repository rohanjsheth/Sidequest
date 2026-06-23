import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Font, SQ } from '@/constants/sidequest';

export default function Plan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.screen}>
      <Text style={styles.label}>PLAN</Text>
      <Text style={styles.id}>{id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SQ.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontFamily: Font.monoBold,
    fontSize: 12,
    letterSpacing: 2,
    color: SQ.ink,
  },
  id: { fontFamily: Font.mono, fontSize: 11, color: SQ.faint },
});
