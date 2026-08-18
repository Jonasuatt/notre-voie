import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

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
    setStaff(null);
  };

  return (
    <AuthContext.Provider value={{ staff, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
