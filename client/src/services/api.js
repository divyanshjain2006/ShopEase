import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shoppease_auth')
    ? JSON.parse(localStorage.getItem('shoppease_auth')).token
    : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to rehydrate auth state from localStorage on load
export const loadAuth = () => {
  try {
    const stored = localStorage.getItem('shoppease_auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed && parsed.token ? parsed : null;
  } catch {
    return null;
  }
};

export const saveAuth = (data) => {
  localStorage.setItem('shoppease_auth', JSON.stringify(data));
};

export const clearAuth = () => {
  localStorage.removeItem('shoppease_auth');
};

export default api;
