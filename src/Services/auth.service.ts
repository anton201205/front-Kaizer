import { http } from './http';

type LoginResponse = {
  token: string;
};

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

console.log('[AUTH] Usando backend:', API_URL ?? '❌ NO DEFINIDO - revisá VITE_API_URL');

export async function login(email: string, password: string): Promise<LoginResponse> {
  console.log('[AUTH] Login →', `${API_URL}/api/auth/login`);
  try {
    const { data } = await http.post<LoginResponse>('/api/auth/login', { email, password });
    console.log('[AUTH] Login exitoso');
    return data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 0 || !status) throw new Error('Error de conexión con el servidor');
    if (status === 503 || status === 502) throw new Error('Error de conexión a la BD');
    throw error;
  }
}

export async function register(email: string, password: string): Promise<LoginResponse> {
  console.log('[AUTH] Register →', `${API_URL}/api/auth/register`);
  try {
    const { data } = await http.post<LoginResponse>('/api/auth/register', { email, password });
    console.log('[AUTH] Registro exitoso');
    return data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 0 || !status) throw new Error('Error de conexión con el servidor');
    if (status === 503 || status === 502) throw new Error('Error de conexión a la BD');
    throw error;
  }
}