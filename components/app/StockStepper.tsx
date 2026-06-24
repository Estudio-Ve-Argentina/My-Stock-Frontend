"use client";

import { useState } from "react";
import type { ProductResponse } from "@/config/site.types";

interface StockStepperProps {
  product: ProductResponse;
  onChange: (product: ProductResponse, delta: number) => Promise<void>;
}

export function StockStepper({ product, onChange }: StockStepperProps) {
  const [busy, setBusy] = useState(false);

  async function step(delta: number) {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await onChange(product, delta);
    } finally {
      setBusy(false);
    }
  }

  const buttonClass =
    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="-1"
        disabled={busy || product.stock <= 0}
        onClick={() => step(-1)}
        className={`${buttonClass} bg-muted text-foreground hover:bg-border`}
      >
        −
      </button>
      <button
        type="button"
        aria-label="+1"
        disabled={busy}
        onClick={() => step(1)}
        className={`${buttonClass} bg-brand text-brand-foreground hover:bg-brand-dark`}
      >
        +
      </button>
    </div>
  );
}
