import { http } from './http';

export type PerfilData = {
  id: number;
  email: string;
  nombre: string | null;
  telefono: string | null;
  direccion: string | null;
  distrito: string | null;
  dni: string | null;
  role: string;
};

export type PerfilRequest = {
  email?: string;
  nombre?: string;
  telefono?: string;
  direccion?: string;
  distrito?: string;
  dni?: string;
};

export type PerfilUpdateResponse = {
  perfil: PerfilData;
  token?: string;
} | PerfilData;

export type Orden = {
  id: number;
  estado: string;
  total: number;
  subtotal: number;
  igv: number;
  envio: number;
  distrito: string;
  metodoPago: string;
  createdAt: string;
  items: OrdenItem[];
};

export type OrdenItem = {
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export async function getPerfil(): Promise<PerfilData> {
  const { data } = await http.get<PerfilData>('/api/usuarios/perfil');
  return data;
}

export async function updatePerfil(payload: PerfilRequest): Promise<PerfilUpdateResponse> {
  const { data } = await http.put<PerfilUpdateResponse>('/api/usuarios/perfil', payload);
  return data;
}

export async function getMisOrdenes(): Promise<Orden[]> {
  const { data } = await http.get<Orden[]>('/api/usuarios/ordenes');
  return data;
}