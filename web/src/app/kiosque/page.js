import { getEditions } from '@/lib/api';
import { formatDate } from '@/lib/format';

export const metadata = { title: 'Kiosque numérique' };

export default async function KiosquePage() {
  const editions = await getEditions({ pageSize: 24 });

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-8 py-10">
      <span className="font-mono text-[11px] uppercase tracking-widest text-coral">Rubrique de service</span>
      <h1 className="font-serif text-[30px] mt-1">Kiosque numérique</h1>
      <p className="text-muted text-[14px] mt-2 max-w-2xl">
        Éditions précédentes du journal, consultables en PDF — le fonds documentaire de Notre Voie, jour après jour.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
        {editions.map((e) => (
          <a key={e.id} href={e.pdfUrl} target="_blank" rel="noreferrer" className="text-center group">
            <div className="relative h-[150px] rounded-md bg-gradient-to-b from-navy2 to-navy shadow-lg group-hover:opacity-90 transition">
              <span className="absolute bottom-2 right-2 bg-white/90 text-navy font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">PDF</span>
            </div>
            <span className="font-mono text-[10px] text-muted block mt-2">
              N°{e.numero} — {formatDate(e.dateParution)}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
