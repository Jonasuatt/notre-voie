import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nv_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('nv_admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, motDePasse) => api.post('/auth/staff/login', { email, motDePasse }),
  getMe: () => api.get('/auth/staff/me'),
};

export const statsAPI = {
  get: () => api.get('/admin/stats'),
};

export const staffAPI = {
  getAll: () => api.get('/staff'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.patch(`/staff/${id}`, data),
};

export const rubriquesAPI = {
  getAll: (type) => api.get('/rubriques', { params: type ? { type } : {} }),
};

export const annonceursAPI = {
  getAll: () => api.get('/campagnes/annonceurs'),
  create: (data) => api.post('/campagnes/annonceurs', data),
};

export const campagnesAPI = {
  getAll: (params) => api.get('/campagnes', { params }),
  getOne: (id) => api.get(`/campagnes/${id}`),
  create: (data) => api.post('/campagnes', data),
  changerStatut: (id, statut) => api.patch(`/campagnes/${id}/statut`, { statut }),
  facturer: (id, data) => api.post(`/campagnes/${id}/factures`, data),
  changerStatutFacture: (campagneId, factureId, statut) =>
    api.patch(`/campagnes/${campagneId}/factures/${factureId}`, { statut }),
};

export default api;
