'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:4000';

// PDF réservé aux abonnés : le code (communiqué par la rédaction/régie,
// cf. CMS Rédaction) débloque l'URL réelle, jamais exposée tant qu'il n'a
// pas été validé côté serveur — cf. api/src/controllers/editions.controller.js.
export default function DeverrouillerPdf({ editionId, verrouille }) {
  const [ouvert, setOuvert] = useState(false);
  const [code, setCode] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  if (!verrouille) {
    return <p className="text-[11px] text-muted mt-2">PDF non disponible pour ce numéro.</p>;
  }

  const valider = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    try {
      const res = await fetch(`${API_URL}/api/editions/${editionId}/deverrouiller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error || 'Code invalide.');
        return;
      }
      window.open(data.pdfUrl, '_blank', 'noopener,noreferrer');
      setOuvert(false);
      setCode('');
    } catch {
      setErreur('Connexion impossible. Réessayez.');
    } finally {
      setChargement(false);
    }
  };

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="text-[11px] font-bold text-coral hover:underline mt-2"
      >
        🔒 PDF réservé aux abonnés — saisir le code →
      </button>
    );
  }

  return (
    <form onSubmit={valider} className="mt-2 flex items-center gap-2">
      <input
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Code abonné"
        className="border border-line rounded px-2 py-1 text-[12px] font-mono uppercase w-[130px]"
      />
      <button type="submit" disabled={chargement || !code} className="text-[11px] font-bold text-white bg-coral rounded px-3 py-1 disabled:opacity-50">
        {chargement ? '…' : 'Ouvrir'}
      </button>
      {erreur && <span className="text-[10.5px] text-red-600">{erreur}</span>}
    </form>
  );
}
