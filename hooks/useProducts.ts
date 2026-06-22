"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductRequest, ProductResponse } from "@/config/site.types";
import {
  createProduct,
  deleteProduct,
  listProductsByUsername,
  updateStock,
} from "@/lib/api/products";

interface ProductsState {
  products: ProductResponse[];
  loading: boolean;
  error: boolean;
}

export function useProducts(username: string | undefined) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: true,
    error: false,
  });

  const load = useCallback(async () => {
    if (!username) {
      return;
    }
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const products = await listProductsByUsername(username);
      setState({ products, loading: false, error: false });
    } catch {
      setState((current) => ({ ...current, loading: false, error: true }));
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (input: ProductRequest) => {
    const created = await createProduct(input);
    setState((current) => ({
      ...current,
      products: [created, ...current.products],
    }));
  }, []);

  const changeStock = useCallback(
    async (product: ProductResponse, delta: number) => {
      if (product.id === undefined || product.stock + delta < 0) {
        return;
      }
      const updated = await updateStock(product.id, delta);
      setState((current) => ({
        ...current,
        products: current.products.map((item) =>
          item.id === product.id ? updated : item,
        ),
      }));
    },
    [],
  );

  const remove = useCallback(async (product: ProductResponse) => {
    if (product.id === undefined) {
      return;
    }
    await deleteProduct(product.id);
    setState((current) => ({
      ...current,
      products: current.products.filter((item) => item.id !== product.id),
    }));
  }, []);

  return { ...state, reload: load, add, changeStock, remove };
}
