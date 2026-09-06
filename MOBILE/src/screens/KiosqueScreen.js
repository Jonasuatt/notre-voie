import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, Linking, StyleSheet,
  ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import { editionsAPI } from '../api/api';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/format';

const PAR_PAGE = 24;

// Kiosque : les parutions du journal, la plus récente en tête. Le fonds
// compte plusieurs centaines de numéros, d'où le chargement par pages au fil
// du défilement plutôt qu'un lot figé.
export default function KiosqueScreen() {
  const [editions, setEditions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [aDeverrouiller, setADeverrouiller] = useState(null);
  const [code, setCode] = useState('');
  const [envoi, setEnvoi] = useState(false);

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

  // Le PDF complet est réservé aux abonnés : c'est le code qui l'ouvre, et
  // l'API ne renvoie l'adresse du fichier qu'une fois le code accepté.
  const ouvrirPdf = async () => {
    setEnvoi(true);
    try {
      const { data } = await editionsAPI.deverrouiller(aDeverrouiller.id, code.trim().toUpperCase());
      setADeverrouiller(null);
      setCode('');
      if (data.pdfUrl) Linking.openURL(data.pdfUrl);
    } catch (err) {
      Alert.alert('Code refusé', err.response?.data?.error || "Ce code ne correspond à aucun abonnement.");
    } finally {
      setEnvoi(false);
    }
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
          <TouchableOpacity style={styles.card} onPress={() => setADeverrouiller(item)}>
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

      <Modal visible={!!aDeverrouiller} transparent animationType="fade" onRequestClose={() => setADeverrouiller(null)}>
        <View style={styles.fond}>
          <View style={styles.boite}>
            <Text style={styles.boiteTitre}>Numéro {aDeverrouiller?.numero}</Text>
            <Text style={styles.boiteTexte}>
              Le journal complet en PDF est réservé aux abonnés. Saisissez le code reçu par mail.
            </Text>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="NV-XXXXXX"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.input}
            />
            <TouchableOpacity
              style={[styles.btn, (!code || envoi) && styles.btnInactif]}
              onPress={ouvrirPdf}
              disabled={!code || envoi}
            >
              {envoi ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Ouvrir le PDF</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setADeverrouiller(null); setCode(''); }}>
              <Text style={styles.annuler}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  fond: { flex: 1, backgroundColor: 'rgba(7,39,66,0.75)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  boite: { backgroundColor: colors.paper, borderRadius: 16, padding: 22, width: '100%' },
  boiteTitre: { fontSize: 17, fontWeight: '800', color: colors.ink },
  boiteTexte: { fontSize: 13, color: colors.muted, marginTop: 8, lineHeight: 19 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 11, fontSize: 13.5, color: colors.ink, letterSpacing: 1, marginTop: 16 },
  btn: { backgroundColor: colors.coral, borderRadius: 100, paddingVertical: 13, marginTop: 12, alignItems: 'center' },
  btnInactif: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  annuler: { textAlign: 'center', color: colors.muted, fontSize: 12.5, marginTop: 14 },
});
