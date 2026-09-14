import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
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

// SEC-008: Automatic token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        // Update local storage with new token
        const authData = JSON.parse(localStorage.getItem('shoppease_auth') || '{}');
        authData.token = data.token;
        localStorage.setItem('shoppease_auth', JSON.stringify(authData));
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and force login
        localStorage.removeItem('shoppease_auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

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
