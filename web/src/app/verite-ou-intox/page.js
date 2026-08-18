import Link from 'next/link';
import { getFactChecks } from '@/lib/api';

export const metadata = { title: 'Vérité ou Intox' };

const VERDICT_STYLE = {
  VRAI: { label: 'Vrai', color: '#4ADE80' },
  FAUX: { label: 'Faux', color: '#E6008C' },
  TROMPEUR: { label: 'Trompeur', color: '#E8B84B' },
  NON_VERIFIABLE: { label: 'Non vérifiable', color: '#6B7280' },
};

export default async function VeriteOuIntoxPage() {
  const factChecks = await getFactChecks();

  return (
    <section className="max-w-[820px] mx-auto px-4 sm:px-8 py-10">
      <span className="font-mono text-[11px] uppercase tracking-widest text-gold">Rubrique</span>
      <h1 className="font-serif text-[30px] mt-1">Vérité ou Intox</h1>
      <p className="text-muted text-[14px] mt-2">
        Vérification des rumeurs et vidéos virales identifiées sur les réseaux sociaux — Notre Voie, rempart de confiance face à la désinformation.
      </p>

      <div className="mt-8 space-y-4">
        {factChecks.map((fc) => {
          const v = VERDICT_STYLE[fc.verdict] || VERDICT_STYLE.NON_VERIFIABLE;
          const article = fc.article;
          return (
            <Link
              key={article.id}
              href={`/article/${article.slug}`}
              className="block border border-line rounded-xl p-5 bg-white hover:border-gold transition"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: v.color }}>
                Verdict : {v.label}
              </span>
              <h3 className="font-serif text-[18px] mt-1.5">{article.titre}</h3>
              {article.chapo && <p className="text-muted text-[13.5px] mt-1.5">{article.chapo}</p>}
            </Link>
          );
        })}
        {factChecks.length === 0 && <p className="text-muted text-sm text-center py-12">Aucune vérification publiée pour le moment.</p>}
      </div>
    </section>
  );
}
