import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de l'API déployée — cf. docs/infrastructure.md à la racine du projet.
// Peut être surchargée via la variable d'environnement EXPO_PUBLIC_API_URL
// (build EAS / preview) sans recompiler le code.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-production-d7919.up.railway.app/api';

// 30 s : l'API s'endort après une période sans trafic et sa première réponse
// demande une douzaine de secondes. Avec 10 s, tout écran ouvert au réveil
// restait vide.
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('nv_reader_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Code de lecture de l'abonné : c'est l'API qui décide de débloquer, l'app
  // ne fait que présenter la clé — même mécanique que sur le site.
  const code = await AsyncStorage.getItem('nv_code_lecture');
  if (code) config.headers['x-code-lecture'] = code;
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

export const codesLectureAPI = {
  verifier: (code) => api.post('/codes-lecture/verifier', { code }),
};

export const factCheckAPI = {
  list: () => api.get('/verite-ou-intox'),
};

export const editionsAPI = {
  list: (params) => api.get('/editions', { params }),
  // Le PDF complet n'est jamais exposé dans la liste : il se débloque avec le
  // code remis à l'abonné (cf. editions.controller.js).
  deverrouiller: (id, code) => api.post(`/editions/${id}/deverrouiller`, { code }),
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
