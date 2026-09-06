import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { editionsAPI } from '../api/api';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/format';
import VisionneuseUne from '../components/VisionneuseUne';

const PAR_PAGE = 24;

// Kiosque : les parutions du journal, la plus récente en tête. Le fonds
// compte plusieurs centaines de numéros, d'où le chargement par pages au fil
// du défilement plutôt qu'un lot figé.
export default function KiosqueScreen({ navigation }) {
  const [editions, setEditions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [ouverte, setOuverte] = useState(null);

  const charger = useCallback((numeroPage) => {
    setChargement(true);
    editionsAPI
      .list({ page: numeroPage, pageSize: PAR_PAGE })
      .then((r) => {
        setEditions((precedentes) => (numeroPage === 1 ? r.data.editions : [...precedentes, ...r.data.editions]));
        setTotal(r.data.total || 0);
      })
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => { charger(1); }, [charger]);

  const suite = () => {
    if (chargement || editions.length >= total) return;
    const suivante = page + 1;
    setPage(suivante);
    charger(suivante);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>RUBRIQUE DE SERVICE</Text>
        <Text style={styles.title}>Kiosque numérique</Text>
        <Text style={styles.desc}>
          {total ? `${total} parutions archivées, la Une de chaque numéro.` : 'Éditions précédentes du journal.'}
        </Text>
      </View>

      <FlatList
        data={editions}
        keyExtractor={(e) => e.id}
        numColumns={3}
        contentContainerStyle={{ padding: 12 }}
        onEndReached={suite}
        onEndReachedThreshold={0.6}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setOuverte(item)}>
            <View style={styles.cover}>
              {item.couvertureUrl ? (
                <Image source={{ uri: item.couvertureUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <Text style={styles.pdf}>PDF</Text>
              )}
            </View>
            <Text style={styles.numero}>N°{item.numero}</Text>
            <Text style={styles.date}>{formatDate(item.dateParution)}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={chargement ? <ActivityIndicator color={colors.navy} style={{ marginVertical: 18 }} /> : null}
        ListEmptyComponent={!chargement && <Text style={styles.empty}>Aucune édition en ligne pour le moment.</Text>}
      />

      <VisionneuseUne
        edition={ouverte}
        onFermer={() => setOuverte(null)}
        onSAbonner={() => navigation.navigate('Abonnement')}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  header: { padding: 18, paddingBottom: 4 },
  eyebrow: { fontSize: 10, fontWeight: '800', color: colors.coral, letterSpacing: 0.6 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginTop: 4 },
  desc: { fontSize: 13, color: colors.muted, marginTop: 6 },
  card: { flex: 1 / 3, margin: 6, alignItems: 'center' },
  cover: { width: '100%', aspectRatio: 3 / 4, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  pdf: { backgroundColor: 'rgba(255,255,255,0.9)', color: colors.navy, fontSize: 8, fontWeight: '800', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  numero: { fontSize: 10.5, fontWeight: '700', color: colors.ink, marginTop: 6 },
  date: { fontSize: 9, color: colors.muted },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 40 },
});
