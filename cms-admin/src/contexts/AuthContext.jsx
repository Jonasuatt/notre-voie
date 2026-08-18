import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const ROLES_ADMIN_CMS = ['ADMIN', 'REGIE'];

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nv_admin_token');
    if (!token) { setLoading(false); return; }
    authAPI.getMe()
      .then(({ data }) => setStaff(data.staff))
      .catch(() => localStorage.removeItem('nv_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, motDePasse) => {
    const { data } = await authAPI.login(email, motDePasse);
    if (!ROLES_ADMIN_CMS.includes(data.staff.role)) {
      const err = new Error("Ce compte n'a pas accès à l'administration. Utilisez le CMS Rédaction.");
      err.response = { data: { error: err.message } };
      throw err;
    }
    localStorage.setItem('nv_admin_token', data.token);
    setStaff(data.staff);
    return data.staff;
  };

  const logout = () => {
    localStorage.removeItem('nv_admin_token');
    setStaff(null);
  };

  return (
    <AuthContext.Provider value={{ staff, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
