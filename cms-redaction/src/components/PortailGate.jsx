import { useAuth } from '../contexts/AuthContext';
import { PORTAILS } from '../utils/portails';

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
        {PORTAILS.map((p) => (
          <button
            key={p.valeur}
            onClick={() => setPortailActif(p.valeur)}
            className="text-left rounded-2xl p-6 border hover:-translate-y-0.5 hover:shadow-lg transition"
            style={{ background: p.fond, color: p.texte, borderColor: p.valeur === 'QUOTIDIEN' ? '#E5E7EB' : 'transparent' }}
          >
            <span className="font-mono text-[10.5px] uppercase tracking-widest font-bold" style={{ color: p.accent }}>
              {p.accroche}
            </span>
            <h2 className="font-serif text-[20px] mt-1.5">{p.label}</h2>
            <p className="text-xs mt-2 leading-relaxed opacity-70">{p.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
