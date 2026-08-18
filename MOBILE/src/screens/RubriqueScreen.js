import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { articlesAPI, rubriquesAPI } from '../api/api';
import ArticleCard from '../components/ArticleCard';
import RubriqueTabs from '../components/RubriqueTabs';
import { colors } from '../theme/colors';

export default function RubriqueScreen() {
  const [rubriques, setRubriques] = useState([]);
  const [active, setActive] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rubriquesAPI.getAll().then((r) => setRubriques(r.data.rubriques));
  }, []);

  useEffect(() => {
    setLoading(true);
    articlesAPI.list({ rubrique: active || undefined, pageSize: 30 })
      .then((r) => setArticles(r.data.articles))
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <View style={styles.page}>
      <RubriqueTabs rubriques={rubriques} active={active} onSelect={setActive} />
      <FlatList
        data={articles}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        renderItem={({ item }) => <ArticleCard article={item} />}
        ListEmptyComponent={
          !loading && <Text style={styles.empty}>Aucun article publié dans cette rubrique pour le moment.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 40 },
});
