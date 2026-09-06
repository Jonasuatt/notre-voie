import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, RefreshControl, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { articlesAPI, prixVieChereAPI, editionsAPI } from '../api/api';
import TickerVieChere from '../components/TickerVieChere';
import ArticleCard from '../components/ArticleCard';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import VisionneuseUne from '../components/VisionneuseUne';
import EtatVide from '../components/EtatVide';
import BarreEdition from '../components/BarreEdition';
import { formatDateRange } from '../utils/format';

// Accueil du Quotidien — l'édition du jour telle qu'elle paraît : la Une en
// grand, puis les pages intérieures, comme sur le site. Chaque page ouvre la
// visionneuse du kiosque.
export default function AccueilScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [edition, setEdition] = useState(null);
  const [articles, setArticles] = useState([]);
  const [prix, setPrix] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [rafraichit, setRafraichit] = useState(false);
  const [visionneuse, setVisionneuse] = useState(null);
  const [erreur, setErreur] = useState(false);

  const charger = useCallback(async () => {
    // allSettled et non all : le bandeau des prix ou le fil peuvent manquer
    // sans qu'on prive le lecteur de l'édition du jour.
    const [e, a, p] = await Promise.allSettled([
      editionsAPI.list({ pageSize: 1 }),
      articlesAPI.list({ pageSize: 12, portail: 'QUOTIDIEN' }),
      prixVieChereAPI.ticker(),
    ]);
    const edi = e.status === 'fulfilled' ? e.value.data.editions?.[0] || null : null;
    const art = a.status === 'fulfilled' ? a.value.data.articles || [] : [];
    setEdition(edi);
    setArticles(art);
    setPrix(p.status === 'fulfilled' ? p.value.data.prix || [] : []);
    setErreur(!edi && !art.length);
  }, []);

  useEffect(() => { charger().finally(() => setChargement(false)); }, [charger]);

  const rafraichir = async () => {
    setRafraichit(true);
    await charger();
    setRafraichit(false);
  };

  if (chargement || erreur) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.cream }}>
        <BarreEdition navigation={navigation} edition="LE QUOTIDIEN" accent={colors.navy2} />
        <EtatVide
          chargement={chargement}
          erreur={erreur}
          onReessayer={() => { setChargement(true); setErreur(false); charger().finally(() => setChargement(false)); }}
        />
      </SafeAreaView>
    );
  }

  const pages = edition?.pages || [];
  const une = pages.find((p) => p.numeroPage === 1) || null;
  const interieures = pages.filter((p) => p.numeroPage > 1);
  const largeurUne = width - 32;
  const resume = articles.slice(0, 5);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.ink }}>
      <StatusBar style="light" />
      <ScrollView
      style={styles.page}
      refreshControl={<RefreshControl refreshing={rafraichit} onRefresh={rafraichir} tintColor={colors.navy} />}
      contentContainerStyle={{ paddingBottom: 28 }}
    >
      <BarreEdition navigation={navigation} edition="LE QUOTIDIEN" accent={colors.navy2} />
      <TickerVieChere prix={prix} />

      {edition && (
        <View style={styles.bloc}>
          <Text style={styles.eyebrow}>L&apos;ÉDITION DU JOUR</Text>
          <Text style={styles.numero}>
            N°{edition.numero} · {formatDateRange(edition.dateParution, edition.dateFin)}
          </Text>

          {une?.imageUrl && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setVisionneuse(edition)}
            >
              <Image
                source={{ uri: une.imageUrl }}
                style={[styles.une, { width: largeurUne, height: largeurUne * 1.35 }]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {interieures.length > 0 && (
            <>
              <Text style={styles.sousTitre}>Les pages du numéro</Text>
              <View style={styles.grillePages}>
                {interieures.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.pageCarte}
                    activeOpacity={0.85}
                    onPress={() => setVisionneuse(edition)}
                  >
                    <Image source={{ uri: p.imageUrl }} style={styles.pageImage} resizeMode="cover" />
                    <Text style={styles.pageNum}>Page {p.numeroPage}</Text>
                    {p.rubriques?.length > 0 && (
                      <Text style={styles.pageRub} numberOfLines={1}>{p.rubriques.join(' · ')}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {resume.length > 0 && (
        <View style={styles.resume}>
          <Text style={styles.resumeTitre}>5 choses à retenir aujourd&apos;hui</Text>
          {resume.map((a, i) => (
            <TouchableOpacity key={a.id} onPress={() => navigation.navigate('Article', { slug: a.slug })}>
              <Text style={styles.resumeItem}>{i + 1}. {a.titre}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {articles.length > 0 && (
        <>
          <Text style={styles.section}>Les articles du jour</Text>
          <View style={{ paddingHorizontal: 16 }}>
            {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
          </View>
        </>
      )}

      <VisionneuseUne
        edition={visionneuse}
        onFermer={() => setVisionneuse(null)}
        onSAbonner={() => navigation.navigate('Abonnement')}
      />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  attente: { color: colors.muted, fontSize: 13 },
  bloc: { paddingHorizontal: 16, paddingTop: 16 },
  eyebrow: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.1, color: colors.coral },
  numero: { fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 4, marginBottom: 12 },
  une: { borderRadius: 12, backgroundColor: colors.navy },
  sousTitre: { fontSize: 12, fontWeight: '700', color: colors.muted, marginTop: 20, marginBottom: 10, letterSpacing: 0.4 },
  grillePages: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  pageCarte: { width: '33.33%', paddingHorizontal: 5, marginBottom: 14 },
  pageImage: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, backgroundColor: colors.navy },
  pageNum: { fontSize: 10.5, fontWeight: '700', color: colors.ink, marginTop: 5 },
  pageRub: { fontSize: 9, color: colors.muted, textTransform: 'capitalize' },
  resume: { backgroundColor: colors.navy, marginHorizontal: 16, marginTop: 18, borderRadius: 12, padding: 16 },
  resumeTitre: { color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 10 },
  resumeItem: { color: '#D8DCEA', fontSize: 12.5, lineHeight: 22 },
  section: { fontSize: 16, fontWeight: '800', color: colors.ink, marginHorizontal: 16, marginTop: 22, marginBottom: 10 },
});
