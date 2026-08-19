import axios from 'axios';
import { mockBackend } from './mockBackend';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nv_staff_token');
  if (token && !token.startsWith('mock.')) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('nv_staff_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// L'API réelle est appelée en priorité. Si le serveur est injoignable
// (pas encore déployé / pas de base de données dans cet environnement —
// erreur réseau, sans réponse HTTP), on bascule sur un backend simulé en
// mémoire qui respecte exactement le même contrat. Une vraie erreur
// métier de l'API (401, 409, 422…) n'est en revanche jamais masquée :
// seule l'absence de réponse déclenche le repli. Voir docs/DECISIONS.md.
async function withMockFallback(realCall, mockCall) {
  try {
    return await realCall();
  } catch (err) {
    if (err.response) throw err; // erreur métier réelle — ne pas masquer
    if (import.meta.env.DEV) console.warn('[notre-voie-cms] API injoignable, bascule sur le backend de démonstration —', err.message);
    try {
      return { data: mockCall() };
    } catch (mockErr) {
      throw mockErr; // erreur métier simulée (ex: 409 checklist incomplète)
    }
  }
}

export const authAPI = {
  login: (email, motDePasse) =>
    withMockFallback(() => api.post('/auth/staff/login', { email, motDePasse }), () => mockBackend.login(email, motDePasse)),
  getMe: () => withMockFallback(() => api.get('/auth/staff/me'), () => mockBackend.getMe()),
};

export const rubriquesAPI = {
  getAll: (type) =>
    withMockFallback(() => api.get('/rubriques', { params: type ? { type } : {} }), () => mockBackend.getRubriques(type)),
};

export const articlesAPI = {
  listCms: (params) => withMockFallback(() => api.get('/articles/cms', { params }), () => mockBackend.listCms(params)),
  getById: (id) => withMockFallback(() => api.get(`/articles/cms/${id}`), () => mockBackend.getById(id)),
  create: (data) => withMockFallback(() => api.post('/articles', data), () => mockBackend.create(data)),
  update: (id, data) => withMockFallback(() => api.patch(`/articles/${id}`, data), () => mockBackend.update(id, data)),
  soumettre: (id) => withMockFallback(() => api.post(`/articles/${id}/soumettre`), () => mockBackend.soumettre(id)),
  valider: (id) => withMockFallback(() => api.post(`/articles/${id}/valider`), () => mockBackend.valider(id)),
  publier: (id) => withMockFallback(() => api.post(`/articles/${id}/publier`), () => mockBackend.publier(id)),
  depublier: (id) => withMockFallback(() => api.post(`/articles/${id}/depublier`), () => mockBackend.depublier(id)),
  ajouterLiveUpdate: (id, contenu) =>
    withMockFallback(() => api.post(`/articles/${id}/live`, { contenu }), () => mockBackend.ajouterLiveUpdate(id, contenu)),
  cocherChecklist: (articleId, itemId) =>
    withMockFallback(() => api.patch(`/articles/${articleId}/checklist/${itemId}`), () => mockBackend.cocherChecklist(articleId, itemId)),
  creerFactCheck: (articleId, data) =>
    withMockFallback(() => api.post(`/articles/${articleId}/fact-check`, data), () => mockBackend.creerFactCheck(articleId, data)),
};

export const editionsAPI = {
  getAll: (params) => withMockFallback(() => api.get('/editions', { params }), () => mockBackend.editionsGetAll()),
  create: (data) => withMockFallback(() => api.post('/editions', data), () => mockBackend.editionsCreate(data)),
};

export const prixVieChereAPI = {
  ticker: () => withMockFallback(() => api.get('/prix-vie-chere'), () => mockBackend.ticker()),
  create: (data) => withMockFallback(() => api.post('/prix-vie-chere', data), () => mockBackend.createPrix(data)),
};

// Médiathèque / photothèque : illustration des articles (photos légendées,
// galeries, vidéos, audios). `list` sert aussi bien la photothèque libre
// (?unattached=true) que la galerie d'un article précis (?articleId=…).
export const mediaAPI = {
  list: (params) => withMockFallback(() => api.get('/media', { params }), () => mockBackend.mediaList(params)),
  upload: (file, meta = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(meta).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') formData.append(k, v);
    });
    return withMockFallback(
      () => {
        const token = localStorage.getItem('nv_staff_token');
        const headers = token && !token.startsWith('mock.') ? { Authorization: `Bearer ${token}` } : {};
        // Requête axios "nue" (pas l'instance `api`) : son Content-Type par
        // défaut (application/json) casserait la frontière multipart —
        // ici on laisse axios/le navigateur la déduire eux-mêmes du FormData.
        return axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/media/upload`, formData, { headers });
      },
      () => mockBackend.mediaUpload(file, meta)
    );
  },
  create: (data) => withMockFallback(() => api.post('/media', data), () => mockBackend.mediaCreate(data)),
  update: (id, data) => withMockFallback(() => api.patch(`/media/${id}`, data), () => mockBackend.mediaUpdate(id, data)),
  reorder: (ids) => withMockFallback(() => api.patch('/media/reorder', { ids }), () => mockBackend.mediaReorder(ids)),
  remove: (id) => withMockFallback(() => api.delete(`/media/${id}`), () => mockBackend.mediaRemove(id)),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  envoyer: (id) => api.post(`/notifications/${id}/envoyer`),
};

export default api;
