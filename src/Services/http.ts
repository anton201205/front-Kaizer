import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

if (!import.meta.env.VITE_API_URL) {
  console.warn('[HTTP] No está definido VITE_API_URL, usando http://localhost:8080 como fallback');
}
console.log('[HTTP] Base URL configurada:', baseURL);

export const http = axios.create({ baseURL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    console.log('[HTTP] Token enviado:', token.substring(0, 20) + '...');
  } else {
    console.warn('[HTTP] Sin token');
  }
  console.log(`[HTTP] ${config.method?.toUpperCase()} → ${config.baseURL}${config.url}`);
  return config;
});

http.interceptors.response.use(
  (response) => {
    console.log(`[HTTP] ${response.status} ← ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[HTTP] ${error.response?.status} ← ${error.config?.url}`);
    console.error('[HTTP] Error body:', error.response?.data);
    return Promise.reject(error);
  }
);