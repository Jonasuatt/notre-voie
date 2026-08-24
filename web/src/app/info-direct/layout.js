import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getRubriques, getArticles } from '@/lib/api';
import { construireMegaMenu } from '@/lib/megaMenu';

export const metadata = { title: { default: 'Notre Voie — Info en direct', template: '%s · Info en direct' } };

// « Info en direct » — copie de départ du Quotidien (mêmes rubriques,
// mêmes contenus), destinée à devenir la rédaction distincte qui anime le
// site au quotidien avec un style éditorial propre et de nouvelles
// rubriques. Pour l'instant, doublon volontaire à faire diverger ensuite.
export default async function InfoDirectLayout({ children }) {
  // Une seule requête rubriques + une seule requête articles, partagées par
  // tout le mega-menu (cf. lib/megaMenu.js) — pas d'appel par pilier.
  const [rubriques, { articles }] = await Promise.all([
    getRubriques(),
    getArticles({ portail: 'INFO_DIRECT', pageSize: 50 }),
  ]);
  const megaMenu = construireMegaMenu(rubriques, articles);

  return (
    <div className="theme-direct bg-[#0a0e1a] text-[#E7EBF7] min-h-screen">
      <Header basePath="/info-direct" megaMenu={megaMenu} />
      <main>{children}</main>
      <Footer basePath="/info-direct" />
    </div>
  );
}
