import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'nv_reader_token';

export function AuthProvider({ children }) {
  const [reader, setReader] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return setLoading(false);
      try {
        const { data } = await authAPI.me();
        setReader(data.reader);
      } catch (err) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (identifiant, motDePasse) => {
    const { data } = await authAPI.login(identifiant, motDePasse);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setReader(data.reader);
    return data.reader;
  };

  const register = async (payload) => {
    const { data } = await authAPI.register(payload);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    setReader(data.reader);
    return data.reader;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setReader(null);
  };

  return (
    <AuthContext.Provider value={{ reader, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
