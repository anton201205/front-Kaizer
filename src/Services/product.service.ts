import { http } from './http';
import type { Product } from '../Model/Product';

interface ProductoApi {
  id: number;
  nombre: string;
  precio: number;
  stock?: number;
  image_url?: string;
  imageUrl?: string;
  descripcion?: string;
  especificaciones?: any;
}

function mapApiToProduct(p: ProductoApi): Product {
  return {
    id: p.id,
    name: p.nombre,
    price: p.precio,
    imageUrl: p.imageUrl ?? p.image_url ?? '',
    category: 'General',
    description: p.descripcion ?? (p.stock != null ? `Unidades en stock: ${p.stock}.` : undefined),
    stock: p.stock,
    specifications: p.especificaciones
  };
}

export async function getProducts(): Promise<Product[]> {
  console.log('[PRODUCTS] Obteniendo productos desde Render...');
  try {
    const { data } = await http.get<ProductoApi[]>('/api/productos');
    console.log('[PRODUCTS] Productos obtenidos:', data.length);
    return (data ?? []).map(mapApiToProduct);
  } catch (error: any) {
    console.error('[PRODUCTS] Error al obtener productos:', error?.response?.status);
    throw new Error('Error de conexión con el servidor');
  }
}

export async function getProductById(id: number): Promise<Product | undefined> {
  console.log('[PRODUCTS] Obteniendo producto', id, 'desde Render...');
  try {
    const { data } = await http.get<ProductoApi>(`/api/productos/${id}`);
    return mapApiToProduct(data);
  } catch (error: any) {
    if (error?.response?.status === 404) return undefined;
    throw new Error('Error de conexión con el servidor');
  }
}