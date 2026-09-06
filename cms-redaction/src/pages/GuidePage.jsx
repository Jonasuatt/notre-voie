import { Link } from 'react-router-dom';
import {
  HomeIcon, NewspaperIcon, BanknotesIcon, BookOpenIcon, PhotoIcon,
} from '@heroicons/react/24/outline';

// Guide d'utilisation du CMS Rédaction. Il décrit les écrans réellement
// présents dans l'outil et le circuit de validation en vigueur — il ne
// promet aucune fonction qui n'existe pas.

const CIRCUIT = [
  { statut: 'Brouillon', qui: 'Le rédacteur', quoi: "L'article est en cours d'écriture. Lui seul le voit dans sa liste." },
  { statut: 'En relecture', qui: 'Le rédacteur', quoi: "Il est soumis au chef de service ou au rédacteur en chef, qui le retrouve sur son tableau de bord." },
  { statut: 'Validé', qui: 'Le chef de service', quoi: "Le texte est accepté mais pas encore en ligne. Une date de publication peut être programmée." },
  { statut: 'Publié', qui: 'Le rédacteur en chef', quoi: "L'article est visible sur le site, à la date et à l'heure de publication." },
  { statut: 'Dépublié', qui: 'Le rédacteur en chef', quoi: "Il est retiré du site. Rien n'est effacé : il reste consultable ici et peut être republié." },
];

const ECRANS = [
  {
    icone: HomeIcon,
    titre: 'Tableau de bord',
    lien: '/',
    texte: "Le compte des articles par statut et les derniers textes touchés. Le bandeau orange signale les articles qui attendent une validation.",
  },
  {
    icone: NewspaperIcon,
    titre: 'Articles',
    lien: '/articles',
    texte: "La liste complète, filtrable par statut, rubrique et format. C'est d'ici que l'on ouvre un texte pour le corriger, le valider ou le publier.",
  },
  {
    icone: PhotoIcon,
    titre: 'Photothèque',
    lien: '/mediatheque',
    texte: "Les photos, vidéos et sons déposés par la rédaction. Une image peut être versée sans être rattachée à un article : elle reste disponible pour un autre sujet. Chaque visuel doit porter sa légende et son crédit.",
  },
  {
    icone: BanknotesIcon,
    titre: 'Vie chère',
    lien: '/prix-vie-chere',
    texte: "Les prix affichés dans le bandeau défilant du site. Un relevé sert de référence tant qu'un plus récent n'est pas saisi : la flèche de variation se calcule toute seule.",
  },
  {
    icone: BookOpenIcon,
    titre: 'Kiosque / Éditions',
    lien: '/editions',
    texte: "Les numéros du journal en PDF. À l'import, chaque page est archivée en image et sa couverture sert de Une dans le kiosque. Le code d'accès conditionne le téléchargement du PDF complet par les abonnés.",
  },
];

export default function GuidePage() {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold">Guide d&apos;utilisation</h1>
      <p className="text-gray-500 text-sm mt-1">
        CMS 2 — Rédaction. Comment produire, faire valider et publier un article.
      </p>

      <section className="mt-8">
        <h2 className="font-bold text-[15px]">Les deux espaces</h2>
        <p className="text-[13.5px] text-gray-600 mt-2 leading-relaxed">
          Le sélecteur en haut de la barre latérale commute entre <strong>Le Quotidien</strong> (le contenu du
          journal papier) et <strong>Info en direct</strong> (l&apos;édition web, animée dans la journée). Tout ce
          que vous voyez — listes, compteurs, éditeur — ne concerne que l&apos;espace actif. Vérifiez-le avant
          de publier : un article déposé dans le mauvais espace n&apos;apparaîtra pas où vous l&apos;attendez.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-bold text-[15px]">Le circuit de validation</h2>
        <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Statut</th>
                <th className="px-4 py-2.5 font-medium">Qui agit</th>
                <th className="px-4 py-2.5 font-medium">Ce que cela signifie</th>
              </tr>
            </thead>
            <tbody>
              {CIRCUIT.map((e) => (
                <tr key={e.statut} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{e.statut}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{e.qui}</td>
                  <td className="px-4 py-3 text-gray-600">{e.quoi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-bold text-[15px]">Les écrans</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          {ECRANS.map((e) => (
            <Link key={e.titre} to={e.lien} className="card p-5 hover:border-navy transition-colors block">
              <e.icone className="w-6 h-6 text-navy" />
              <h3 className="font-bold text-[14px] mt-2">{e.titre}</h3>
              <p className="text-[13px] text-gray-600 mt-1.5 leading-relaxed">{e.texte}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-bold text-[15px]">Écrire un article</h2>
        <ol className="mt-3 space-y-3 text-[13.5px] text-gray-600 list-decimal pl-5 leading-relaxed">
          <li>
            <strong>Le titre et le chapô.</strong> Le chapô est l&apos;accroche affichée sous le titre, dans les
            listes et sur les réseaux. C&apos;est aussi ce que lit un visiteur non abonné avant le blocage :
            il doit se suffire à lui-même.
          </li>
          <li>
            <strong>La rubrique.</strong> Une rubrique principale, qui détermine où l&apos;article se range. Les
            rubriques secondaires servent aux sujets à cheval — un fait régional qui relève aussi du sport.
          </li>
          <li>
            <strong>Le format.</strong> Édition pour un article de journal, Décryptage pour une enquête ou un
            dossier, Vidéo, Audio, Live pour un direct suivi minute par minute.
          </li>
          <li>
            <strong>L&apos;accès.</strong> Libre, l&apos;article se lit en entier. Payant, le visiteur en lit le
            début puis se voit proposer l&apos;abonnement, l&apos;achat à l&apos;unité ou la saisie de son code
            d&apos;abonné.
          </li>
          <li>
            <strong>Le visuel.</strong> Choisissez-le dans la photothèque. Sans image, l&apos;article reste
            publiable mais s&apos;affiche en bloc de texte dans les listes.
          </li>
          <li>
            <strong>Soumettre.</strong> Passez le statut à « En relecture » : l&apos;article apparaît alors sur
            le tableau de bord du chef de service.
          </li>
        </ol>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="font-bold text-[15px]">En cas de doute</h2>
        <p className="text-[13.5px] text-gray-600 mt-2 leading-relaxed">
          Le point d&apos;interrogation présent à côté des titres d&apos;écran ouvre une bulle qui rappelle en
          une phrase à quoi sert la page. Rien de ce que vous faites ici n&apos;est définitif : un article
          dépublié reste en base et peut être remis en ligne.
        </p>
      </section>
    </div>
  );
}
