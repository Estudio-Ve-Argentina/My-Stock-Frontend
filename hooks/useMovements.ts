"use client";

import { useEffect, useState } from "react";
import type { Movement } from "@/config/site.types";
import { listMovements } from "@/lib/api/history";

interface MovementsState {
  movements: Movement[];
  loading: boolean;
  error: boolean;
}

export function useMovements(userId: number | null | undefined) {
  const [state, setState] = useState<MovementsState>({
    movements: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    if (!userId) {
      setState({ movements: [], loading: false, error: false });
      return;
    }
    let active = true;
    setState((prev) => ({ ...prev, loading: true }));
    listMovements(userId)
      .then((movements) => {
        if (active) {
          setState({ movements, loading: false, error: false });
        }
      })
      .catch(() => {
        if (active) {
          setState({ movements: [], loading: false, error: true });
        }
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return state;
}
