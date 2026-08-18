import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { articlesAPI, paiementsAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import FormatBadge from '../components/FormatBadge';
import Paywall from '../components/Paywall';
import { colors } from '../theme/colors';
import { formatDate, timeAgo } from '../utils/format';

const VERDICT_LABEL = { VRAI: 'Vrai', FAUX: 'Faux', TROMPEUR: 'Trompeur', NON_VERIFIABLE: 'Non vérifiable' };
const VERDICT_COLOR = { VRAI: '#16A34A', FAUX: colors.coral, TROMPEUR: colors.gold, NON_VERIFIABLE: colors.muted };

export default function ArticleScreen({ route }) {
  const { slug } = route.params;
  const { reader } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articlesAPI.getBySlug(slug).then((r) => {
      setArticle(r.data.article);
      articlesAPI.enregistrerVue(r.data.article.id);
    }).finally(() => setLoading(false));
  }, [slug]);

  const payerArticle = async () => {
    if (!reader) {
      Alert.alert('Connexion requise', 'Créez un compte ou connectez-vous pour payer cet article.');
      return;
    }
    try {
      await paiementsAPI.payerArticle({ articleId: article.id, moyenPaiement: 'ORANGE_MONEY', montant: 200 });
      Alert.alert('Paiement initié', "Confirmez le paiement sur votre téléphone (mobile money) pour débloquer l'article.");
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Paiement impossible.');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.navy} /></View>;
  if (!article) return <View style={styles.center}><Text>Article introuvable.</Text></View>;

  const verrouille = article.paywallLocked;
  const verdictColor = article.factCheck ? VERDICT_COLOR[article.factCheck.verdict] : null;

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <View style={styles.badges}>
        <View style={{ position: 'relative', paddingLeft: 4 }}><FormatBadge format={article.format} /></View>
        <Text style={[styles.rubrique, { color: article.rubrique?.couleur || colors.navy }]}>{article.rubrique?.nom}</Text>
      </View>

      <Text style={styles.titre}>{article.titre}</Text>
      {!!article.chapo && <Text style={styles.chapo}>{article.chapo}</Text>}

      <View style={styles.metaRow}>
        {article.auteur && <Text style={styles.metaText}>{article.auteur.prenom} {article.auteur.nom}</Text>}
        <Text style={styles.metaText}>{formatDate(article.publieLe)} · {timeAgo(article.publieLe)}</Text>
        <Text style={styles.metaText}>👁 {article.vuesTotal?.toLocaleString('fr-FR')}</Text>
      </View>

      <LinearGradient colors={[colors.navy2, colors.navy]} style={styles.image} />

      {article.factCheck && (
        <View style={[styles.factCheck, { borderColor: verdictColor }]}>
          <Text style={[styles.factCheckLabel, { color: verdictColor }]}>
            Verdict Vérité ou Intox : {VERDICT_LABEL[article.factCheck.verdict]}
          </Text>
          {!!article.factCheck.rumeurOrigine && (
            <Text style={styles.factCheckText}>Rumeur : {article.factCheck.rumeurOrigine}</Text>
          )}
          {!!article.factCheck.preuves && (
            <Text style={styles.factCheckText}>Vérification : {article.factCheck.preuves}</Text>
          )}
        </View>
      )}

      {article.format === 'LIVE' && article.liveUpdates?.length > 0 && (
        <View style={{ marginTop: 18 }}>
          {article.liveUpdates.map((u) => (
            <View key={u.id} style={styles.liveItem}>
              <Text style={styles.liveTime}>{timeAgo(u.horodatage)}</Text>
              <Text style={styles.liveText}>{u.contenu}</Text>
            </View>
          ))}
        </View>
      )}

      {verrouille ? (
        <Paywall onPayerArticle={payerArticle} />
      ) : (
        !!article.contenuHtml && (
          // Rendu simplifié : l'app n'embarque pas de moteur HTML complet,
          // le texte brut suffit pour la lecture mobile (les balises basiques
          // sont retirées côté affichage).
          <Text style={styles.corps}>{article.contenuHtml.replace(/<[^>]+>/g, '\n').replace(/\n{2,}/g, '\n\n').trim()}</Text>
        )
      )}

      {article.tags?.length > 0 && (
        <View style={styles.tags}>
          {article.tags.map((t) => <Text key={t} style={styles.tag}>#{t}</Text>)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rubrique: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  titre: { fontSize: 24, fontWeight: '800', color: colors.ink, marginTop: 12, lineHeight: 30 },
  chapo: { fontSize: 15, color: colors.muted, marginTop: 10, lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 16, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line },
  metaText: { fontSize: 11, color: colors.muted },
  image: { height: 200, borderRadius: 12, marginTop: 16 },
  factCheck: { marginTop: 16, borderLeftWidth: 4, borderRadius: 8, backgroundColor: '#FBF3E4', padding: 14 },
  factCheckLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  factCheckText: { fontSize: 13, color: colors.ink, marginTop: 6, lineHeight: 19 },
  liveItem: { borderLeftWidth: 2, borderLeftColor: colors.coral, paddingLeft: 12, marginBottom: 14 },
  liveTime: { fontSize: 10.5, fontWeight: '700', color: colors.coral },
  liveText: { fontSize: 14, color: colors.ink, marginTop: 3, lineHeight: 20 },
  corps: { fontSize: 15.5, color: colors.ink, marginTop: 18, lineHeight: 25 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 22, paddingTop: 16, borderTopWidth: 1, borderColor: colors.line },
  tag: { fontSize: 11, color: colors.muted, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
});
