import type { CartItem } from './CartContext';

const SPRING_BOOT_URL =
  (import.meta.env.VITE_SPRING_BOOT_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined);

export async function warmUpBackend(): Promise<void> {
  if (!SPRING_BOOT_URL) return;
  try {
    await fetch(`${SPRING_BOOT_URL.replace(/\/+$/, '')}/api/health`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit'
    });
  } catch {
    // Silencioso por diseño
  }
}

export class StockInsuficienteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockInsuficienteError';
  }
}

type CheckoutRequest = {
  items: Array<{ productId: number; quantity: number }>;
  envio: number;
  district: string;
  metodoPago: string;
};

type CheckoutResponse = {
  orderId: number;
  subtotal: number;
  igv: number;
  envio: number;
  total: number;
};

export async function checkout(
  cart: CartItem[],
  envio: number,
  district: string,
  metodoPago: string
): Promise<CheckoutResponse> {
  if (!SPRING_BOOT_URL) {
    throw new Error('Falta VITE_SPRING_BOOT_URL (o VITE_API_URL).');
  }

  const baseUrl = SPRING_BOOT_URL.replace(/\/+$/, '');

  const body: CheckoutRequest = {
    items: cart
      .filter((i) => i.id != null)
      .map((i) => ({ productId: i.id as number, quantity: i.quantity })),
    envio,
    district,
    metodoPago
  };

  const token = localStorage.getItem('token');

  const res = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (res.status === 400) {
    const text = await res.text().catch(() => '');
    throw new StockInsuficienteError(text || 'Stock insuficiente.');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Error en checkout (${res.status}).`);
  }

  return res.json() as Promise<CheckoutResponse>;
}