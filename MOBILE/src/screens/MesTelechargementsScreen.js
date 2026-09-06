import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { formatDateRange } from '../utils/format';
import { listerTelechargements, supprimerNumero } from '../utils/telechargements';
import LecteurJournal from '../components/LecteurJournal';

// Numéros gardés sur le téléphone. La connexion étant irrégulière et souvent
// facturée à la donnée, un abonné doit pouvoir charger son journal quand le
// réseau est bon et le lire plus tard, sans rien consommer.
export default function MesTelechargementsScreen() {
  const [numeros, setNumeros] = useState([]);
  const [lecture, setLecture] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let vivant = true;
      listerTelechargements().then((l) => vivant && setNumeros(l));
      return () => { vivant = false; };
    }, []),
  );

  const supprimer = (numero) => {
    Alert.alert('Retirer ce numéro ?', `Le n°${numero} sera effacé du téléphone. Vous pourrez le retélécharger.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          await supprimerNumero(numero);
          setNumeros(await listerTelechargements());
        },
      },
    ]);
  };

  return (
    <View style={styles.page}>
      <View style={styles.entete}>
        <Text style={styles.titre}>Hors connexion</Text>
        <Text style={styles.sous}>
          {numeros.length
            ? `${numeros.length} numéro${numeros.length > 1 ? 's' : ''} sur ce téléphone`
            : 'Vos numéros téléchargés apparaîtront ici'}
        </Text>
      </View>

      <FlatList
        data={numeros}
        keyExtractor={(n) => String(n.numero)}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        renderItem={({ item }) => (
          <View style={styles.ligne}>
            {item.couvertureUrl ? (
              <Image source={{ uri: item.couvertureUrl }} style={styles.vignette} resizeMode="cover" />
            ) : (
              <View style={[styles.vignette, styles.vignetteVide]}><Text style={styles.pdf}>PDF</Text></View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.numero}>N°{item.numero}</Text>
              <Text style={styles.date}>{formatDateRange(item.dateParution, item.dateFin)}</Text>
              <TouchableOpacity onPress={() => setLecture(item)}>
                <Text style={styles.lire}>Lire le journal · {item.pages?.length || 0} pages →</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => supprimer(item.numero)} hitSlop={10}>
              <Ionicons name="trash-outline" size={19} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.vide}>
            <Ionicons name="cloud-download-outline" size={38} color={colors.line} />
            <Text style={styles.videTitre}>Aucun numéro téléchargé</Text>
            <Text style={styles.videTexte}>
              Ouvrez un numéro dans le kiosque, débloquez-le avec votre code, puis touchez
              « Garder pour lire hors connexion ».
            </Text>
          </View>
        }
      />

      {lecture && (
        <LecteurJournal edition={lecture} pages={lecture.pages} onFermer={() => setLecture(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  entete: { padding: 18, paddingBottom: 8 },
  titre: { fontSize: 22, fontWeight: '800', color: colors.ink },
  sous: { fontSize: 13, color: colors.muted, marginTop: 4 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.paper, borderRadius: 12, padding: 12, marginBottom: 10 },
  vignette: { width: 52, height: 70, borderRadius: 6, backgroundColor: colors.navy },
  vignetteVide: { alignItems: 'center', justifyContent: 'center' },
  pdf: { color: '#fff', fontSize: 9, fontWeight: '800' },
  numero: { fontSize: 15, fontWeight: '700', color: colors.ink },
  date: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
  lire: { fontSize: 12.5, fontWeight: '700', color: colors.navy2, marginTop: 8 },
  vide: { alignItems: 'center', marginTop: 60, paddingHorizontal: 30 },
  videTitre: { fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 12 },
  videTexte: { fontSize: 12.5, color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 18 },
});
