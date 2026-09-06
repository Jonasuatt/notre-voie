'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Saisie du code reçu par mail. L'abonné n'a pas de compte à créer : le code
// suffit, et vaut pour tous les articles jusqu'à son échéance.
export default function CodeLecteur() {
  const [ouvert, setOuvert] = useState(false);
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const router = useRouter();

  async function valider(e) {
    e.preventDefault();
    setEnvoi(true);
    setErreur('');
    try {
      const res = await fetch('/api/acces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Code refusé.');
      router.refresh();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  if (!ouvert) {
    return (
      <button type="button" onClick={() => setOuvert(true)} className="font-mono text-[11px] underline text-muted hover:text-ink mt-4">
        J&apos;ai déjà un code d&apos;abonné
      </button>
    );
  }

  return (
    <form onSubmit={valider} className="mt-5 max-w-sm mx-auto">
      <label htmlFor="code-abonne" className="font-mono text-[10.5px] uppercase tracking-widest text-muted block mb-2">
        Code reçu par mail
      </label>
      <div className="flex gap-2">
        <input
          id="code-abonne"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="NV-XXXXXX"
          autoComplete="off"
          className="flex-1 border border-line rounded-full px-4 py-2.5 text-[13.5px] font-mono tracking-wider bg-white text-ink"
        />
        <button type="submit" disabled={envoi || !code} className="bg-coral text-white font-bold text-[13px] px-5 py-2.5 rounded-full disabled:opacity-50">
          {envoi ? '…' : 'Valider'}
        </button>
      </div>
      {erreur && <p className="text-[12.5px] text-coral mt-2">{erreur}</p>}
    </form>
  );
}
