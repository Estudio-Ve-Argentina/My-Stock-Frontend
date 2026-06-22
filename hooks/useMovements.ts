"use client";

import { useEffect, useState } from "react";
import type { Movement } from "@/config/site.types";
import { listMovements } from "@/lib/api/history";

interface MovementsState {
  movements: Movement[];
  loading: boolean;
  error: boolean;
}

export function useMovements() {
  const [state, setState] = useState<MovementsState>({
    movements: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let active = true;
    listMovements()
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
  }, []);

  return state;
}
