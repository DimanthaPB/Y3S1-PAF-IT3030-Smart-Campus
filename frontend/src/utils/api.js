import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Request Interceptor: add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// -------------------- RESOURCE APIs --------------------

export const getResources = () => api.get("/resources");

export const getResourceById = (id) => api.get(`/resources/${id}`);

export const createResource = (data) => api.post("/resources", data);

export const updateResource = (id, data) => api.put(`/resources/${id}`, data);

export const deleteResource = (id) => api.delete(`/resources/${id}`);

export const searchResources = (params) =>
  api.get("/resources/search", { params });

export default api;
