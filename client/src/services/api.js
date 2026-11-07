import axios from 'axios';

// Single source of truth for the backend address.
// Accepts VITE_API_URL (preferred) or the legacy VITE_API_BASE_URL, with or
// without a trailing slash or "/api" suffix, and normalises it to the origin.
const DEFAULT_API_ORIGIN = 'https://premiumtees-website.onrender.com';
const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_ORIGIN;
export const API_ORIGIN = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api`;

// Build a full URL for fetch() calls, e.g. apiUrl('/orders') -> https://host/api/orders
export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pt_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('pt_admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  },
);

export default api;
