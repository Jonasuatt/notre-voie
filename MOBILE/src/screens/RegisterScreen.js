import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', motDePasse: '' });
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const submit = async () => {
    if ((!form.email && !form.telephone) || !form.motDePasse) {
      return Alert.alert('Erreur', 'Email ou téléphone, et mot de passe (6 caractères min) sont requis.');
    }
    setSubmitting(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Inscription impossible', err.response?.data?.error || 'Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Accès illimité en vous abonnant, ou lecture gratuite avec paiement à l'article.</Text>

      <TextInput style={styles.input} placeholder="Prénom" value={form.prenom} onChangeText={set('prenom')} />
      <TextInput style={styles.input} placeholder="Nom" value={form.nom} onChangeText={set('nom')} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={set('email')} />
      <TextInput style={styles.input} placeholder="Téléphone" keyboardType="phone-pad" value={form.telephone} onChangeText={set('telephone')} />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry value={form.motDePasse} onChangeText={set('motDePasse')} />

      <TouchableOpacity style={styles.btn} onPress={submit} disabled={submitting}>
        <Text style={styles.btnText}>{submitting ? 'Création…' : 'Créer mon compte'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Connexion')} style={{ marginTop: 18 }}>
        <Text style={styles.link}>Déjà un compte ? <Text style={{ fontWeight: '700', color: colors.navy }}>Se connecter</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 8, marginBottom: 24, lineHeight: 19 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 12 },
  btn: { backgroundColor: colors.coral, borderRadius: 100, paddingVertical: 14, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 14 },
  link: { textAlign: 'center', fontSize: 13, color: colors.muted },
});
