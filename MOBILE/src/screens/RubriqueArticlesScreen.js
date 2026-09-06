import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { articlesAPI } from '../api/api';
import ArticleCard from '../components/ArticleCard';
import { colors } from '../theme/colors';
import { usePortail } from '../context/PortailContext';

// Articles d'une rubrique donnée, dans le portail courant.
export default function RubriqueArticlesScreen({ route, navigation }) {
  const { slug, nom } = route.params;
  const [articles, setArticles] = useState([]);
  const [chargement, setChargement] = useState(true);
  const { portail } = usePortail();

  useEffect(() => {
    navigation.setOptions({ title: nom });
    articlesAPI
      .list({ rubrique: slug, portail, pageSize: 40 })
      .then((r) => setArticles(r.data.articles))
      .finally(() => setChargement(false));
  }, [slug, nom, portail, navigation]);

  if (chargement) return <ActivityIndicator color={colors.navy} style={{ marginTop: 40 }} />;

  return (
    <View style={styles.page}>
      <FlatList
        data={articles}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => <ArticleCard article={item} />}
        ListEmptyComponent={<Text style={styles.vide}>Aucun article publié dans cette rubrique pour le moment.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  vide: { textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 40 },
});
