import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { rubriquesAPI } from '../api/api';
import { colors } from '../theme/colors';
import { usePortail } from '../context/PortailContext';

// Liste des rubriques : le lecteur choisit d'abord un thème, puis lit les
// articles qui s'y rattachent (écran RubriqueArticles). Les onglets
// horizontaux précédents obligeaient à balayer une quinzaine d'entrées pour
// atteindre la dernière.
export default function RubriquesScreen({ navigation }) {
  const [rubriques, setRubriques] = useState([]);
  const [chargement, setChargement] = useState(true);
  const { portail } = usePortail();

  useEffect(() => {
    rubriquesAPI
      .getAll('EDITORIALE')
      .then((r) => setRubriques(r.data.rubriques.filter((x) => !x.parentId)))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <ActivityIndicator color={colors.navy} style={{ marginTop: 40 }} />;

  return (
    <View style={styles.page}>
      <FlatList
        data={rubriques}
        keyExtractor={(r) => r.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        ListHeaderComponent={
          <View style={styles.entete}>
            <Text style={styles.titre}>Rubriques</Text>
            <Text style={styles.sous}>
              {portail === 'QUOTIDIEN' ? 'Les rubriques du journal' : "L'actualité par thème"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.carte, { borderLeftColor: item.couleur || colors.navy }]}
            onPress={() => navigation.navigate('RubriqueArticles', { slug: item.slug, nom: item.nom })}
            activeOpacity={0.8}
          >
            <Text style={styles.nom}>{item.nom}</Text>
            {item.angleEditorial ? (
              <Text style={styles.angle} numberOfLines={2}>{item.angleEditorial}</Text>
            ) : null}
            <Ionicons name="chevron-forward" size={15} color={colors.muted} style={styles.fleche} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  entete: { paddingHorizontal: 6, paddingTop: 8, paddingBottom: 12 },
  titre: { fontSize: 22, fontWeight: '800', color: colors.ink },
  sous: { fontSize: 13, color: colors.muted, marginTop: 4 },
  carte: {
    flex: 1 / 2, margin: 6, backgroundColor: colors.paper, borderRadius: 12, padding: 14,
    borderLeftWidth: 3, minHeight: 96, justifyContent: 'center',
  },
  nom: { fontSize: 15, fontWeight: '700', color: colors.ink },
  angle: { fontSize: 11, color: colors.muted, marginTop: 5, lineHeight: 15 },
  fleche: { position: 'absolute', right: 10, bottom: 10 },
});
