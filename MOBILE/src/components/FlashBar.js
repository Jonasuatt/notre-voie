import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

// Bandeau "façon stories" — le format qui capte l'attention avant même le
// premier scroll (cf. cahier des charges §3.4).
export default function FlashBar({ articles }) {
  const navigation = useNavigation();
  if (!articles?.length) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {articles.map((a) => (
          <TouchableOpacity key={a.id} style={styles.item} onPress={() => navigation.navigate('Article', { slug: a.slug })}>
            <View style={[styles.ring, a.format === 'LIVE' && styles.ringLive]}>
              <View style={styles.inner}>
                {a.format === 'LIVE' ? (
                  <Text style={styles.directText}>DIRECT</Text>
                ) : (
                  <Text style={styles.flashIcon}>⚡</Text>
                )}
              </View>
            </View>
            <Text style={styles.label} numberOfLines={2}>{a.titre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.navy, paddingVertical: 16 },
  scroll: { paddingHorizontal: 16, gap: 16 },
  item: { width: 74, alignItems: 'center' },
  ring: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  ringLive: { borderColor: colors.coral },
  inner: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.navy2, alignItems: 'center', justifyContent: 'center' },
  flashIcon: { fontSize: 18 },
  directText: { fontSize: 8, fontWeight: '800', color: '#fff', backgroundColor: colors.coral, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  label: { fontSize: 9.5, color: '#CBD3EC', textAlign: 'center', lineHeight: 12 },
});
