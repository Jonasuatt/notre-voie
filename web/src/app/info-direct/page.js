import Link from 'next/link';
import Image from 'next/image';
import { getArticles, getRubriques, getTicker, getFactChecks, getCampagnesActives, getEditions } from '@/lib/api';
import { construireOnglets, getArticlesRubriqueEtEnfants } from '@/lib/onglets';
import FlashBar from '@/components/FlashBar';
import DerniereMinute from '@/components/DerniereMinute';
import TickerVieChere from '@/components/TickerVieChere';
import TickerFlashInfo from '@/components/TickerFlashInfo';
import ClusterArticles from '@/components/ClusterArticles';
import ColonneActualites from '@/components/ColonneActualites';
import OngletsPilier from '@/components/OngletsPilier';
import Carrousel from '@/components/Carrousel';
import FactCheckBlock from '@/components/FactCheckBlock';
import FormatBadge from '@/components/FormatBadge';
import PubCard from '@/components/PubCard';
import UneVerrouillee from '@/components/UneVerrouillee';
import GrillePiliers from '@/components/GrillePiliers';
import { timeAgo, formatDateRange, LABEL_FORMAT } from '@/lib/format';

// Fine ligne de séparation entre les blocs — signature visuelle du New York
// Times (nytimes.com), demandée explicitement pour distinguer Info en
// direct du Quotidien.
function Separateur() {
  return <hr className="max-w-[1180px] mx-auto my-10" style={{ borderColor: '#232B45' }} />;
}

const BASE_PATH = '/info-direct';

// Quotidien : la Une et le fil changent chaque jour, jamais figés au build.
export const dynamic = 'force-dynamic';

// Rubriques de service — publiées mais volontairement absentes du fil
// d'actu principal (elles ne doivent jamais concurrencer l'actualité en
// Une). Reprises ici dans un bloc dédié en bas de page, pour que tout
// contenu publié reste accessible depuis l'accueil (cf. demande explicite).
const RUBRIQUES_SERVICE_ACCUEIL = ['videos', 'audio-podcasts', 'photos-legendees', 'necrologie'];

// Définition des onglets par pilier (cf. lib/megaMenu.js pour la même
// arborescence pilier → rubriques) — chaque onglet agrège la rubrique
// choisie et ses sous-rubriques réelles (getArticlesRubriqueEtEnfants).
const ONGLETS_ACTUALITES_POLITIQUE = [
  { label: 'Politique', slug: 'politique' },
  { label: 'Régions', slug: 'regions' },
  { label: 'Diaspora', slug: 'diaspora' },
];
const ONGLETS_ECONOMIE_SOCIETE = [
  { label: 'Économie', slug: 'economie' },
  { label: 'Vie chère', slug: 'vie-chere' },
  { label: 'Numérique', slug: 'numerique' },
];

export default async function QuotidienAccueilPage() {
  const [{ articles }, prix, factChecks, campagnes, editions, rubriques, ...serviceGroupes] = await Promise.all([
    getArticles({ pageSize: 24, portail: 'INFO_DIRECT' }),
    getTicker(),
    getFactChecks(),
    getCampagnesActives({ format: 'NATIVE_CARTE' }),
    getEditions({ pageSize: 1 }),
    getRubriques(),
    ...RUBRIQUES_SERVICE_ACCUEIL.map((slug) => getArticles({ rubrique: slug, portail: 'INFO_DIRECT', pageSize: 4 })),
  ]);
  const uneDuJour = editions?.[0];

  const [ongletsActualites, ongletsEconomie, verite, opinionsTribunes, histoireCI] = await Promise.all([
    construireOnglets(rubriques, ONGLETS_ACTUALITES_POLITIQUE, 'INFO_DIRECT'),
    construireOnglets(rubriques, ONGLETS_ECONOMIE_SOCIETE, 'INFO_DIRECT'),
    getArticlesRubriqueEtEnfants(rubriques, 'verite-ou-intox', 'INFO_DIRECT', 8),
    getArticles({ rubrique: 'opinions-tribunes', portail: 'INFO_DIRECT', pageSize: 8 }),
    getArticles({ rubrique: 'histoire-de-cote-d-ivoire', portail: 'INFO_DIRECT', pageSize: 8 }),
  ]);
  // Carrousel "Enquêtes & Décryptage" — uniquement les formats longs
  // (DECRYPTAGE), toutes rubriques du pilier confondues.
  const enquetes = [...verite, ...opinionsTribunes.articles, ...histoireCI.articles]
    .filter((a) => a.format === 'DECRYPTAGE')
    .sort((a, b) => new Date(b.publieLe) - new Date(a.publieLe))
    .slice(0, 8);

  // Une colonne par rubrique de service ayant du contenu, au même format
  // que les blocs "Dossiers" / "Actualités" (ColonneActualites).
  const colonnesService = RUBRIQUES_SERVICE_ACCUEIL.map((slug, i) => {
    const { articles: items } = serviceGroupes[i];
    if (!items?.length) return null;
    return [items[0].rubrique?.nom || slug, { couleur: items[0].rubrique?.couleur, articles: items }];
  }).filter(Boolean);

  const flashEtLive = articles.filter((a) => a.format === 'FLASH' || a.format === 'LIVE').slice(0, 8);
  const une = articles[0];
  const lecturesGratuites = articles.slice(1, 4);
  const resumeDuJour = articles.slice(0, 5);
  const directEnCours = articles.find((a) => a.format === 'LIVE');
  const pub = campagnes?.[0];

  // Dossiers façon NYT — les articles restants regroupés par rubrique
  // (thème), 2 dossiers de 3 titres plutôt qu'une grille indifférenciée.
  const parRubrique = new Map();
  for (const a of articles.slice(5)) {
    const nom = a.rubrique?.nom || 'Autres';
    if (!parRubrique.has(nom)) parRubrique.set(nom, { couleur: a.rubrique?.couleur, articles: [] });
    const groupe = parRubrique.get(nom);
    if (groupe.articles.length < 3) groupe.articles.push(a);
  }
  const dossiers = [...parRubrique.entries()].filter(([, g]) => g.articles.length >= 2).slice(0, 2);

  // Bloc "Actualités" final façon bas de page nytimes.com : ce qui reste
  // après lead + cluster + dossiers, regroupé en colonnes par rubrique
  // (jusqu'à 5, comme le bas de nytimes.com) plutôt qu'une grille uniforme
  // de cartes identiques.
  const dejaUtilises = new Set([une?.id, ...lecturesGratuites.map((a) => a.id), ...dossiers.flatMap(([, g]) => g.articles.map((a) => a.id))]);
  const restants = articles.filter((a) => !dejaUtilises.has(a.id));
  const parRubriqueFin = new Map();
  for (const a of restants) {
    const nom = a.rubrique?.nom || 'Autres';
    if (!parRubriqueFin.has(nom)) parRubriqueFin.set(nom, { couleur: a.rubrique?.couleur, articles: [] });
    const groupe = parRubriqueFin.get(nom);
    if (groupe.articles.length < 4) groupe.articles.push(a);
  }
  const colonnesActualites = [...parRubriqueFin.entries()].slice(0, 5);

  return (
    <>
      <TickerFlashInfo articles={articles.slice(0, 10)} basePath={BASE_PATH} />
      <TickerVieChere prix={prix} />
      <DerniereMinute articles={articles.slice(0, 6)} basePath={BASE_PATH} />

      {directEnCours && (
        <Link href={`${BASE_PATH}/article/${directEnCours.slug}`} className="block bg-ink text-white">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-coral text-white text-[10.5px] font-bold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> EN DIRECT
            </span>
            <span className="text-[13px] font-medium truncate hover:text-coral transition-colors">{directEnCours.titre}</span>
          </div>
        </Link>
      )}

      {/* Bloc principal façon NYT : article vedette à gauche, "Plus de
          lectures gratuites" (fil resserré, fines séparations) à droite. */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
          {une && (
            <Link href={`${BASE_PATH}/article/${une.slug}`} className="group block">
              <div className="relative h-[260px] sm:h-[340px] rounded-[10px] bg-gradient-to-br from-navy2 to-navy overflow-hidden">
                {une.imageUneUrl && (
                  <Image src={une.imageUneUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 820px" priority className="object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
                <FormatBadge format={une.format} />
              </div>
              <div className="pt-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest bg-[#22D3EE] text-[#0a0e1a] px-2.5 py-1 rounded-full">
                    {LABEL_FORMAT[une.format] || une.format}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wide" style={{ color: une.rubrique?.couleur }}>
                    {une.rubrique?.nom}
                  </span>
                </div>
                <h1 className="font-serif text-[28px] sm:text-[32px] leading-tight mt-3 group-hover:text-[#22D3EE] transition-colors">
                  {une.titre}
                </h1>
                {une.chapo && <p className="text-muted text-[14.5px] mt-2.5 leading-relaxed max-w-2xl line-clamp-2">{une.chapo}</p>}
                <div className="flex gap-3 items-center mt-3.5 font-mono text-[11px] text-muted">
                  <span>{timeAgo(une.publieLe)}</span>
                  {une.auteur && <span>· {une.auteur.prenom} {une.auteur.nom}</span>}
                </div>
              </div>
            </Link>
          )}

          <ClusterArticles titre="Plus de lectures gratuites" articles={lecturesGratuites} basePath={BASE_PATH} avecVignette />
        </div>
      </section>

      <Separateur />

      {/* Une + 5 choses à retenir — insérées après le bloc principal, comme demandé. */}
      {(uneDuJour?.couvertureUrl || resumeDuJour.length > 0) && (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-[minmax(0,380px)_1fr] gap-8">
            {uneDuJour?.couvertureUrl && (
              <div>
                <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden shadow-xl border border-line">
                  <UneVerrouillee
                    editionId={uneDuJour.id} verrouille={uneDuJour.verrouille} couvertureUrl={uneDuJour.couvertureUrl}
                    numero={uneDuJour.numero} sizes="(max-width: 1024px) 100vw, 380px" basePath={BASE_PATH}
                  />
                </div>
                <span className="font-mono text-[11px] text-muted mt-3 block">
                  N°{uneDuJour.numero} — {formatDateRange(uneDuJour.dateParution, uneDuJour.dateFin)}
                </span>
              </div>
            )}

            <div className="bg-navy rounded-[10px] p-5 text-white">
              <h3 className="font-serif text-[16px] mb-1">5 choses à retenir aujourd&apos;hui</h3>
              <ol className="pl-0 text-[12.5px] text-[#D8DCEA]">
                {resumeDuJour.map((a, i) => (
                  <li key={a.id} className="flex gap-2.5 py-2.5 border-t border-white/10 first:border-t-0">
                    <span className="font-mono text-[#22D3EE] font-bold shrink-0 flex items-center gap-1.5">
                      {a.format === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-coral dot-live" />}
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Link href={`${BASE_PATH}/article/${a.slug}`} className="hover:text-white leading-snug flex-1">{a.titre}</Link>
                    <span className="font-mono text-[10px] text-[#8993B0] shrink-0 tabular-nums">{timeAgo(a.publieLe)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      <Separateur />

      {/* Modules à onglets — basculent entre 3 sous-thèmes par pilier sans
          rechargement de page, pour exposer davantage d'articles dans le
          même espace. */}
      {ongletsActualites.length > 0 && (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-8">
          <OngletsPilier titre="Actualités & Politique" onglets={ongletsActualites} basePath={BASE_PATH} />
        </section>
      )}

      {ongletsActualites.length > 0 && ongletsEconomie.length > 0 && <Separateur />}

      {ongletsEconomie.length > 0 && (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-8">
          <OngletsPilier titre="Économie & Société" onglets={ongletsEconomie} basePath={BASE_PATH} />
        </section>
      )}

      <Separateur />

      {/* Dossiers — actualité regroupée par rubrique, façon "Guerre au
          Moyen-Orient" du New York Times : même disposition en colonnes
          (article en tête + titres courts) que le bloc Actualités final. */}
      {dossiers.length > 0 && (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-8">
          <ColonneActualites colonnes={dossiers} basePath={BASE_PATH} titre="Dossiers" />
          <FactCheckBlock factChecks={factChecks} basePath={BASE_PATH} />
        </section>
      )}

      <Separateur />

      {/* Carrousel horizontal — met en mouvement les formats longs
          (enquêtes/dossiers DECRYPTAGE) plutôt qu'une grille figée. */}
      {enquetes.length > 0 && (
        <>
          <section className="max-w-[1180px] mx-auto px-4 sm:px-8">
            <Carrousel titre="Enquêtes & Décryptage" articles={enquetes} basePath={BASE_PATH} />
          </section>
          <Separateur />
        </>
      )}

      <FlashBar articles={flashEtLive} basePath={BASE_PATH} />

      <section className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10">
        <GrillePiliers colonnes={colonnesActualites} basePath={BASE_PATH} />
      </section>

      {colonnesService.length > 0 && (
        <>
          <Separateur />
          <section className="max-w-[1180px] mx-auto px-4 sm:px-8 pb-10">
            <ColonneActualites colonnes={colonnesService} basePath={BASE_PATH} titre="Aussi sur Info en direct" />
          </section>
        </>
      )}

      {pub && (
        <section className="max-w-[1180px] mx-auto px-4 sm:px-8 pb-10">
          <div className="max-w-[380px]">
            <PubCard campagne={pub} />
          </div>
        </section>
      )}
    </>
  );
}
