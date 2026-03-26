import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

// Analysis API
export const analysisAPI = {
  create: (repoUrl) => api.post('/analysis', { repoUrl }),
  getById: (id) => api.get(`/analysis/${id}`),
  getStatus: (id) => api.get(`/analysis/${id}/status`),
  getAll: (params) => api.get('/analysis', { params }),
  delete: (id) => api.delete(`/analysis/${id}`)
};

// Repo API
export const repoAPI = {
  preview: (url) => api.get('/repo/preview', { params: { url } })
};

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export default api;
