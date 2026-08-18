export const metadata = { title: "S'abonner" };

const FORMULES = [
  { type: 'MENSUEL', prix: '2 000 FCFA', periode: '/ mois' },
  { type: 'ANNUEL', prix: '18 000 FCFA', periode: '/ an', economie: 'soit 2 mois offerts' },
];

export default function AbonnementPage() {
  return (
    <section className="max-w-[820px] mx-auto px-4 sm:px-8 py-14 text-center">
      <span className="font-mono text-[11px] uppercase tracking-widest text-coral">Paywall souple</span>
      <h1 className="font-serif text-[32px] mt-2">Un accès illimité, ou à l&apos;article</h1>
      <p className="text-muted text-[15px] mt-3 max-w-xl mx-auto">
        Jamais de mur bloquant sans alternative : abonnez-vous pour un accès illimité au site et à l&apos;application,
        ou réglez uniquement les articles qui vous intéressent, par mobile money ou carte bancaire.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mt-10">
        {FORMULES.map((f) => (
          <div key={f.type} className="border border-line rounded-xl p-7 bg-white">
            <h3 className="font-serif text-[20px]">{f.type === 'MENSUEL' ? 'Mensuel' : 'Annuel'}</h3>
            <p className="mt-3">
              <span className="font-serif text-[30px]">{f.prix}</span>{' '}
              <span className="text-muted text-[13px]">{f.periode}</span>
            </p>
            {f.economie && <p className="text-[12px] text-navy font-bold mt-1">{f.economie}</p>}
            <button className="mt-6 bg-coral text-white font-bold text-[13.5px] px-6 py-3 rounded-full w-full">
              Choisir cette formule
            </button>
          </div>
        ))}
      </div>

      <p className="font-mono text-[10.5px] text-muted mt-8">Orange Money · MTN MoMo · Moov Money · Carte bancaire</p>
    </section>
  );
}
