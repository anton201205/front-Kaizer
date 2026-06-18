import { useEffect, useMemo, useState } from 'react';
import { getProducts } from '../Services/product.service';
import type { Product } from '../Model/Product';

type UseProductsState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useProducts(): UseProductsState {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useMemo(
    () => async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
}