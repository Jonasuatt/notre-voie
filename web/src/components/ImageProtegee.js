'use client';

import Image from 'next/image';

// Protection renforcée contre le téléchargement : un calque transparent est
// posé PAR-DESSUS l'image (au lieu de gérer onContextMenu sur l'image
// elle-même), pour que le clic droit du navigateur ne cible jamais un
// élément <img> — l'option "Enregistrer l'image sous…" n'apparaît alors
// plus dans la plupart des navigateurs. Frein réel, mais pas une
// protection totale : aucun site ne peut empêcher une capture d'écran,
// c'est une limite du web, pas de ce composant.
export default function ImageProtegee({ wrapperClassName = '', onClick, ...props }) {
  return (
    <div className={`absolute inset-0 ${wrapperClassName}`} onClick={onClick}>
      <Image {...props} draggable={false} />
      <div
        className="absolute inset-0"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
}
