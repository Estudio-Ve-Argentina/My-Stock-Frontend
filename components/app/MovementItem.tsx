"use client";

import type { Localized, Movement, MovementType, StockReason } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";

const typeMeta: Record<
  MovementType,
  { label: Localized; chip: string; sign: string }
> = {
  created: { label: ui.history.created, chip: "bg-brown-soft text-brown", sign: "" },
  increased: { label: ui.history.increased, chip: "bg-brand-soft text-brand-dark", sign: "+" },
  decreased: { label: ui.history.decreased, chip: "bg-accent-soft text-accent-foreground", sign: "−" },
  modified: { label: ui.history.modified, chip: "bg-brown-soft text-brown", sign: "" },
  deleted: { label: ui.history.deleted, chip: "bg-danger/10 text-danger", sign: "" },
};

const reasonLabels: Record<StockReason, Localized> = {
  VENTA: ui.products.reasonSale,
  MERMA: ui.products.reasonWaste,
  DEVOLUCION: ui.products.reasonReturn,
  AJUSTE_CONTEO: ui.products.reasonCount,
};

function timeLabel(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "es" ? "es-AR" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MovementItem({ movement }: { movement: Movement }) {
  const { t, locale } = useLanguage();
  const meta = typeMeta[movement.type];

  return (
    <li className="flex items-center justify-between gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-[0_4px_16px_-4px_rgba(22,163,74,0.08)] transition-shadow hover:shadow-[0_8px_24px_-4px_rgba(22,163,74,0.14)]">
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2.5">
        <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-semibold sm:self-auto ${meta.chip}`}>
          {t(meta.label)}
        </span>
        <span className="truncate font-heading text-sm font-semibold text-foreground">
          {movement.productName}
        </span>
        <div className="flex gap-1.5">
          {movement.reason && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-subtle">
              {t(reasonLabels[movement.reason])}
            </span>
          )}
          {movement.branchName && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-subtle">
              {movement.branchName}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        {meta.sign && movement.quantity > 0 && (
          <span className="font-heading text-sm font-bold tabular-nums text-foreground">
            {meta.sign}
            {movement.quantity}
          </span>
        )}
        <span className="text-xs text-subtle">{timeLabel(movement.at, locale)}</span>
      </div>
    </li>
  );
}
