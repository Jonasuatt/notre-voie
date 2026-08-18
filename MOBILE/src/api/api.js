import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de l'API déployée — cf. docs/infrastructure.md à la racine du projet.
// Peut être surchargée via la variable d'environnement EXPO_PUBLIC_API_URL
// (build EAS / preview) sans recompiler le code.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-production-d7919.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('nv_reader_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/reader/register', data),
  login: (identifiant, motDePasse) => api.post('/auth/reader/login', { identifiant, motDePasse }),
  me: () => api.get('/auth/reader/me'),
  updateMe: (data) => api.patch('/auth/reader/me', data),
};

export const rubriquesAPI = {
  getAll: (type) => api.get('/rubriques', { params: type ? { type } : {} }),
};

export const articlesAPI = {
  list: (params) => api.get('/articles', { params }),
  getBySlug: (slug) => api.get(`/articles/${slug}`),
  enregistrerVue: (id) => api.post(`/articles/${id}/vue`, { source: 'app' }).catch(() => {}),
};

export const factCheckAPI = {
  list: () => api.get('/verite-ou-intox'),
};

export const editionsAPI = {
  list: (params) => api.get('/editions', { params }),
};

export const prixVieChereAPI = {
  ticker: () => api.get('/prix-vie-chere'),
};

export const abonnementsAPI = {
  moi: () => api.get('/abonnements/moi'),
  souscrire: (data) => api.post('/abonnements', data),
};

export const paiementsAPI = {
  payerArticle: (data) => api.post('/paiements/article', data),
};

export default api;
