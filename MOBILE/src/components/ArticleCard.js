import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import FormatBadge from './FormatBadge';
import { colors } from '../theme/colors';
import { timeAgo } from '../utils/format';

export default function ArticleCard({ article }) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('Article', { slug: article.slug })}
    >
      <LinearGradient colors={[colors.navy2, colors.navy]} style={styles.image}>
        <FormatBadge format={article.format} />
        {article.paywall === 'PAYANT' && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>Abonnés</Text>
          </View>
        )}
      </LinearGradient>
      <View style={styles.body}>
        <Text style={[styles.rubrique, { color: article.rubrique?.couleur || colors.navy }]}>
          {article.rubrique?.nom}
        </Text>
        <Text style={styles.titre} numberOfLines={2}>{article.titre}</Text>
        {!!article.chapo && <Text style={styles.chapo} numberOfLines={2}>{article.chapo}</Text>}
        <Text style={styles.meta}>{timeAgo(article.publieLe)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, marginBottom: 16 },
  image: { height: 140, justifyContent: 'flex-end' },
  lockBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(20,20,31,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  lockText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  body: { padding: 14 },
  rubrique: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  titre: { fontSize: 16, fontWeight: '700', color: colors.ink, lineHeight: 21 },
  chapo: { fontSize: 12.5, color: colors.muted, marginTop: 6, lineHeight: 18 },
  meta: { fontSize: 10.5, color: colors.muted, marginTop: 10, fontVariant: ['tabular-nums'] },
});
