import { View, Text, StyleSheet } from 'react-native';
import { colors, FORMAT_LABELS } from '../theme/colors';

export default function FormatBadge({ format }) {
  const isLive = format === 'LIVE';
  return (
    <View style={styles.badge}>
      {isLive && <View style={styles.dot} />}
      <Text style={styles.text}>{FORMAT_LABELS[format] || format}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.coral },
  text: { fontSize: 9.5, fontWeight: '700', color: colors.ink, letterSpacing: 0.3 },
});
