"use client";

import { useEffect, useState } from "react";
import { HIDDEN_PLAN_IDS, PLAN_ORDER, PLAN_PRESENTATION, configIdFromBackend } from "@/config/app.config";
import type { Plan } from "@/config/site.types";
import { listPlans } from "@/lib/api/plans";

interface PlansState {
  plans: Plan[];
  loading: boolean;
  error: boolean;
}

interface UsePlansOptions {
  includeHidden?: boolean;
}

export function usePlans(options: UsePlansOptions = {}) {
  const { includeHidden = false } = options;
  const [state, setState] = useState<PlansState>({ plans: [], loading: true, error: false });

  useEffect(() => {
    let cancelled = false;
    listPlans()
      .then((backendPlans) => {
        if (cancelled) return;
        const merged = backendPlans
          .map((backendPlan): Plan | null => {
            const id = configIdFromBackend(backendPlan.name);
            const presentation = PLAN_PRESENTATION[id];
            if (!presentation) return null;
            if (!includeHidden && HIDDEN_PLAN_IDS.includes(id)) return null;
            return {
              id,
              name: presentation.name,
              features: presentation.features,
              price: backendPlan.price,
              productLimit: backendPlan.maxProducts,
              durationDays: backendPlan.durationDays,
            };
          })
          .filter((plan): plan is Plan => plan !== null)
          .sort((a, b) => PLAN_ORDER.indexOf(a.id) - PLAN_ORDER.indexOf(b.id));
        setState({ plans: merged, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ plans: [], loading: false, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [includeHidden]);

  return state;
}
