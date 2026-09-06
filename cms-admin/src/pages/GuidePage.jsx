import { Link } from 'react-router-dom';
import { HomeIcon, MegaphoneIcon, BuildingOffice2Icon, UsersIcon } from '@heroicons/react/24/outline';

// Guide d'utilisation du CMS Administration (direction et régie publicitaire).
// Il décrit les écrans réellement présents dans l'outil.

const ECRANS = [
  {
    icone: HomeIcon,
    titre: 'Tableau de bord',
    lien: '/',
    texte: "L'activité du site et de la régie en un coup d'œil : audience, campagnes en cours, abonnements.",
  },
  {
    icone: BuildingOffice2Icon,
    titre: 'Annonceurs',
    lien: '/annonceurs',
    texte: "Le répertoire des clients de la régie : coordonnées, interlocuteur, historique. Un annonceur doit exister ici avant qu'on puisse lui rattacher une campagne.",
  },
  {
    icone: MegaphoneIcon,
    titre: 'Campagnes',
    lien: '/campagnes',
    texte: "Les emplacements publicitaires vendus : période de diffusion, format, rubriques ciblées. Une campagne s'arrête d'elle-même à sa date de fin.",
  },
  {
    icone: UsersIcon,
    titre: 'Comptes',
    lien: '/comptes',
    texte: "Les accès du personnel aux deux CMS. Le rôle détermine ce que chacun peut faire : un rédacteur soumet, un chef de service valide, le rédacteur en chef publie.",
  },
];

export default function GuidePage() {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold">Guide d&apos;utilisation</h1>
      <p className="text-gray-500 text-sm mt-1">CMS 1 — Direction et régie publicitaire.</p>

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
        <h2 className="font-bold text-[15px]">Le modèle de revenus</h2>
        <p className="text-[13.5px] text-gray-600 mt-2 leading-relaxed">
          Trois sources coexistent sur le site.
        </p>
        <ul className="mt-3 space-y-2.5 text-[13.5px] text-gray-600 list-disc pl-5 leading-relaxed">
          <li>
            <strong>La publicité</strong> — les campagnes vendues aux annonceurs, diffusées aux emplacements
            prévus et ciblées par rubrique.
          </li>
          <li>
            <strong>L&apos;abonnement</strong> — accès illimité aux articles payants et au journal en PDF.
            L&apos;abonné reçoit par mail un <strong>code de lecture</strong> qu&apos;il saisit sur le site :
            aucun compte à créer, ce qui lève le principal obstacle à la souscription. Le code cesse de
            fonctionner à son échéance.
          </li>
          <li>
            <strong>L&apos;achat à l&apos;article</strong> — pour le lecteur de passage, qui paie le seul texte
            qui l&apos;intéresse.
          </li>
        </ul>
        <p className="text-[13px] text-gray-500 mt-3 leading-relaxed">
          Le lecteur non abonné n&apos;est jamais arrêté net : il lit le début de l&apos;article, puis se voit
          proposer ces trois issues.
        </p>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="font-bold text-[15px]">Les codes de lecture</h2>
        <p className="text-[13.5px] text-gray-600 mt-2 leading-relaxed">
          Un code est créé pour une durée donnée puis communiqué à l&apos;abonné. La régie voit combien de fois
          il a servi et peut le prolonger ou le révoquer à tout moment — utile si un code circule au-delà du
          foyer auquel il était destiné.
        </p>
      </section>
    </div>
  );
}
