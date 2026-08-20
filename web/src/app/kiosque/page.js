import Link from 'next/link';
import Image from 'next/image';
import { getEditions } from '@/lib/api';
import { formatDate } from '@/lib/format';

// Contenu qui change chaque jour (nouvelle édition quotidienne) : jamais
// figé au build, toujours interrogé à la demande.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Kiosque numérique' };

export default async function KiosquePage() {
  const editions = await getEditions({ pageSize: 30 });

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10">
      <span className="font-mono text-[11px] uppercase tracking-widest text-coral">Rubrique de service</span>
      <h1 className="font-serif text-[30px] mt-1">Kiosque numérique</h1>
      <p className="text-muted text-[14px] mt-2 max-w-2xl">
        La Une de chaque parution, jour après jour — le journal papier au format PDF, et les articles du jour en un clic.
      </p>

      {editions.length === 0 ? (
        <p className="text-muted text-sm py-16 text-center border-t border-line mt-8">Aucune édition disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6 mt-8">
          {editions.map((e) => {
            const dateISO = e.dateParution.slice(0, 10);
            return (
              <div key={e.id} className="text-center group">
                <a href={e.pdfUrl} target="_blank" rel="noreferrer" className="block">
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-gradient-to-b from-navy2 to-navy shadow-lg group-hover:opacity-90 transition">
                    {e.couvertureUrl && (
                      <Image src={e.couvertureUrl} alt={`Une n°${e.numero}`} fill sizes="220px" className="object-cover" />
                    )}
                    <span className="absolute bottom-2 right-2 bg-white/90 text-navy font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">PDF</span>
                  </div>
                </a>
                <span className="font-mono text-[10.5px] text-ink font-bold block mt-2.5">N°{e.numero}</span>
                <span className="font-mono text-[10px] text-muted block">{formatDate(e.dateParution)}</span>
                <Link href={`/recherche?date=${dateISO}`} className="text-[11px] text-navy font-semibold hover:text-coral transition-colors block mt-1">
                  Voir les articles du jour →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
