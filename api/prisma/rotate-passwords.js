/**
 * Rotation ponctuelle des mots de passe staff (sortie de démo).
 * Remplace le mot de passe partagé de démo par un mot de passe individuel
 * et aléatoire par compte. À exécuter une seule fois, puis à supprimer
 * ou laisser en l'état (idempotent si relancé — régénère de nouveaux mots
 * de passe à chaque exécution, donc ne PAS relancer sans besoin).
 *
 * Les mots de passe en clair ne sont jamais écrits sur disque ni committés :
 * ils ne sont affichés qu'une fois dans la sortie console de cette commande.
 *
 * Usage : railway run node prisma/rotate-passwords.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

function genPassword(len = 14) {
  return crypto.randomBytes(len).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, len);
}

async function main() {
  const comptes = await prisma.staff.findMany({ select: { id: true, email: true, nom: true, prenom: true, role: true } });
  if (comptes.length === 0) {
    console.log('Aucun compte staff trouvé.');
    return;
  }

  const resultats = [];
  for (const c of comptes) {
    const motDePasse = genPassword(14);
    const motDePasseHash = await bcrypt.hash(motDePasse, 10);
    await prisma.staff.update({ where: { id: c.id }, data: { motDePasseHash } });
    resultats.push({ email: c.email, role: c.role, motDePasse });
  }

  console.log('\n=== NOUVEAUX MOTS DE PASSE (à transmettre une seule fois, puis à effacer de cet écran) ===\n');
  for (const r of resultats) {
    console.log(`${r.email.padEnd(38)} ${r.role.padEnd(20)} ${r.motDePasse}`);
  }
  console.log(`\n✔ ${resultats.length} comptes staff mis à jour. Anciens jetons de session (JWT) toujours valides tant que JWT_SECRET n'est pas aussi changé.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
