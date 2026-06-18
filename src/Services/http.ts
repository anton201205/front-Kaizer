import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

console.log('[HTTP] Base URL configurada:', baseURL);

export const http = axios.create({ baseURL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[HTTP] ${config.method?.toUpperCase()} → ${config.baseURL}${config.url}`);
  return config;
});

http.interceptors.response.use(
  (response) => {
    console.log(`[HTTP] ✅ ${response.status} ← ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[HTTP] ❌ ${error.response?.status} ← ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);