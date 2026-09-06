/**
 * Import du fonds d'archives « Unes Notre Voie » (245 numéros, 7730 → 7984).
 *
 * Chaque PDF est déposé sur Cloudinary en resource_type "image" (et non
 * "raw") : c'est ce qui permet d'en tirer la couverture et les pages via la
 * transformation pg_N, comme le fait déjà editions.controller.js.
 *
 * Reprenable : l'avancement est écrit ligne par ligne dans
 * scripts/unes-uploadees.json, relancer le script reprend où il s'est arrêté.
 *
 *   node api/scripts/importer-unes.js [--dossier <chemin>] [--limite N]
 *
 * Nécessite CLOUDINARY_* dans api/.env.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { cloudinary, isConfigured } = require('../src/config/cloudinary');

const SORTIE = path.join(__dirname, 'unes-uploadees.json');
const ENTREE = path.join(__dirname, 'unes.json');

function arg(nom, defaut) {
  const i = process.argv.indexOf(nom);
  return i > -1 ? process.argv[i + 1] : defaut;
}

async function main() {
  if (!isConfigured) throw new Error('CLOUDINARY_* absents de api/.env');
  const dossier = arg('--dossier', 'C:\Users\User\Documents\Claude\Notre Voie Document\Unes Notre Voie');
  const limite = Number(arg('--limite', Infinity));

  const unes = JSON.parse(fs.readFileSync(ENTREE, 'utf8'));
  const faites = fs.existsSync(SORTIE) ? JSON.parse(fs.readFileSync(SORTIE, 'utf8')) : [];
  const dejaFait = new Set(faites.map((u) => u.numero));

  let n = 0;
  for (const une of unes) {
    if (dejaFait.has(une.numero) || n >= limite) continue;
    const fichier = path.join(dossier, une.fichier);
    try {
      const res = await cloudinary.uploader.upload(fichier, {
        resource_type: 'image',
        folder: 'notre-voie/edition',
        public_id: `nv-${une.numero}`,
        overwrite: false,
      });
      faites.push({
        numero: une.numero,
        dateParution: une.dateParution,
        dateFin: une.dateFin,
        pdfUrl: res.secure_url,
        // Couverture = page 1 du PDF, rendue à la volée par Cloudinary.
        couvertureUrl: cloudinary.url(res.public_id, {
          resource_type: 'image', page: 1, format: 'jpg', secure: true,
          transformation: [{ width: 800, crop: 'limit', quality: 'auto' }],
        }),
      });
      fs.writeFileSync(SORTIE, JSON.stringify(faites, null, 1));
      n++;
      console.log(`✔ ${une.numero} (${une.dateParution}) — ${n} ce lot, ${faites.length}/${unes.length} au total`);
    } catch (err) {
      console.error(`✖ ${une.numero} : ${err.message}`);
    }
  }
  console.log(`Terminé : ${faites.length}/${unes.length} numéros hébergés.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
