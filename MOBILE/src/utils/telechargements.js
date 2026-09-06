import { Directory, File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lecture hors connexion : les numéros débloqués par un abonné sont copiés
// dans l'espace de l'app. Le réseau ivoirien étant irrégulier et facturé à la
// donnée, un numéro déjà téléchargé doit rester lisible sans connexion.
//
// Ce sont les pages en images qui sont conservées, et non le PDF : elles
// s'affichent dans le lecteur intégré, sans dépendre d'une application tierce
// que le téléphone n'a pas toujours. Le PDF reste accessible en ligne pour
// qui veut le fichier lui-même.
const DOSSIER = 'kiosque';
const INDEX = 'nv_numeros_hors_connexion';

function dossierNumero(numero) {
  const d = new Directory(Paths.document, DOSSIER, `nv-${numero}`);
  if (!d.exists) d.create({ intermediates: true });
  return d;
}

async function lireIndex() {
  const brut = await AsyncStorage.getItem(INDEX);
  return brut ? JSON.parse(brut) : [];
}

export async function listerTelechargements() {
  const index = await lireIndex();
  // Le système peut avoir fait le ménage : on ne présente que les numéros
  // dont les pages sont réellement encore là.
  return index.filter((e) => {
    try {
      return e.pages?.length > 0 && new File(e.pages[0].uri).exists;
    } catch {
      return false;
    }
  });
}

export async function estTelecharge(numero) {
  const liste = await listerTelechargements();
  return liste.find((e) => e.numero === numero) || null;
}

export async function telechargerNumero(edition, { onProgression } = {}) {
  const pages = (edition.pages || []).filter((p) => p.imageUrl);
  if (!pages.length) throw new Error("Ce numéro n'a pas de pages à enregistrer.");

  const dossier = dossierNumero(edition.numero);
  const enregistrees = [];
  for (const [i, p] of pages.entries()) {
    const fichier = await File.downloadFileAsync(
      p.imageUrl,
      new File(dossier, `page-${String(p.numeroPage).padStart(2, '0')}.jpg`),
    );
    enregistrees.push({ numeroPage: p.numeroPage, uri: fichier.uri });
    onProgression?.(i + 1, pages.length);
  }

  const entree = {
    numero: edition.numero,
    dateParution: edition.dateParution,
    dateFin: edition.dateFin || null,
    couvertureUrl: edition.couvertureUrl || null,
    pages: enregistrees,
    telechargeLe: new Date().toISOString(),
  };
  const index = await lireIndex();
  await AsyncStorage.setItem(
    INDEX,
    JSON.stringify([entree, ...index.filter((e) => e.numero !== edition.numero)]),
  );
  return entree;
}

export async function supprimerNumero(numero) {
  const index = await lireIndex();
  try {
    const d = new Directory(Paths.document, DOSSIER, `nv-${numero}`);
    if (d.exists) d.delete();
  } catch {
    // Dossier déjà absent : seul l'index compte pour l'affichage.
  }
  await AsyncStorage.setItem(INDEX, JSON.stringify(index.filter((e) => e.numero !== numero)));
}
