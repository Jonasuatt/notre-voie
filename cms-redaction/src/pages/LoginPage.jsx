import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { staff, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && staff) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, motDePasse);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Connexion impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center rounded-full overflow-hidden font-serif font-extrabold text-[18px]">
            <span className="bg-navy text-white px-4 py-2">Notre</span>
            <span className="bg-white text-coral font-black px-4 py-2">Voie</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-7">
          <h1 className="text-lg font-bold text-center">CMS 2 — Rédaction</h1>
          <p className="text-xs text-gray-500 text-center mt-1">Réservé au personnel de la rédaction</p>

          <div className="mt-6">
            <label className="label">Email</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@notrevoienews.com" />
          </div>
          <div className="mt-4">
            <label className="label">Mot de passe</label>
            <input type="password" required className="input" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-6">
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-white/30 text-[11px] mt-6 font-mono">Notre métier, informer</p>
      </div>
    </div>
  );
}
