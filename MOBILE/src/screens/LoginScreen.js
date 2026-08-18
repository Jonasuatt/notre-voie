import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!identifiant || !motDePasse) return Alert.alert('Erreur', 'Identifiant et mot de passe requis.');
    setSubmitting(true);
    try {
      await login(identifiant, motDePasse);
    } catch (err) {
      Alert.alert('Connexion impossible', err.response?.data?.error || 'Identifiants incorrects.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.logoRow}>
        <Text style={[styles.logo, { backgroundColor: colors.navy, color: '#fff' }]}>Notre</Text>
        <Text style={[styles.logo, { backgroundColor: '#fff', color: colors.coral, fontWeight: '900' }]}>Voie</Text>
      </View>

      <Text style={styles.title}>Bon retour</Text>
      <Text style={styles.subtitle}>Connectez-vous pour retrouver vos abonnements et votre lecture.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email ou téléphone"
        autoCapitalize="none"
        value={identifiant}
        onChangeText={setIdentifiant}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={submitting}>
        <Text style={styles.btnText}>{submitting ? 'Connexion…' : 'Se connecter'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Inscription')} style={{ marginTop: 18 }}>
        <Text style={styles.link}>Pas encore de compte ? <Text style={{ fontWeight: '700', color: colors.navy }}>Créer un compte</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, padding: 24, justifyContent: 'center' },
  logoRow: { flexDirection: 'row', alignSelf: 'center', borderRadius: 100, overflow: 'hidden', marginBottom: 32 },
  logo: { fontSize: 16, fontWeight: '800', paddingHorizontal: 14, paddingVertical: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 12 },
  btn: { backgroundColor: colors.coral, borderRadius: 100, paddingVertical: 14, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 14 },
  link: { textAlign: 'center', fontSize: 13, color: colors.muted },
});
