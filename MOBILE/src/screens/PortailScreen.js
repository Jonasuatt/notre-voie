import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Porte d'entrée de l'app, calquée sur celle du site : deux rédactions, deux
// interfaces. Le choix conditionne la barre d'onglets et le portail dont les
// articles sont tirés — Le Quotidien reprend le journal papier, Info en
// direct est animé par la rédaction web.
export default function PortailScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.centre}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.surtitre}>CHOISISSEZ VOTRE ÉDITION</Text>
        <Text style={styles.titre}>Aussi rapide que les réseaux sociaux, aussi fiable qu&apos;un journal</Text>

        <TouchableOpacity
          style={[styles.carte, styles.carteDirect]}
          onPress={() => navigation.navigate('InfoDirect')}
          activeOpacity={0.85}
        >
          <View style={styles.ligneEyebrow}>
            <View style={styles.pastille} />
            <Text style={styles.eyebrowDirect}>L&apos;ACTUALITÉ AU FIL DE L&apos;EAU</Text>
          </View>
          <Text style={styles.carteTitreClair}>Info en direct</Text>
          <Text style={styles.carteTexteClair}>
            L&apos;édition animée au quotidien par la rédaction web, pour suivre l&apos;actualité en temps réel.
          </Text>
          <Text style={styles.entrerClair}>Entrer →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.carte, styles.carteQuotidien]}
          onPress={() => navigation.navigate('Quotidien')}
          activeOpacity={0.85}
        >
          <Text style={styles.eyebrowQuotidien}>LE JOURNAL, CHAQUE JOUR</Text>
          <Text style={styles.carteTitreSombre}>Le Quotidien</Text>
          <Text style={styles.carteTexteSombre}>
            L&apos;édition fidèle au journal papier : rubriques traditionnelles, Une du jour, kiosque et archives.
          </Text>
          <Text style={styles.entrerSombre}>Entrer →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.ink },
  centre: { flex: 1, justifyContent: 'center', paddingHorizontal: 22 },
  logo: { width: 132, height: 92, alignSelf: 'center', marginBottom: 22 },
  surtitre: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6, color: 'rgba(255,255,255,0.42)', textAlign: 'center' },
  titre: { fontSize: 21, fontWeight: '700', color: '#fff', textAlign: 'center', marginTop: 8, lineHeight: 28 },
  carte: { borderRadius: 18, padding: 20, marginTop: 18 },
  carteDirect: { backgroundColor: '#0B3358', borderWidth: 1, borderColor: 'rgba(79,179,240,0.3)' },
  carteQuotidien: { backgroundColor: colors.paper },
  ligneEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pastille: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4FB3F0' },
  eyebrowDirect: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.1, color: '#4FB3F0' },
  eyebrowQuotidien: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.1, color: colors.coral },
  carteTitreClair: { fontSize: 23, fontWeight: '800', color: '#fff', marginTop: 6 },
  carteTitreSombre: { fontSize: 23, fontWeight: '800', color: colors.ink, marginTop: 6 },
  carteTexteClair: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 19 },
  carteTexteSombre: { fontSize: 13, color: colors.muted, marginTop: 8, lineHeight: 19 },
  entrerClair: { fontSize: 13, fontWeight: '700', color: '#4FB3F0', marginTop: 14 },
  entrerSombre: { fontSize: 13, fontWeight: '700', color: colors.navy, marginTop: 14 },
});
