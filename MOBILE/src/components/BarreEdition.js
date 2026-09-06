import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Rappelle l'édition ouverte et permet d'en changer. Une fois entré dans une
// interface, le lecteur n'avait plus aucun moyen de revenir au portail.
export default function BarreEdition({ navigation, edition, accent }) {
  return (
    <View style={styles.barre}>
      <Text style={[styles.nom, { color: accent }]}>{edition}</Text>
      <TouchableOpacity
        style={styles.bouton}
        onPress={() => navigation.navigate('Portail')}
        hitSlop={10}
      >
        <Ionicons name="swap-horizontal" size={14} color="rgba(255,255,255,0.75)" />
        <Text style={styles.boutonTexte}>Changer d&apos;édition</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  barre: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.ink, paddingHorizontal: 16, paddingVertical: 9,
  },
  nom: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  bouton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  boutonTexte: { color: 'rgba(255,255,255,0.75)', fontSize: 11.5, fontWeight: '600' },
});
