"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupplierRequest, SupplierResponse } from "@/config/site.types";
import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  updateSupplier,
} from "@/lib/api/suppliers";

interface SuppliersState {
  suppliers: SupplierResponse[];
  loading: boolean;
  error: boolean;
}

export function useSuppliers() {
  const [state, setState] = useState<SuppliersState>({
    suppliers: [],
    loading: true,
    error: false,
  });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const suppliers = await listSuppliers();
      setState({ suppliers, loading: false, error: false });
    } catch {
      setState((current) => ({ ...current, loading: false, error: true }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (input: SupplierRequest) => {
    const created = await createSupplier(input);
    setState((current) => ({
      ...current,
      suppliers: [...current.suppliers, created],
    }));
    return created;
  }, []);

  const update = useCallback(async (id: number, input: SupplierRequest) => {
    const updated = await updateSupplier(id, input);
    setState((current) => ({
      ...current,
      suppliers: current.suppliers.map((item) =>
        item.id === id ? updated : item,
      ),
    }));
  }, []);

  const remove = useCallback(async (id: number) => {
    await deleteSupplier(id);
    setState((current) => ({
      ...current,
      suppliers: current.suppliers.filter((item) => item.id !== id),
    }));
  }, []);

  return { ...state, reload: load, add, update, remove };
}
