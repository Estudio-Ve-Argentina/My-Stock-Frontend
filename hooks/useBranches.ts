"use client";

import { useCallback, useEffect, useState } from "react";
import type { BranchRequest, BranchResponse } from "@/config/site.types";
import {
  createBranch,
  deleteBranch,
  listBranches,
  updateBranch,
} from "@/lib/api/branches";

interface BranchesState {
  branches: BranchResponse[];
  loading: boolean;
  error: boolean;
}

export function useBranches() {
  const [state, setState] = useState<BranchesState>({
    branches: [],
    loading: true,
    error: false,
  });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const branches = await listBranches();
      setState({ branches, loading: false, error: false });
    } catch {
      setState((current) => ({ ...current, loading: false, error: true }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (input: BranchRequest) => {
    const created = await createBranch(input);
    setState((current) => ({
      ...current,
      branches: [...current.branches, created],
    }));
    return created;
  }, []);

  const update = useCallback(async (id: number, input: BranchRequest) => {
    const updated = await updateBranch(id, input);
    setState((current) => ({
      ...current,
      branches: current.branches.map((item) =>
        item.id === id ? updated : item,
      ),
    }));
  }, []);

  const remove = useCallback(async (id: number) => {
    await deleteBranch(id);
    setState((current) => ({
      ...current,
      branches: current.branches.filter((item) => item.id !== id),
    }));
  }, []);

  return { ...state, reload: load, add, update, remove };
}
