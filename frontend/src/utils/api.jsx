// ============================================================
// utils/api.jsx - Axios API Instance
// Unit 2: API integration with Axios
// Unit 3: REST API calls to Express backend
// CO2, CO3: Frontend-Backend communication
// ============================================================

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: Attach JWT token (CO4)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bt_token');
      localStorage.removeItem('bt_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

// ── Bugs API ──────────────────────────────────────────────────
export const bugsAPI = {
  getAll:     (params)    => api.get('/bugs', { params }),
  getById:    (id)        => api.get(`/bugs/${id}`),
  create:     (data)      => api.post('/bugs', data),
  update:     (id, data)  => api.put(`/bugs/${id}`, data),
  delete:     (id)        => api.delete(`/bugs/${id}`),
  addComment: (id, data)  => api.post(`/bugs/${id}/comments`, data),
};

// ── Projects API ──────────────────────────────────────────────
export const projectsAPI = {
  getAll:  ()          => api.get('/projects'),
  create:  (data)      => api.post('/projects', data),
  update:  (id, data)  => api.put(`/projects/${id}`, data),
  delete:  (id)        => api.delete(`/projects/${id}`),
};

// ── Users API (Admin) ─────────────────────────────────────────
export const usersAPI = {
  getAll:  ()          => api.get('/users'),
  update:  (id, data)  => api.put(`/users/${id}`, data),
  delete:  (id)        => api.delete(`/users/${id}`),
};

export default api;
