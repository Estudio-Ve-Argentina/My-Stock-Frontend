"use client";

import type { Localized, Movement, MovementType } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";

const typeMeta: Record<
  MovementType,
  { label: Localized; chip: string; sign: string }
> = {
  created: { label: ui.history.created, chip: "bg-brown-soft text-brown", sign: "" },
  increased: { label: ui.history.increased, chip: "bg-brand-soft text-brand-dark", sign: "+" },
  decreased: { label: ui.history.decreased, chip: "bg-accent-soft text-accent-foreground", sign: "−" },
  deleted: { label: ui.history.deleted, chip: "bg-danger/10 text-danger", sign: "" },
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
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.chip}`}>
          {t(meta.label)}
        </span>
        <span className="truncate text-sm font-medium text-foreground">
          {movement.productName}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {meta.sign && movement.quantity > 0 && (
          <span className="text-sm font-bold tabular-nums text-foreground">
            {meta.sign}
            {movement.quantity}
          </span>
        )}
        <span className="text-xs text-subtle">{timeLabel(movement.at, locale)}</span>
      </div>
    </li>
  );
}
