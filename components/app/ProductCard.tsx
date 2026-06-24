"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ProductResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { StockStepper } from "./StockStepper";

interface ProductCardProps {
  product: ProductResponse;
  onStock: (product: ProductResponse, delta: number) => Promise<void>;
  onDelete: (product: ProductResponse) => void;
}

function stockStyles(stock: number): { badge: string; top: string } {
  if (stock === 0) {
    return { badge: "bg-danger/10 text-danger", top: "border-t-danger" };
  }
  if (stock <= 3) {
    return { badge: "bg-accent-soft text-accent-foreground", top: "border-t-accent" };
  }
  return { badge: "bg-brand-soft text-brand-dark", top: "border-t-brand" };
}

export function ProductCard({ product, onStock, onDelete }: ProductCardProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const styles = stockStyles(product.stock);

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`flex h-full flex-col gap-4 rounded-2xl border border-border border-t-4 bg-surface p-5 transition-shadow hover:shadow-lg hover:shadow-brand/5 ${styles.top}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold tabular-nums ${styles.badge}`}
        >
          {product.stock}
        </span>
        <button
          type="button"
          aria-label={t(ui.common.delete)}
          onClick={() => onDelete(product)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-heading text-base font-semibold text-foreground">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-subtle">{product.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs font-medium uppercase tracking-wide text-subtle">
          {t(ui.products.stock)}
        </span>
        <StockStepper product={product} onChange={onStock} />
      </div>
    </motion.article>
  );
}
