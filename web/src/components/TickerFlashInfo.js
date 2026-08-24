import Link from 'next/link';

// Bandeau "Flash Info" défilant en continu sous la navigation — expose
// une dizaine de titres dès l'arrivée sur le site. Contenu dupliqué une
// fois dans le DOM pour un défilement CSS sans coupure (animation pure
// CSS, cf. globals.css @keyframes ticker-defiler) ; pause au survol.
export default function TickerFlashInfo({ articles, basePath = '' }) {
  if (!articles?.length) return null;
  const boucle = [...articles, ...articles];

  return (
    <div className="border-b border-[#232B45] bg-[#0d1220] overflow-hidden">
      <div className="max-w-[1180px] mx-auto flex items-stretch">
        <span className="flex-none flex items-center gap-1.5 font-mono text-[10.5px] font-bold uppercase tracking-widest text-white bg-coral px-4 py-2 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white dot-live" /> Flash Info
        </span>
        <div className="ticker-piste flex-1 overflow-hidden">
          <div className="ticker-defiler flex items-center gap-10 py-2 pl-6 w-max" style={{ '--ticker-duree': `${Math.max(articles.length * 4, 20)}s` }}>
            {boucle.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                href={`${basePath}/article/${a.slug}`}
                className="flex items-center gap-2.5 text-[12.5px] whitespace-nowrap hover:text-[#22D3EE] transition-colors"
                style={{ color: '#D8DCEA' }}
              >
                <span className="w-1 h-1 rounded-full bg-[#22D3EE] shrink-0" />
                {a.titre}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
