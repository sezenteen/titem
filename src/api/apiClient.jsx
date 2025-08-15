import axios from 'axios';

// Base URL configuration with fallback
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_API_BASE) || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  maxBodyLength: Infinity,
});

// Example interceptor hooks (extend as needed)
api.interceptors.request.use((config) => {
  // You can inject auth token here
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error
    const normalized = new Error(error?.response?.data?.message || error?.message || 'API error');
    normalized.status = error?.response?.status;
    normalized.data = error?.response?.data;
    return Promise.reject(normalized);
  }
);

// Helpers
const buildPageParams = (page = 0, size = 20) => ({ params: { page, size } });

// Endpoints
const products = {
  getPage: (page = 0, size = 20) => api.get('/product', buildPageParams(page, size)).then(r => r.data),
  getById: (id) => api.get(`/product/${id}`).then(r => r.data),
  getByCategoryId: (categoryId, page = 0, size = 20) => api.get(`/product/category/${categoryId}`, buildPageParams(page, size)).then(r => r.data),
  create: (payload) => api.post('/product', payload).then(r => r.data),
  update: (id, payload) => api.put(`/product/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/product/${id}`).then(r => r.data),
  // Convenience: fetch large page and filter locally (for rare cases like barcode search)
  findByBarcodeLocal: async (barcode, maxPages = 10, pageSize = 500) => {
    for (let page = 0; page < maxPages; page += 1) {
      const data = await products.getPage(page, pageSize);
      const match = (data?.content || []).find((p) => p?.barcode === barcode);
      if (match) return match;
      if (page >= (data?.totalPages || 1) - 1) break;
    }
    return null;
  },
 
};

const categories = {
  getAll: () => api.get('/category').then(r => r.data),
  create: (payload) => api.post('/category', payload).then(r => r.data),
  update: (id, payload) => api.put(`/category/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/category/${id}`).then(r => r.data),
};

const users = {
  // Admin endpoints for users
  getAll: () => api.get('/admin/user').then(r => r.data),
  create: (payload) => api.post('/admin/user', payload).then(r => r.data),
  update: (id, payload) => api.put(`/admin/user/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/admin/user/${id}`).then(r => r.data),
};

const settings = {
  get: () => api.get('/settings').then(r => r.data),
  update: (payload) => api.put('/settings', payload).then(r => r.data),
};

export default {
  axios: api,
  baseURL: API_BASE,
  products,
  categories,
  users,
  settings,
};