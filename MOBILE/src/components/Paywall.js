import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

// Paywall souple : jamais un mur bloquant sans alternative — abonnement
// ou paiement à l'unité (cahier des charges §3.4 et §4).
export default function Paywall({ onPayerArticle }) {
  const navigation = useNavigation();

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>ARTICLE RÉSERVÉ</Text>
      <Text style={styles.title}>Poursuivez votre lecture</Text>
      <Text style={styles.desc}>
        Cet article fait partie du contenu Notre Voie premium. Abonnez-vous pour un accès illimité, ou lisez celui-ci à l'unité.
      </Text>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Abonnement')}>
        <Text style={styles.btnPrimaryText}>S'abonner (dès 2 000 FCFA/mois)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={onPayerArticle}>
        <Text style={styles.btnSecondaryText}>Payer cet article seul (200 FCFA)</Text>
      </TouchableOpacity>
      <Text style={styles.moyens}>Orange Money · MTN MoMo · Moov Money · Carte bancaire</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.paper, padding: 22, alignItems: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '800', color: colors.coral, letterSpacing: 1 },
  title: { fontSize: 19, fontWeight: '700', color: colors.ink, marginTop: 6, textAlign: 'center' },
  desc: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  btnPrimary: { backgroundColor: colors.coral, borderRadius: 100, paddingVertical: 13, paddingHorizontal: 22, marginTop: 18, width: '100%' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13.5, textAlign: 'center' },
  btnSecondary: { borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingVertical: 13, paddingHorizontal: 22, marginTop: 10, width: '100%' },
  btnSecondaryText: { color: colors.ink, fontWeight: '700', fontSize: 13.5, textAlign: 'center' },
  moyens: { fontSize: 10, color: colors.muted, marginTop: 14 },
});
