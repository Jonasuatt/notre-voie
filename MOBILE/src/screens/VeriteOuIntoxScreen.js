import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { factCheckAPI } from '../api/api';
import { colors } from '../theme/colors';

const VERDICT_LABEL = { VRAI: 'Vrai', FAUX: 'Faux', TROMPEUR: 'Trompeur', NON_VERIFIABLE: 'Non vérifiable' };
const VERDICT_COLOR = { VRAI: '#16A34A', FAUX: colors.coral, TROMPEUR: colors.gold, NON_VERIFIABLE: colors.muted };

export default function VeriteOuIntoxScreen() {
  const navigation = useNavigation();
  const [factChecks, setFactChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    factCheckAPI.list().then((r) => setFactChecks(r.data.factChecks)).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>RUBRIQUE</Text>
        <Text style={styles.title}>Vérité ou Intox</Text>
        <Text style={styles.desc}>Vérification des rumeurs et vidéos virales identifiées sur les réseaux sociaux.</Text>
      </View>
      <FlatList
        data={factChecks}
        keyExtractor={(f) => f.article.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Article', { slug: item.article.slug })}>
            <Text style={[styles.verdict, { color: VERDICT_COLOR[item.verdict] }]}>Verdict : {VERDICT_LABEL[item.verdict]}</Text>
            <Text style={styles.titre}>{item.article.titre}</Text>
            {!!item.article.chapo && <Text style={styles.chapo} numberOfLines={2}>{item.article.chapo}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && <Text style={styles.empty}>Aucune vérification publiée pour le moment.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  header: { padding: 18, paddingBottom: 4 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: colors.gold, letterSpacing: 0.6 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginTop: 4 },
  desc: { fontSize: 13, color: colors.muted, marginTop: 6 },
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 16, marginBottom: 12 },
  verdict: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  titre: { fontSize: 15.5, fontWeight: '700', color: colors.ink, marginTop: 6 },
  chapo: { fontSize: 12.5, color: colors.muted, marginTop: 6, lineHeight: 18 },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 40 },
});
