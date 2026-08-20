import Link from 'next/link';

// Paywall souple : jamais un mur bloquant sans alternative — l'article
// reste dans le flux (titre, chapo, badges visibles), seul le corps est
// masqué, avec un double choix abonnement / paiement à l'unité
// (cahier des charges §3.4 + modèle économique §4).
export default function Paywall({ article, basePath = '' }) {
  return (
    <div className="mt-8 border border-line rounded-xl bg-white p-6 sm:p-8 text-center">
      <span className="font-mono text-[10px] uppercase tracking-widest text-coral font-bold">Article réservé</span>
      <h3 className="font-serif text-[22px] mt-2">Poursuivez votre lecture</h3>
      <p className="text-muted text-[14px] mt-2 max-w-md mx-auto">
        Cet article fait partie du contenu Notre Voie premium. Abonnez-vous pour un accès illimité, ou lisez celui-ci à l&apos;unité.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <Link href={`${basePath}/abonnement`} className="bg-coral text-white font-bold text-[13.5px] px-6 py-3 rounded-full">
          S&apos;abonner (à partir de 2 000 FCFA/mois)
        </Link>
        <button className="border border-line font-bold text-[13.5px] px-6 py-3 rounded-full text-ink">
          Payer cet article seul (200 FCFA)
        </button>
      </div>
      <p className="font-mono text-[10px] text-muted mt-4">Orange Money · MTN MoMo · Moov Money · Carte bancaire</p>
    </div>
  );
}
