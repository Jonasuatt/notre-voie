import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { editionsAPI } from '../api/api';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/format';

export default function KiosqueScreen() {
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    editionsAPI.list({ pageSize: 30 }).then((r) => setEditions(r.data.editions)).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>RUBRIQUE DE SERVICE</Text>
        <Text style={styles.title}>Kiosque numérique</Text>
        <Text style={styles.desc}>Éditions précédentes du journal, consultables en PDF.</Text>
      </View>
      <FlatList
        data={editions}
        keyExtractor={(e) => e.id}
        numColumns={3}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => item.pdfUrl && item.pdfUrl !== '#' && Linking.openURL(item.pdfUrl)}>
            <LinearGradient colors={[colors.navy2, colors.navy]} style={styles.cover}>
              <Text style={styles.pdf}>PDF</Text>
            </LinearGradient>
            <Text style={styles.numero}>N°{item.numero}</Text>
            <Text style={styles.date}>{formatDate(item.dateParution)}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && <Text style={styles.empty}>Aucune édition en ligne pour le moment.</Text>}
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
  cover: { width: '100%', height: 96, borderRadius: 8, alignItems: 'flex-end', justifyContent: 'flex-end', padding: 6 },
  pdf: { backgroundColor: 'rgba(255,255,255,0.9)', color: colors.navy, fontSize: 8, fontWeight: '800', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  numero: { fontSize: 10.5, fontWeight: '700', color: colors.ink, marginTop: 6 },
  date: { fontSize: 9, color: colors.muted },
  empty: { textAlign: 'center', color: colors.muted, fontSize: 13, marginTop: 40 },
});
