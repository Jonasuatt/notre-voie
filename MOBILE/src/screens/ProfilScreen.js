import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { abonnementsAPI } from '../api/api';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/format';

export default function ProfilScreen({ navigation }) {
  const { reader, logout } = useAuth();
  const [abonnement, setAbonnement] = useState(null);

  useEffect(() => {
    if (reader) abonnementsAPI.moi().then((r) => setAbonnement(r.data.abonnement)).catch(() => {});
  }, [reader]);

  if (!reader) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Vous n'êtes pas connecté</Text>
        <Text style={styles.desc}>Créez un compte pour vous abonner et retrouver votre lecture sur tous vos appareils.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Connexion')}>
          <Text style={styles.btnText}>Se connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Inscription')}>
          <Text style={styles.btnSecondaryText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{reader.prenom?.[0] || reader.email?.[0] || '?'}</Text></View>
      <Text style={styles.name}>{reader.prenom} {reader.nom}</Text>
      <Text style={styles.email}>{reader.email || reader.telephone}</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Abonnement</Text>
        {abonnement ? (
          <Text style={styles.cardValue}>Actif jusqu'au {formatDate(abonnement.dateFin)}</Text>
        ) : (
          <>
            <Text style={styles.cardValue}>Aucun abonnement actif</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Abonnement')}>
              <Text style={styles.cardLink}>S'abonner →</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream, padding: 24, alignItems: 'center' },
  center: { flex: 1, backgroundColor: colors.cream, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink },
  desc: { fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 22, lineHeight: 19 },
  btn: { backgroundColor: colors.coral, borderRadius: 100, paddingVertical: 13, paddingHorizontal: 30 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  btnSecondary: { marginTop: 12 },
  btnSecondaryText: { color: colors.navy, fontWeight: '700', fontSize: 13 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '700', color: colors.ink, marginTop: 12 },
  email: { fontSize: 12.5, color: colors.muted, marginTop: 2 },
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 18, width: '100%', marginTop: 26 },
  cardLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
  cardValue: { fontSize: 15, color: colors.ink, marginTop: 6, fontWeight: '600' },
  cardLink: { fontSize: 12.5, color: colors.coral, fontWeight: '700', marginTop: 8 },
  logout: { marginTop: 24 },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
});
