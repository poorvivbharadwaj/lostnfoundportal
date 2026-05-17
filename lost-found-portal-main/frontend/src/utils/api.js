import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Lost Items ────────────────────────────────────────────────────
export const getLostItems = (params = {}) =>
  api.get('/lost', { params });

export const getLostItem = (id) =>
  api.get(`/lost/${id}`);

export const postLostItem = (formData) =>
  api.post('/lost', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ── Found Items ───────────────────────────────────────────────────
export const getFoundItems = (params = {}) =>
  api.get('/found', { params });

export const getFoundItem = (id) =>
  api.get(`/found/${id}`);

export const postFoundItem = (formData) =>
  api.post('/found', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ── Search ────────────────────────────────────────────────────────
export const searchItems = (params = {}) =>
  api.get('/search', { params });

// ── Admin Auth ────────────────────────────────────────────────────
export const adminLogin = (credentials) =>
  api.post('/auth/login', credentials);

export const verifyToken = () =>
  api.get('/auth/verify');

// ── Admin Operations ──────────────────────────────────────────────
export const getDashboardStats = () =>
  api.get('/admin/dashboard');

export const getAdminLostItems = (params = {}) =>
  api.get('/admin/lost', { params });

export const getAdminFoundItems = (params = {}) =>
  api.get('/admin/found', { params });

export const approveLostItem = (id) =>
  api.patch(`/admin/lost/${id}/approve`);

export const approveFoundItem = (id) =>
  api.patch(`/admin/found/${id}/approve`);

export const rejectLostItem = (id) =>
  api.patch(`/admin/lost/${id}/reject`);

export const rejectFoundItem = (id) =>
  api.patch(`/admin/found/${id}/reject`);

export const updateAdminLostItem = (id, payload) =>
  api.patch(`/admin/lost/${id}`, payload);

export const updateAdminFoundItem = (id, payload) =>
  api.patch(`/admin/found/${id}`, payload);

export const archiveAdminLostItem = (id) =>
  api.patch(`/admin/lost/${id}/archive`);

export const archiveAdminFoundItem = (id) =>
  api.patch(`/admin/found/${id}/archive`);

export const restoreAdminLostItem = (id) =>
  api.patch(`/admin/lost/${id}/restore`);

export const restoreAdminFoundItem = (id) =>
  api.patch(`/admin/found/${id}/restore`);

export const deleteAdminLostItem = (id) =>
  api.delete(`/admin/lost/${id}`);

export const deleteAdminFoundItem = (id) =>
  api.delete(`/admin/found/${id}`);

export default api;
