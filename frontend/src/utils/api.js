import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getStoredToken = () =>
  localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

export const clearStoredToken = () => {
  localStorage.removeItem('jwt_token');
  sessionStorage.removeItem('jwt_token');
};

export const storeToken = (token, rememberUser = true) => {
  clearStoredToken();

  if (rememberUser) {
    localStorage.setItem('jwt_token', token);
    return;
  }

  sessionStorage.setItem('jwt_token', token);
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
