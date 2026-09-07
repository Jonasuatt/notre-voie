// Mention d'un contenu payé par un tiers.
//
// Elle est placée avant le titre, jamais en bas de page : le lecteur doit
// savoir qu'il lit un contenu commercial avant de le lire, pas après. C'est
// la règle déontologique qui accompagne la vente de publi-reportages, et la
// condition pour que le reste du journal garde sa crédibilité.
export default function MentionSponsor({ article, compact = false }) {
  if (!article?.sponsorNom) return null;
  const mention = article.sponsorMention || 'Contenu sponsorisé';

  if (compact) {
    return (
      <span className="font-mono text-[9.5px] uppercase tracking-widest text-gold border border-gold/50 rounded-sm px-1.5 py-[1px]">
        {mention}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-l-[3px] border-gold bg-gold/10 pl-3 pr-4 py-2 rounded-r-md">
      <span className="font-mono text-[10.5px] font-bold uppercase tracking-widest text-gold">
        {mention}
      </span>
      <span className="text-[12.5px] text-muted">
        Payé par {article.sponsorNom}. Ce contenu n&apos;engage pas la rédaction.
      </span>
    </div>
  );
}
