import { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, Modal, TouchableOpacity, TextInput, ScrollView,
  ActivityIndicator, StyleSheet, Alert, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { editionsAPI } from '../api/api';
import { colors } from '../theme/colors';
import { formatDateRange } from '../utils/format';
import { telechargerNumero } from '../utils/telechargements';

// Délai de lecture libre de la Une avant que l'accès au numéro complet ne
// soit demandé. Le lecteur a le temps de parcourir les titres — c'est
// l'étalage du kiosque — puis on lui propose d'ouvrir le journal.
const SECONDES_DE_LECTURE = 15;

export default function VisionneuseUne({ edition, onFermer, onSAbonner }) {
  const { width, height } = useWindowDimensions();
  const [reste, setReste] = useState(SECONDES_DE_LECTURE);
  const [demandeAcces, setDemandeAcces] = useState(false);
  const [code, setCode] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const minuteur = useRef(null);

  useEffect(() => {
    if (!edition) return undefined;
    setReste(SECONDES_DE_LECTURE);
    setDemandeAcces(false);
    setPdfUrl(null);
    minuteur.current = setInterval(() => {
      setReste((s) => {
        if (s <= 1) {
          clearInterval(minuteur.current);
          setDemandeAcces(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(minuteur.current);
  }, [edition]);

  const valider = async () => {
    setEnvoi(true);
    try {
      const { data } = await editionsAPI.deverrouiller(edition.id, code.trim().toUpperCase());
      setPdfUrl(data.pdfUrl);
      setDemandeAcces(false);
    } catch (err) {
      Alert.alert('Code refusé', err.response?.data?.error || 'Ce code ne correspond à aucun abonnement.');
    } finally {
      setEnvoi(false);
    }
  };

  const telecharger = async () => {
    setEnvoi(true);
    try {
      await telechargerNumero(edition, pdfUrl);
      Alert.alert(
        'Numéro enregistré',
        `Le n°${edition.numero} est lisible sans connexion depuis l'onglet « Hors connexion ».`,
      );
    } catch {
      Alert.alert('Téléchargement impossible', 'Vérifiez votre connexion et réessayez.');
    } finally {
      setEnvoi(false);
    }
  };

  if (!edition) return null;
  const une = edition.pages?.find((p) => p.numeroPage === 1);
  const image = une?.imageUrl || edition.couvertureUrl;

  return (
    <Modal visible transparent={false} animationType="slide" onRequestClose={onFermer}>
      <View style={styles.page}>
        <View style={styles.barre}>
          <TouchableOpacity onPress={onFermer} hitSlop={12}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.numero}>N°{edition.numero}</Text>
            <Text style={styles.date}>{formatDateRange(edition.dateParution, edition.dateFin)}</Text>
          </View>
          <View style={{ width: 26 }} />
        </View>

        {/* La Une en pleine page, agrandissable au pincement comme un journal
            qu'on rapproche des yeux. */}
        <ScrollView
          maximumZoomScale={4}
          minimumZoomScale={1}
          contentContainerStyle={styles.zone}
          showsVerticalScrollIndicator={false}
        >
          {image ? (
            <Image source={{ uri: image }} style={{ width, height: height * 0.78 }} resizeMode="contain" />
          ) : (
            <Text style={styles.absente}>Couverture indisponible.</Text>
          )}
        </ScrollView>

        {!demandeAcces && !pdfUrl && (
          <View style={styles.compteur}>
            <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.compteurTexte}>Lecture de la Une · {reste}s</Text>
          </View>
        )}

        {pdfUrl && (
          <View style={styles.piedOuvert}>
            <Text style={styles.ouvertTexte}>NUMÉRO DÉBLOQUÉ</Text>
            <TouchableOpacity style={styles.btn} onPress={telecharger} disabled={envoi}>
              {envoi ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-download-outline" size={16} color="#fff" />
                  <Text style={styles.btnTexte}>Télécharger pour lire hors connexion</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={demandeAcces} transparent animationType="fade" onRequestClose={() => setDemandeAcces(false)}>
        <View style={styles.fond}>
          <View style={styles.boite}>
            <Text style={styles.boiteTitre}>Lire le numéro complet</Text>
            <Text style={styles.boiteTexte}>
              Les huit pages du n°{edition.numero} sont réservées aux abonnés. Saisissez le code reçu par mail,
              ou abonnez-vous après inscription.
            </Text>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="NV-XXXXXX"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.champ}
            />
            <TouchableOpacity
              style={[styles.btnPlein, (!code || envoi) && styles.inactif]}
              onPress={valider}
              disabled={!code || envoi}
            >
              {envoi ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnTexte}>Ouvrir le journal</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnContour}
              onPress={() => { setDemandeAcces(false); onFermer(); onSAbonner?.(); }}
            >
              <Text style={styles.btnContourTexte}>S&apos;abonner</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDemandeAcces(false)}>
              <Text style={styles.plusTard}>Continuer à regarder la Une</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  barre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 46, paddingBottom: 10 },
  numero: { color: '#fff', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  date: { color: 'rgba(255,255,255,0.55)', fontSize: 11, textAlign: 'center' },
  zone: { alignItems: 'center', justifyContent: 'center' },
  absente: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 60 },
  compteur: { position: 'absolute', bottom: 26, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100 },
  compteurTexte: { color: 'rgba(255,255,255,0.75)', fontSize: 11.5, fontWeight: '600' },
  piedOuvert: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(7,39,66,0.95)', padding: 16, paddingBottom: 28 },
  ouvertTexte: { color: '#4FB3F0', fontSize: 10.5, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.navy2, borderRadius: 100, paddingVertical: 13 },
  btnPlein: { backgroundColor: colors.coral, borderRadius: 100, paddingVertical: 13, marginTop: 14, alignItems: 'center' },
  btnTexte: { color: '#fff', fontWeight: '700', fontSize: 13 },
  inactif: { opacity: 0.5 },
  fond: { flex: 1, backgroundColor: 'rgba(7,39,66,0.85)', alignItems: 'center', justifyContent: 'center', padding: 26 },
  boite: { backgroundColor: colors.paper, borderRadius: 16, padding: 22, width: '100%' },
  boiteTitre: { fontSize: 18, fontWeight: '800', color: colors.ink },
  boiteTexte: { fontSize: 13, color: colors.muted, marginTop: 8, lineHeight: 19 },
  champ: { borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 11, fontSize: 13.5, color: colors.ink, letterSpacing: 1, marginTop: 16 },
  btnContour: { borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingVertical: 12, marginTop: 10, alignItems: 'center' },
  btnContourTexte: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  plusTard: { textAlign: 'center', color: colors.muted, fontSize: 12.5, marginTop: 14 },
});
