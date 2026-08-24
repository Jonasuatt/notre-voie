import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getRubriques, getArticles, getEditions } from '@/lib/api';
import { construireMegaMenu } from '@/lib/megaMenu';

export const metadata = { title: { default: 'Notre Voie — Info en direct', template: '%s · Info en direct' } };

// « Info en direct » — copie de départ du Quotidien (mêmes rubriques,
// mêmes contenus), destinée à devenir la rédaction distincte qui anime le
// site au quotidien avec un style éditorial propre et de nouvelles
// rubriques. Pour l'instant, doublon volontaire à faire diverger ensuite.
// Rubriques de service référencées par un pilier du mega-menu : le fil
// général de l'API les exclut par construction (elles ne doivent jamais
// concurrencer l'actualité en Une), donc leurs articles doivent être
// récupérés explicitement pour alimenter la colonne "En ce moment" de ces
// piliers — cf. lib/megaMenu.js et la même correction déjà appliquée à la
// section "Aussi sur Info en direct" de l'accueil.
const RUBRIQUES_SERVICE_MEGA_MENU = ['videos', 'audio-podcasts', 'photos-legendees', 'necrologie'];

export default async function InfoDirectLayout({ children }) {
  // Une seule requête rubriques + requêtes articles, partagées par tout le
  // mega-menu (cf. lib/megaMenu.js) — pas d'appel par pilier au survol.
  const [rubriques, { articles: articlesEditoriaux }, editions, ...articlesService] = await Promise.all([
    getRubriques(),
    getArticles({ portail: 'INFO_DIRECT', pageSize: 50 }),
    getEditions({ pageSize: 1 }),
    ...RUBRIQUES_SERVICE_MEGA_MENU.map((slug) => getArticles({ rubrique: slug, portail: 'INFO_DIRECT', pageSize: 4 })),
  ]);
  const articles = [...articlesEditoriaux, ...articlesService.flatMap((r) => r.articles)];
  // articlesService suit l'ordre de RUBRIQUES_SERVICE_MEGA_MENU — index 1 = audio-podcasts.
  const dernierAudio = articlesService[1]?.articles?.[0] || null;
  const megaMenu = construireMegaMenu(rubriques, articles, { edition: editions?.[0], dernierAudio });

  return (
    <div className="theme-direct bg-[#0a0e1a] text-[#E7EBF7] min-h-screen">
      <Header basePath="/info-direct" megaMenu={megaMenu} />
      <main>{children}</main>
      <Footer basePath="/info-direct" />
    </div>
  );
}
