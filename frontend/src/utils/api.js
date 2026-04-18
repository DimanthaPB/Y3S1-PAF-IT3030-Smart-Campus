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

// -------------------- RESOURCE APIs --------------------

export const getResources = () => api.get("/resources");

export const getResourceById = (id) => api.get(`/resources/${id}`);

export const createResource = (data) => api.post("/resources", data);

export const updateResource = (id, data) => api.put(`/resources/${id}`, data);

export const deleteResource = (id) => api.delete(`/resources/${id}`);

export const searchResources = (params) =>
  api.get("/resources/search", { params });

export default api;
