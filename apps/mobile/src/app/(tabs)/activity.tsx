import { StyleSheet, Text, View } from 'react-native';

import { Font, SQ } from '@/constants/sidequest';

export default function Activity() {
  return (
    <View style={styles.screen}>
      <Text style={styles.label}>ACTIVITY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SQ.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Font.monoBold,
    fontSize: 12,
    letterSpacing: 2,
    color: SQ.ink,
  },
});
