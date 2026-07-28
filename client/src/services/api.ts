import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:3001/api',
  // baseURL: 'https://reportesi.plopi.com.ar/api',
  baseURL: 'https://reportesi.plopi.ar/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
