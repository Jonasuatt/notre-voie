import { Directory, File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lecture hors connexion : les numéros débloqués par un abonné sont copiés
// dans l'espace de l'app. Le réseau ivoirien étant irrégulier, un numéro
// déjà téléchargé doit rester lisible sans connexion — d'où le dossier
// dédié et l'index conservé en local.
const DOSSIER = 'kiosque';
const INDEX = 'nv_numeros_hors_connexion';

function dossier() {
  const d = new Directory(Paths.document, DOSSIER);
  if (!d.exists) d.create({ intermediates: true });
  return d;
}

export async function listerTelechargements() {
  const brut = await AsyncStorage.getItem(INDEX);
  const index = brut ? JSON.parse(brut) : [];
  // Un fichier peut avoir été effacé par le système : on ne présente que
  // ceux réellement présents.
  return index.filter((e) => {
    try {
      return new File(e.uri).exists;
    } catch {
      return false;
    }
  });
}

export async function estTelecharge(numero) {
  const liste = await listerTelechargements();
  return liste.find((e) => e.numero === numero) || null;
}

export async function telechargerNumero(edition, pdfUrl) {
  const fichier = await File.downloadFileAsync(pdfUrl, new File(dossier(), `nv-${edition.numero}.pdf`));
  const brut = await AsyncStorage.getItem(INDEX);
  const index = brut ? JSON.parse(brut) : [];
  const entree = {
    numero: edition.numero,
    dateParution: edition.dateParution,
    dateFin: edition.dateFin || null,
    couvertureUrl: edition.couvertureUrl || null,
    uri: fichier.uri,
    telechargeLe: new Date().toISOString(),
  };
  await AsyncStorage.setItem(
    INDEX,
    JSON.stringify([entree, ...index.filter((e) => e.numero !== edition.numero)]),
  );
  return entree;
}

export async function supprimerNumero(numero) {
  const brut = await AsyncStorage.getItem(INDEX);
  const index = brut ? JSON.parse(brut) : [];
  const entree = index.find((e) => e.numero === numero);
  if (entree) {
    try {
      const f = new File(entree.uri);
      if (f.exists) f.delete();
    } catch {
      // Fichier déjà absent : seul l'index compte pour l'affichage.
    }
  }
  await AsyncStorage.setItem(INDEX, JSON.stringify(index.filter((e) => e.numero !== numero)));
}
