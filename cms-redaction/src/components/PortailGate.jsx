import { useAuth } from '../contexts/AuthContext';

// Sélection de l'espace de travail après connexion — Le Quotidien (contenu
// du journal papier) ou Info en direct (rédaction web). Bloque l'accès au
// reste du CMS tant qu'aucun choix n'a été fait, pour que les deux
// rédactions ne se retrouvent jamais mélangées par erreur. Rechangeable à
// tout moment via le sélecteur du menu latéral (cf. Layout.jsx).
export default function PortailGate({ children }) {
  const { portailActif, setPortailActif, staff } = useAuth();

  if (portailActif) return children;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="inline-flex items-center rounded-full overflow-hidden font-serif font-extrabold text-[15px] mb-8">
        <span className="bg-navy text-white px-4 py-2">Notre</span>
        <span className="bg-white border border-gray-200 text-coral font-black px-4 py-2">Voie</span>
      </div>
      <p className="text-sm text-gray-500 mb-1">Bonjour {staff?.prenom} 👋</p>
      <h1 className="text-xl font-bold text-center">Quel espace de travail rejoignez-vous ?</h1>
      <p className="text-sm text-gray-500 text-center mt-1 max-w-md">
        Deux rédactions distinctes partagent ce CMS. Choisissez votre portail — vous pourrez en changer à tout moment.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mt-8 w-full max-w-xl">
        <button
          onClick={() => setPortailActif('QUOTIDIEN')}
          className="text-left card p-6 hover:-translate-y-0.5 hover:shadow-md transition"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-widest text-coral font-bold">Le journal, chaque jour</span>
          <h2 className="font-serif text-[20px] mt-1.5">Le Quotidien</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Contenu déversé tel que présent dans les PDF du journal imprimé, rubriques traditionnelles.
          </p>
        </button>

        <button
          onClick={() => setPortailActif('INFO_DIRECT')}
          className="text-left card p-6 hover:-translate-y-0.5 hover:shadow-md transition"
        >
          <span className="font-mono text-[10.5px] uppercase tracking-widest text-navy font-bold">L&apos;actualité au fil de l&apos;eau</span>
          <h2 className="font-serif text-[20px] mt-1.5">Info en direct</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Rédaction web animée au quotidien, style éditorial et rubriques propres.
          </p>
        </button>
      </div>
    </div>
  );
}
