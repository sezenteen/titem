import axios from 'axios';

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
const AUTH_BASE_URL = import.meta.env.PUBLIC_AUTH_BASE_URL || 'http://localhost:5000';

function getAuthToken() {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }
  return null;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authClient = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export default apiClient;