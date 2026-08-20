import Link from 'next/link';

export const metadata = { title: 'Notre Voie' };

// Portail d'entrée — deux rédactions, deux portes. « Le Quotidien » (la
// rédaction qui confectionne le journal papier : contenu déversé tel que
// présent dans les PDF, rubriques traditionnelles) est pleinement
// opérationnel. « Info en direct » (la rédaction qui animera le site au
// quotidien, style éditorial distinct) est pour l'instant une copie
// conforme du Quotidien, destinée à diverger dans une prochaine étape.
export default function PortailPage() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="inline-flex items-center rounded-full overflow-hidden shadow-lg font-serif font-extrabold mb-10">
        <span className="bg-navy text-white h-11 text-[18px] px-4 flex items-center">Notre</span>
        <span className="bg-white text-coral font-black h-11 text-[18px] px-4 flex items-center">Voie</span>
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 mb-2">Choisissez votre édition</p>
      <h1 className="font-serif text-white text-[28px] sm:text-[34px] max-w-lg leading-tight">
        Aussi rapide que les réseaux sociaux, aussi fiable qu&apos;un journal
      </h1>

      <div className="grid sm:grid-cols-2 gap-6 mt-12 w-full max-w-3xl">
        <Link
          href="/quotidien"
          className="group bg-white rounded-2xl p-8 text-left hover:-translate-y-1 transition-transform shadow-xl"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-widest text-coral font-bold">Le journal, chaque jour</span>
          <h2 className="font-serif text-[26px] text-ink mt-2 group-hover:text-coral transition-colors">Le Quotidien</h2>
          <p className="text-muted text-[14px] mt-3 leading-relaxed">
            L&apos;édition fidèle au journal papier : rubriques traditionnelles, Une du jour, kiosque numérique et archives.
          </p>
          <span className="inline-block mt-5 text-[13px] font-bold text-navy group-hover:text-coral transition-colors">Entrer →</span>
        </Link>

        <Link
          href="/info-direct"
          className="group bg-white rounded-2xl p-8 text-left hover:-translate-y-1 transition-transform shadow-xl"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-widest text-gold font-bold">L&apos;actualité au fil de l&apos;eau</span>
          <h2 className="font-serif text-[26px] text-ink mt-2 group-hover:text-coral transition-colors">Info en direct</h2>
          <p className="text-muted text-[14px] mt-3 leading-relaxed">
            L&apos;édition animée au quotidien par la rédaction web, pour suivre l&apos;actualité en temps réel.
          </p>
          <span className="inline-block mt-5 text-[13px] font-bold text-navy group-hover:text-coral transition-colors">Entrer →</span>
        </Link>
      </div>

      <p className="text-white/30 text-[11px] font-mono mt-14">© {new Date().getFullYear()} Notre Voie — La Refondation</p>
    </div>
  );
}
