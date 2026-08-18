import Link from 'next/link';

// Bandeau "façon stories" — le format qui capte l'attention avant même le
// premier scroll (cf. cahier des charges §3.4). Chaque bulle renvoie à un
// Flash ; les Live actifs se distinguent par un anneau plein + badge DIRECT.
export default function FlashBar({ articles }) {
  if (!articles?.length) return null;

  return (
    <div className="bg-navy py-5">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 flex gap-[22px] overflow-x-auto">
        {articles.map((a) => (
          <Link key={a.id} href={`/article/${a.slug}`} className="flex-none w-[78px] text-center">
            <div
              className="w-[66px] h-[66px] rounded-full p-[3px] mx-auto mb-2"
              style={{
                background: a.format === 'LIVE'
                  ? '#E6008C'
                  : 'conic-gradient(from 210deg, #E6008C, #E8B84B, #E6008C)',
              }}
            >
              <div className="w-full h-full rounded-full bg-navy2 border-2 border-navy flex items-center justify-center">
                {a.format === 'LIVE' ? (
                  <span className="font-mono text-[8px] font-bold text-white bg-coral px-1.5 py-0.5 rounded">DIRECT</span>
                ) : (
                  <span className="font-mono text-white font-bold">⚡</span>
                )}
              </div>
            </div>
            <span className="font-mono text-[9.5px] text-[#CBD3EC] leading-tight line-clamp-2">{a.titre}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
