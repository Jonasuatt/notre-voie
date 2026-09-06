import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { codesLectureAPI } from '../api/api';

// Paywall souple : jamais un mur sec. Le lecteur a déjà lu le début de
// l'article au-dessus (l'API ne renvoie que cet extrait), et trois issues lui
// sont offertes — l'abonnement, l'achat de ce seul article, ou le code reçu
// par mail s'il est déjà abonné. Même parcours que sur le site.
export default function Paywall({ onPayerArticle, prixArticle, onCodeValide }) {
  const navigation = useNavigation();
  const [saisieOuverte, setSaisieOuverte] = useState(false);
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const validerCode = async () => {
    setEnvoi(true);
    setErreur('');
    try {
      const { data } = await codesLectureAPI.verifier(code.trim().toUpperCase());
      // Conservé sur l'appareil : l'intercepteur d'api.js le joint ensuite à
      // chaque requête, jusqu'à son échéance.
      await AsyncStorage.setItem('nv_code_lecture', data.code);
      onCodeValide?.();
    } catch (err) {
      setErreur(err.response?.data?.error || "Ce code n'est pas reconnu.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>LA SUITE EST RÉSERVÉE</Text>
      <Text style={styles.title}>Poursuivez votre lecture</Text>
      <Text style={styles.desc}>
        Abonnez-vous pour lire tous les articles et le journal en PDF, ou ne payez que celui-ci.
      </Text>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Abonnement')}>
        <Text style={styles.btnPrimaryText}>Passer à l&apos;abonnement</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnSecondary} onPress={onPayerArticle}>
        <Text style={styles.btnSecondaryText}>
          {prixArticle ? `Lire cet article (${prixArticle} FCFA)` : 'Lire cet article seul'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.moyens}>Orange Money · MTN MoMo · Moov Money · Carte bancaire</Text>

      {saisieOuverte ? (
        <View style={styles.codeBloc}>
          <Text style={styles.codeLabel}>CODE REÇU PAR MAIL</Text>
          <View style={styles.codeLigne}>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="NV-XXXXXX"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              style={styles.codeInput}
            />
            <TouchableOpacity
              style={[styles.codeBtn, (!code || envoi) && styles.codeBtnInactif]}
              onPress={validerCode}
              disabled={!code || envoi}
            >
              {envoi ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.codeBtnText}>Valider</Text>}
            </TouchableOpacity>
          </View>
          {!!erreur && <Text style={styles.erreur}>{erreur}</Text>}
        </View>
      ) : (
        <TouchableOpacity onPress={() => setSaisieOuverte(true)}>
          <Text style={styles.lienCode}>J&apos;ai déjà un code d&apos;abonné</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 20, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.paper, padding: 22, alignItems: 'center' },
  eyebrow: { fontSize: 10, fontWeight: '800', color: colors.coral, letterSpacing: 1 },
  title: { fontSize: 19, fontWeight: '700', color: colors.ink, marginTop: 6, textAlign: 'center' },
  desc: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  btnPrimary: { backgroundColor: colors.coral, borderRadius: 100, paddingVertical: 13, paddingHorizontal: 22, marginTop: 18, width: '100%' },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13.5, textAlign: 'center' },
  btnSecondary: { borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingVertical: 13, paddingHorizontal: 22, marginTop: 10, width: '100%' },
  btnSecondaryText: { color: colors.ink, fontWeight: '700', fontSize: 13.5, textAlign: 'center' },
  moyens: { fontSize: 10, color: colors.muted, marginTop: 14 },
  lienCode: { fontSize: 12, color: colors.muted, textDecorationLine: 'underline', marginTop: 14 },
  codeBloc: { width: '100%', marginTop: 16, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14 },
  codeLabel: { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 1, marginBottom: 8 },
  codeLigne: { flexDirection: 'row', gap: 8 },
  codeInput: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 100, paddingHorizontal: 16, paddingVertical: 11, fontSize: 13.5, color: colors.ink, letterSpacing: 1 },
  codeBtn: { backgroundColor: colors.coral, borderRadius: 100, paddingHorizontal: 20, justifyContent: 'center', minWidth: 88, alignItems: 'center' },
  codeBtnInactif: { opacity: 0.5 },
  codeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  erreur: { fontSize: 12.5, color: colors.coral, marginTop: 8 },
});
