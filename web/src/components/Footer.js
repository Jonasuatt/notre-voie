import LogoPill from './Logo';

// `basePath` — même mécanisme que Header, cf. le commentaire là-bas.
export default function Footer({ basePath = '' }) {
  const estInfoDirect = basePath === '/info-direct';
  return (
    <footer className="bg-ink text-white mt-16">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <LogoPill href={basePath || '/'} />
          <p className="mt-4 text-sm text-white/60 font-serif italic">Notre métier, informer</p>
          <p className="mt-3 text-xs text-white/40">
            Une publication du Groupe La Refondation S.A.
          </p>
        </div>
        <div>
          <h4 className="font-mono text-[11px] tracking-widest uppercase text-gold mb-3">Rubriques</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href={`${basePath}/rubrique/politique`} className="hover:text-white">Politique</a></li>
            <li><a href={`${basePath}/rubrique/economie`} className="hover:text-white">Économie</a></li>
            <li><a href={`${basePath}/rubrique/vie-chere`} className="hover:text-white">Vie chère</a></li>
            <li><a href={`${basePath}/rubrique/diaspora`} className="hover:text-white">Diaspora</a></li>
            {estInfoDirect && <li><a href={`${basePath}/verite-ou-intox`} className="hover:text-white">Vérité ou Intox</a></li>}
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[11px] tracking-widest uppercase text-gold mb-3">Notre Voie</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href={`${basePath}/kiosque`} className="hover:text-white">Kiosque numérique</a></li>
            <li><a href={`${basePath}/abonnement`} className="hover:text-white">S&apos;abonner</a></li>
            <li>Rivéra Palmeraie, Abidjan</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Notre Voie — La Refondation. Tous droits réservés.
      </div>
    </footer>
  );
}
