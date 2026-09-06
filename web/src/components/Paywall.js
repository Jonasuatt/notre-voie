import Link from 'next/link';
import CodeLecteur from './CodeLecteur';

// Paywall souple : jamais un mur sec. Le lecteur a d'abord lu le début de
// l'article (l'API n'envoie que cet extrait, cf. articles.controller.js),
// puis trois issues lui sont offertes — l'abonnement, l'achat de ce seul
// article, ou le code reçu par mail s'il est déjà abonné.
export default function Paywall({ article, basePath = '' }) {
  const prix = article?.prixArticle;

  return (
    <div className="mt-2 border border-line rounded-xl bg-white p-6 sm:p-8 text-center">
      <span className="font-mono text-[10px] uppercase tracking-widest text-coral font-bold">La suite est réservée</span>
      <h3 className="font-serif text-[22px] mt-2">Poursuivez votre lecture</h3>
      <p className="text-muted text-[14px] mt-2 max-w-md mx-auto">
        Abonnez-vous pour lire tous les articles et le journal en PDF, ou ne payez que celui-ci.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Link href={`${basePath}/abonnement`} className="bg-coral text-white font-bold text-[13.5px] px-6 py-3 rounded-full">
          Passer à l&apos;abonnement
        </Link>
        <Link
          href={`${basePath}/abonnement?article=${article?.slug || ''}`}
          className="border border-line font-bold text-[13.5px] px-6 py-3 rounded-full text-ink"
        >
          {prix ? `Lire cet article (${prix} FCFA)` : 'Lire cet article seul'}
        </Link>
      </div>
      <p className="font-mono text-[10px] text-muted mt-4">Orange Money · MTN MoMo · Moov Money · Carte bancaire</p>
      <CodeLecteur />
    </div>
  );
}
