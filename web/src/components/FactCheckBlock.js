import Link from 'next/link';

const VERDICT_LABEL = { VRAI: 'Vrai', FAUX: 'Faux', TROMPEUR: 'Trompeur', NON_VERIFIABLE: 'Non vérifiable' };

// Mis en avant sur l'accueil, pas seulement en rubrique — construit la
// réputation de fiabilité du titre (cahier des charges §3.4).
export default function FactCheckBlock({ factChecks, basePath = '' }) {
  if (!factChecks?.length) return null;
  const fc = factChecks[0];
  const article = fc.article;

  return (
    <div className="mt-8 bg-gradient-to-r from-white to-[#FBF3E4] border border-[#F0DFB8] rounded-xl p-6 sm:p-7 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
      <div className="w-[52px] h-[52px] rounded-full bg-gold shrink-0 flex items-center justify-center text-2xl text-white">✓</div>
      <div className="flex-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-gold font-bold">Vérité ou Intox — Verdict : {VERDICT_LABEL[fc.verdict]}</span>
        <h4 className="font-serif text-[17px] mt-1">{article?.titre}</h4>
        {article?.chapo && <p className="text-muted text-[13px] mt-1">{article.chapo}</p>}
      </div>
      <Link href={`${basePath}/article/${article?.slug}`} className="shrink-0 bg-ink text-white text-[12px] font-bold px-4 py-2.5 rounded-full">
        Lire la vérification
      </Link>
    </div>
  );
}
