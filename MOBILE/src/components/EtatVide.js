import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Écran de repli quand le contenu n'a pas pu être chargé. Le réseau est
// souvent lent ou coupé : mieux vaut dire ce qui se passe et offrir de
// réessayer qu'afficher une page blanche, qui laisse croire à une app cassée.
export default function EtatVide({ chargement, erreur, onReessayer, message }) {
  if (chargement) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator color={colors.navy} />
        <Text style={styles.texte}>Chargement…</Text>
      </View>
    );
  }

  if (erreur) {
    return (
      <View style={styles.centre}>
        <Ionicons name="cloud-offline-outline" size={38} color={colors.line} />
        <Text style={styles.titre}>Contenu indisponible</Text>
        <Text style={styles.texte}>
          Impossible de joindre le journal. Vérifiez votre connexion — la première ouverture peut demander
          quelques secondes.
        </Text>
        {onReessayer && (
          <TouchableOpacity style={styles.bouton} onPress={onReessayer}>
            <Text style={styles.boutonTexte}>Réessayer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.centre}>
      <Text style={styles.texte}>{message || 'Rien à afficher pour le moment.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centre: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, paddingVertical: 60 },
  titre: { fontSize: 15.5, fontWeight: '700', color: colors.ink, marginTop: 12 },
  texte: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  bouton: { backgroundColor: colors.navy, borderRadius: 100, paddingHorizontal: 26, paddingVertical: 11, marginTop: 18 },
  boutonTexte: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
