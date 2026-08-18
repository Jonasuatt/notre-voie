import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function RubriqueTabs({ rubriques, active, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wrap}>
      <TouchableOpacity
        style={[styles.tab, !active && styles.tabActive]}
        onPress={() => onSelect(null)}
      >
        <Text style={[styles.text, !active && styles.textActive]}>Toutes</Text>
      </TouchableOpacity>
      {rubriques.filter((r) => r.type === 'EDITORIALE').map((r) => (
        <TouchableOpacity
          key={r.id}
          style={[styles.tab, active === r.slug && { backgroundColor: r.couleur || colors.navy, borderColor: r.couleur || colors.navy }]}
          onPress={() => onSelect(r.slug)}
        >
          <Text style={[styles.text, active === r.slug && styles.textActive]}>{r.nom}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  tabActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  text: { fontSize: 12.5, fontWeight: '700', color: colors.muted },
  textActive: { color: '#fff' },
});
