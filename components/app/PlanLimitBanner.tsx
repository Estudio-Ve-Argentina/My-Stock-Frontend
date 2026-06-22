"use client";

import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { LinkButton } from "@/components/ui/Button";

export function PlanLimitBanner() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent-soft/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-heading text-sm font-semibold text-foreground">
          {t(ui.products.limitReached)}
        </p>
        <p className="mt-0.5 text-sm text-subtle">{t(ui.products.limitDetail)}</p>
      </div>
      <LinkButton href="/cuenta" variant="accent" size="sm" className="shrink-0">
        {t(ui.products.upgrade)}
      </LinkButton>
    </div>
  );
}
