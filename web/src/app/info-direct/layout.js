import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getRubriques, getEditions } from '@/lib/api';
import { getArticlesRubriqueEtEnfants } from '@/lib/onglets';
import { construireMegaMenu, PILIERS_MEGA_MENU } from '@/lib/megaMenu';

export const metadata = { title: { default: 'Notre Voie — Info en direct', template: '%s · Info en direct' } };

// « Info en direct » — copie de départ du Quotidien (mêmes rubriques,
// mêmes contenus), destinée à devenir la rédaction distincte qui anime le
// site au quotidien avec un style éditorial propre et de nouvelles
// rubriques. Pour l'instant, doublon volontaire à faire diverger ensuite.
export default async function InfoDirectLayout({ children }) {
  const [rubriques, editions] = await Promise.all([getRubriques(), getEditions({ pageSize: 1 })]);

  // "En ce moment" de chaque pilier — récupéré directement par rubrique
  // (+ sous-rubriques, cf. getArticlesRubriqueEtEnfants), jamais filtré
  // depuis un fil général : avec le volume d'articles du site, un pilier
  // seedé plus tôt peut sortir de la fenêtre du fil général alors qu'il a
  // bien du contenu réel (cf. bug constaté — le pilier tombait à tort sur
  // le bloc de secours "Abonnement").
  const articlesParPilierEntries = await Promise.all(
    PILIERS_MEGA_MENU.map(async (pilier) => {
      const parRubrique = await Promise.all(
        pilier.rubriques.map((slug) => getArticlesRubriqueEtEnfants(rubriques, slug, 'INFO_DIRECT', 4))
      );
      const fusion = parRubrique
        .flat()
        .sort((a, b) => new Date(b.publieLe) - new Date(a.publieLe))
        .slice(0, 4);
      return [pilier.cle, fusion];
    })
  );
  const articlesParPilier = Object.fromEntries(articlesParPilierEntries);
  const audioRecents = await getArticlesRubriqueEtEnfants(rubriques, 'audio-podcasts', 'INFO_DIRECT', 4);
  const dernierAudio = audioRecents[0] || null;

  const megaMenu = construireMegaMenu(rubriques, articlesParPilier, { edition: editions?.[0], dernierAudio });

  return (
    <div className="theme-direct bg-[#404A5E] text-[#E7EBF7] min-h-screen">
      <Header basePath="/info-direct" megaMenu={megaMenu} />
      <main>{children}</main>
      <Footer basePath="/info-direct" />
    </div>
  );
}
