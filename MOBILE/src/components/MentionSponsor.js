import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Mention d'un contenu payé par un tiers.
//
// Placée avant le titre, jamais en bas de l'article : le lecteur doit savoir
// qu'il lit un contenu commercial avant de le lire, pas après. C'est la règle
// déontologique qui accompagne la vente de publi-reportages, et la condition
// pour que le reste du journal garde sa crédibilité. Le site l'affiche déjà —
// l'application doit dire la même chose du même contenu.
export default function MentionSponsor({ article, compact = false }) {
  if (!article?.sponsorNom) return null;
  const mention = article.sponsorMention || 'Contenu sponsorisé';

  if (compact) {
    return (
      <View style={styles.pastille}>
        <Text style={styles.pastilleTexte}>{mention}</Text>
      </View>
    );
  }

  return (
    <View style={styles.bloc}>
      <Text style={styles.mention}>{mention}</Text>
      <Text style={styles.detail}>
        Payé par {article.sponsorNom}. Ce contenu n'engage pas la rédaction.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bloc: {
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    backgroundColor: 'rgba(232,184,75,0.12)',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 12,
    marginTop: 12,
  },
  mention: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', color: '#8A6410' },
  detail: { fontSize: 12.5, color: colors.muted, marginTop: 3, lineHeight: 17 },
  pastille: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginBottom: 4,
  },
  pastilleTexte: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#8A6410' },
});
