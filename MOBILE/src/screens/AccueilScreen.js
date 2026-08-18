import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { articlesAPI, rubriquesAPI, prixVieChereAPI, factCheckAPI } from '../api/api';
import FlashBar from '../components/FlashBar';
import TickerVieChere from '../components/TickerVieChere';
import ArticleCard from '../components/ArticleCard';
import FormatBadge from '../components/FormatBadge';
import { colors } from '../theme/colors';
import { timeAgo } from '../utils/format';

export default function AccueilScreen() {
  const navigation = useNavigation();
  const [articles, setArticles] = useState([]);
  const [prix, setPrix] = useState([]);
  const [factChecks, setFactChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [a, p, f] = await Promise.all([
      articlesAPI.list({ pageSize: 20 }),
      prixVieChereAPI.ticker(),
      factCheckAPI.list(),
    ]);
    setArticles(a.data.articles);
    setPrix(p.data.prix);
    setFactChecks(f.data.factChecks);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <View style={styles.center}><Text style={styles.loading}>Chargement…</Text></View>;

  const flashEtLive = articles.filter((a) => a.format === 'FLASH' || a.format === 'LIVE').slice(0, 8);
  const une = articles[0];
  const resume = articles.slice(1, 6);
  const fc = factChecks[0];

  return (
    <FlatList
      style={styles.page}
      data={articles.slice(0, 12)}
      keyExtractor={(a) => a.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.navy} />}
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 16 }}>
          <ArticleCard article={item} />
        </View>
      )}
      ListHeaderComponent={
        <>
          <FlashBar articles={flashEtLive} />
          <TickerVieChere prix={prix} />

          {une && (
            <TouchableOpacity style={styles.hero} activeOpacity={0.9} onPress={() => navigation.navigate('Article', { slug: une.slug })}>
              <LinearGradient colors={[colors.navy2, colors.navy]} style={styles.heroImage}>
                <FormatBadge format={une.format} />
              </LinearGradient>
              <Text style={[styles.heroRubrique, { color: une.rubrique?.couleur || colors.navy }]}>{une.rubrique?.nom}</Text>
              <Text style={styles.heroTitre}>{une.titre}</Text>
              {!!une.chapo && <Text style={styles.heroChapo}>{une.chapo}</Text>}
              <Text style={styles.heroMeta}>{timeAgo(une.publieLe)} {une.auteur ? `· ${une.auteur.prenom} ${une.auteur.nom}` : ''}</Text>
            </TouchableOpacity>
          )}

          {resume.length > 0 && (
            <View style={styles.resumeCard}>
              <Text style={styles.resumeTitle}>5 choses à retenir aujourd'hui</Text>
              {resume.map((a, i) => (
                <TouchableOpacity key={a.id} onPress={() => navigation.navigate('Article', { slug: a.slug })}>
                  <Text style={styles.resumeItem}>{i + 1}. {a.titre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {fc && (
            <TouchableOpacity style={styles.factCheck} onPress={() => navigation.navigate('Article', { slug: fc.article.slug })}>
              <View style={styles.factCheckIcon}><Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.factCheckLabel}>VÉRITÉ OU INTOX — {fc.verdict}</Text>
                <Text style={styles.factCheckTitre} numberOfLines={2}>{fc.article.titre}</Text>
              </View>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>À la Une</Text>
        </>
      }
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  loading: { color: colors.muted, fontSize: 13 },
  hero: { margin: 16, marginBottom: 8 },
  heroImage: { height: 180, borderRadius: 12 },
  heroRubrique: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 10 },
  heroTitre: { fontSize: 21, fontWeight: '800', color: colors.ink, marginTop: 6, lineHeight: 27 },
  heroChapo: { fontSize: 13.5, color: colors.muted, marginTop: 8, lineHeight: 19 },
  heroMeta: { fontSize: 10.5, color: colors.muted, marginTop: 10 },
  resumeCard: { backgroundColor: colors.navy, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16 },
  resumeTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 10 },
  resumeItem: { color: '#D8DCEA', fontSize: 12.5, lineHeight: 22 },
  factCheck: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#FBF3E4', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F0DFB8' },
  factCheckIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  factCheckLabel: { fontSize: 9.5, fontWeight: '800', color: colors.gold, letterSpacing: 0.4 },
  factCheckTitre: { fontSize: 13.5, fontWeight: '700', color: colors.ink, marginTop: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginHorizontal: 16, marginTop: 22, marginBottom: 10 },
});
