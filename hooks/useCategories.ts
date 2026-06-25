"use client";

import { useCallback, useEffect, useState } from "react";
import type { CategoryRequest, CategoryResponse } from "@/config/site.types";
import {
  createCategory,
  deleteCategory,
  listCategories,
  renameCategory,
} from "@/lib/api/categories";

interface CategoriesState {
  categories: CategoryResponse[];
  loading: boolean;
  error: boolean;
}

export function useCategories() {
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    loading: true,
    error: false,
  });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const categories = await listCategories();
      setState({ categories, loading: false, error: false });
    } catch {
      setState((current) => ({ ...current, loading: false, error: true }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (input: CategoryRequest) => {
    const created = await createCategory(input);
    setState((current) => ({
      ...current,
      categories: [...current.categories, created],
    }));
    return created;
  }, []);

  const rename = useCallback(async (id: number, input: CategoryRequest) => {
    const updated = await renameCategory(id, input);
    setState((current) => ({
      ...current,
      categories: current.categories.map((item) =>
        item.id === id ? updated : item,
      ),
    }));
  }, []);

  const remove = useCallback(async (id: number) => {
    await deleteCategory(id);
    setState((current) => ({
      ...current,
      categories: current.categories.filter((item) => item.id !== id),
    }));
  }, []);

  return { ...state, reload: load, add, rename, remove };
}
