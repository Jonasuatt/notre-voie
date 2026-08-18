import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { formatFCFA } from '../utils/format';

export default function TickerVieChere({ prix }) {
  if (!prix?.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.tag}>
        <Text style={styles.tagText}>VIE CHÈRE</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {prix.map((p) => {
          const hausse = (p.variationPct || 0) > 0;
          const baisse = (p.variationPct || 0) < 0;
          return (
            <Text key={p.id} style={styles.item}>
              {p.produit} <Text style={styles.bold}>{formatFCFA(p.prix)}</Text>
              {hausse && <Text style={styles.up}> ▲{p.variationPct}%</Text>}
              {baisse && <Text style={styles.down}> ▼{Math.abs(p.variationPct)}%</Text>}
            </Text>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.ink, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  tag: { backgroundColor: colors.coral, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginLeft: 16, marginRight: 12 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  scroll: { alignItems: 'center', paddingRight: 16, gap: 20 },
  item: { color: '#fff', fontSize: 12 },
  bold: { fontWeight: '700' },
  up: { color: '#F87171' },
  down: { color: '#4ADE80' },
});
