import { useAuth } from '../contexts/AuthContext';

// Bloque l'affichage d'une page à un rôle non autorisé, même en cas
// d'accès direct par URL (la navigation latérale masque déjà le lien,
// mais ce n'est qu'un raccourci — l'API est la vraie barrière, ceci
// évite juste un écran vide/confus côté interface).
export default function RequireRole({ roles, children }) {
  const { staff } = useAuth();
  if (!roles.includes(staff?.role)) {
    return (
      <div className="p-8">
        <div className="card p-6 max-w-md text-sm text-gray-600">
          <p className="font-bold text-ink mb-1">Accès non autorisé</p>
          <p>Cette section est réservée aux rôles : {roles.join(', ')}.</p>
        </div>
      </div>
    );
  }
  return children;
}
