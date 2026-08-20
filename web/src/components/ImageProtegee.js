'use client';

import Image from 'next/image';

// Les gestionnaires d'événements (onContextMenu) ne peuvent pas être passés
// à un composant serveur — ce petit wrapper client encapsule next/image
// pour appliquer le clic droit désactivé et le glisser-déposer bloqué sur
// les pages du journal et la Une, sans transformer toute la page en client.
export default function ImageProtegee(props) {
  return <Image {...props} onContextMenu={(e) => e.preventDefault()} draggable={false} />;
}
