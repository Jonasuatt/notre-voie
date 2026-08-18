import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { abonnementsAPI } from '../api/api';
import { colors } from '../theme/colors';

const FORMULES = [
  { type: 'MENSUEL', label: 'Mensuel', prix: '2 000 FCFA', periode: '/ mois' },
  { type: 'ANNUEL', label: 'Annuel', prix: '18 000 FCFA', periode: '/ an', economie: 'soit 2 mois offerts' },
];

export default function AbonnementScreen({ navigation }) {
  const { reader } = useAuth();
  const [submitting, setSubmitting] = useState(null);

  const souscrire = async (type) => {
    if (!reader) {
      Alert.alert('Connexion requise', 'Créez un compte pour vous abonner.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Créer un compte', onPress: () => navigation.navigate('Inscription') },
      ]);
      return;
    }
    setSubmitting(type);
    try {
      await abonnementsAPI.souscrire({ type, moyenPaiement: 'ORANGE_MONEY' });
      Alert.alert('Abonnement initié', 'Confirmez le paiement sur votre téléphone pour activer votre abonnement.');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.error || 'Souscription impossible.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 22, alignItems: 'center' }}>
      <Text style={styles.eyebrow}>PAYWALL SOUPLE</Text>
      <Text style={styles.title}>Un accès illimité, ou à l'article</Text>
      <Text style={styles.desc}>
        Jamais de mur bloquant sans alternative : abonnez-vous pour un accès illimité, ou réglez uniquement les articles qui vous intéressent.
      </Text>

      {FORMULES.map((f) => (
        <View key={f.type} style={styles.card}>
          <Text style={styles.cardLabel}>{f.label}</Text>
          <Text style={styles.cardPrix}>{f.prix} <Text style={styles.cardPeriode}>{f.periode}</Text></Text>
          {f.economie && <Text style={styles.economie}>{f.economie}</Text>}
          <TouchableOpacity style={styles.btn} onPress={() => souscrire(f.type)} disabled={submitting === f.type}>
            <Text style={styles.btnText}>{submitting === f.type ? 'Souscription…' : 'Choisir cette formule'}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.moyens}>Orange Money · MTN MoMo · Moov Money · Carte bancaire</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  eyebrow: { fontSize: 10, fontWeight: '800', color: colors.coral, letterSpacing: 0.6 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, textAlign: 'center', marginTop: 6 },
  desc: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 10, lineHeight: 19 },
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 20, width: '100%', marginTop: 20 },
  cardLabel: { fontSize: 16, fontWeight: '700', color: colors.ink },
  cardPrix: { fontSize: 26, fontWeight: '800', color: colors.ink, marginTop: 8 },
  cardPeriode: { fontSize: 13, fontWeight: '400', color: colors.muted },
  economie: { fontSize: 11.5, fontWeight: '700', color: colors.navy, marginTop: 4 },
  btn: { backgroundColor: colors.coral, borderRadius: 100, paddingVertical: 13, marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 13.5 },
  moyens: { fontSize: 10.5, color: colors.muted, marginTop: 26 },
});
