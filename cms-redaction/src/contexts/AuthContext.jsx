import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const PORTAIL_STORAGE_KEY = 'nv_portail_actif';

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  // Espace de travail actif — Le Quotidien (contenu du journal papier) ou
  // Info en direct (rédaction web). Choisi une fois après connexion et
  // conservé d'une session à l'autre, pour que chaque rédaction ne voie et
  // ne crée que le contenu de son portail, sans confusion entre les deux.
  const [portailActif, setPortailActifState] = useState(
    () => localStorage.getItem(PORTAIL_STORAGE_KEY) || null
  );
  const setPortailActif = (portail) => {
    localStorage.setItem(PORTAIL_STORAGE_KEY, portail);
    setPortailActifState(portail);
  };

  useEffect(() => {
    const token = localStorage.getItem('nv_staff_token');
    if (!token) { setLoading(false); return; }
    authAPI.getMe()
      .then(({ data }) => setStaff(data.staff))
      .catch(() => localStorage.removeItem('nv_staff_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, motDePasse) => {
    const { data } = await authAPI.login(email, motDePasse);
    localStorage.setItem('nv_staff_token', data.token);
    setStaff(data.staff);
    return data.staff;
  };

  const logout = () => {
    localStorage.removeItem('nv_staff_token');
    localStorage.removeItem(PORTAIL_STORAGE_KEY);
    setStaff(null);
    setPortailActifState(null);
  };

  return (
    <AuthContext.Provider value={{ staff, loading, login, logout, portailActif, setPortailActif }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
