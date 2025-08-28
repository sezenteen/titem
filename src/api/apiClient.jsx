// ===== 1. FIXED API CLIENT (src/api/apiClient.jsx) =====
import axios from 'axios';

// Base URL configuration - UPDATED to match your backend
const API_BASE = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 
    'Content-Type': 'application/json',
  },
  maxBodyLength: Infinity,
});

// Auth token management
let authToken = null;
if (typeof localStorage !== 'undefined') {
  authToken = localStorage.getItem('authToken');
}

// Request interceptor to add auth header
api.interceptors.request.use((config) => {
  if (authToken) {
    // For HTTP Basic auth with your Spring Security setup
    config.headers.Authorization = `Basic ${authToken}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      authToken = null;
      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    const normalized = new Error(error?.response?.data?.message || error?.message || 'API error');
    normalized.status = error?.response?.status;
    normalized.data = error?.response?.data;
    return Promise.reject(normalized);
  }
);

// Helper functions
const buildPageParams = (page = 0, size = 20) => ({ params: { page, size } });

// Auth functions
const auth = {
  login: async (email, password) => {
    // Create Basic Auth token
    const token = btoa(`${email}:${password}`);
    
    try {
      // Test the credentials by making a request to a protected endpoint
      const response = await axios.get(`${API_BASE}/user`, {
        headers: {
          Authorization: `Basic ${token}`
        }
      });
      
      // If successful, store the token
      authToken = token;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', email);
      }
      
      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.status === 401 ? 'Invalid credentials' : 'Login failed' 
      };
    }
  },
  
  register: async (fullName, email, password, role = 'USER') => {
    try {
      const response = await api.post('/user', {
        fullName,
        email,
        password,
        role
      });
      
      return { success: true, message: 'Registration successful', data: response.data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  },
  
  logout: () => {
    authToken = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
    }
  },
  
  isLoggedIn: () => {
    return !!authToken;
  },
  
  getCurrentUser: () => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('userEmail');
    }
    return null;
  }
};

// Products endpoints - FIXED to match your backend
const products = {
  getPage: (page = 0, size = 20) => 
    api.get('/product', buildPageParams(page, size)).then(r => r.data),
  
  getById: (id) => 
    api.get(`/product/id/${id}`).then(r => r.data),
  
  getByCategoryId: (categoryId, page = 0, size = 20) => 
    api.get(`/product/category/${categoryId}`, buildPageParams(page, size)).then(r => r.data),
  
  create: (payload) => 
    api.post('/product', payload).then(r => r.data),
  
  update: (id, payload) => 
    api.put(`/product/${id}`, payload).then(r => r.data),
  
  remove: (id) => 
    api.delete(`/product/${id}`).then(r => r.data),
  
  searchByName: (name) =>
    api.get(`/product/name/${name}`).then(r => r.data),
  
  getByBarcode: (barcode) =>
    api.get(`/product/barcode/${barcode}`).then(r => r.data)
};

// Categories endpoints - FIXED
const categories = {
  getAll: () => api.get('/category').then(r => r.data),
  getById: (id) => api.get(`/category/${id}`).then(r => r.data),
  create: (payload) => api.post('/category', payload).then(r => r.data),
  update: (id, payload) => api.put(`/category/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/category/${id}`).then(r => r.data),
};

// Users endpoints - FIXED
const users = {
  getAll: () => api.get('/user').then(r => r.data),
  getById: (id) => api.get(`/user/${id}`).then(r => r.data),
  create: (payload) => api.post('/user', payload).then(r => r.data),
  update: (id, payload) => api.put(`/user/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/user/${id}`).then(r => r.data),
};

export default {
  axios: api,
  baseURL: API_BASE,
  auth,
  products,
  categories,
  users,
};
