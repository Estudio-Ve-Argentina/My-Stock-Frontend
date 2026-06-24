"use client";

import { appConfig } from "@/config/app.config";
import type { PlanId } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import type { Localized } from "@/config/site.types";

const upgradeWhatsAppUrl = `https://wa.me/${appConfig.support.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola! Quiero pasar al plan pago de My-Stock.")}`;

interface FeatureRow {
  label: Localized;
  values: Record<string, Localized | boolean>;
}

const featureRows: FeatureRow[] = [
  {
    label: ui.plans.products,
    values: {
      free: ui.plans.productsLimit,
      pro: ui.plans.productsUnlimited,
      "pro-annual": ui.plans.productsUnlimited,
    },
  },
  {
    label: ui.plans.realtimeStock,
    values: { free: true, pro: true, "pro-annual": true },
  },
  {
    label: ui.plans.history,
    values: { free: true, pro: true, "pro-annual": true },
  },
  {
    label: ui.plans.prioritySupport,
    values: { free: false, pro: true, "pro-annual": true },
  },
  {
    label: ui.plans.multiUser,
    values: { free: false, pro: false, "pro-annual": true },
  },
  {
    label: ui.plans.exportData,
    values: { free: false, pro: true, "pro-annual": true },
  },
];

function CheckIcon() {
  return (
    <svg className="h-4 w-4 text-brand" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg className="h-4 w-4 text-subtle/40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const BACKEND_TO_CONFIG: Record<string, PlanId> = {
  FREE: "free",
  PAID: "pro",
};

export function PlansView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const currentPlanId = BACKEND_TO_CONFIG[user?.planName ?? "FREE"] ?? "free";
  const currentPlan = appConfig.plans.find((p) => p.id === currentPlanId) ?? appConfig.plans[0];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.plans.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.plans.subtitle)}</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold text-foreground">
          {t(ui.plans.yourPlan)}
        </h2>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-[0_8px_30px_-8px_rgba(22,163,74,0.12)]">
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-bold text-foreground">
              {t(currentPlan.name)}
            </span>
            <span className="text-sm text-subtle">
              {currentPlan.priceUsd === 0
                ? "$0 /mes"
                : `$${currentPlan.priceUsd} /mes`}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open(upgradeWhatsAppUrl, "_blank")}
          >
            {t(ui.plans.changePlan)}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold text-foreground">
          {t(ui.plans.compare)}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-[0_8px_30px_-8px_rgba(22,163,74,0.12)]">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b-2 border-border bg-muted/40">
                <th className="border-r border-border/50 px-5 py-4 text-left font-heading text-base font-semibold uppercase tracking-wider text-subtle">
                  {t(ui.plans.feature)}
                </th>
                {appConfig.plans.map((plan) => (
                  <th
                    key={plan.id}
                    className={`border-r border-border/50 px-5 py-4 text-center font-heading text-base font-semibold last:border-r-0 ${
                      plan.id === currentPlan.id ? "bg-brand-soft/20 text-brand" : "text-foreground"
                    }`}
                  >
                    {t(plan.name)}
                    {plan.id === currentPlan.id && (
                      <span className="ml-1.5 inline-block rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-dark">
                        {t(ui.account.current)}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                    index % 2 === 1 ? "bg-muted/15" : ""
                  }`}
                >
                  <td className="border-r border-border/50 px-5 py-3.5 font-heading text-base font-medium text-foreground">
                    {t(row.label)}
                  </td>
                  {appConfig.plans.map((plan) => {
                    const value = row.values[plan.id];
                    return (
                      <td
                        key={plan.id}
                        className={`border-r border-border/50 px-5 py-3.5 text-center last:border-r-0 ${
                          plan.id === currentPlan.id ? "bg-brand-soft/10" : ""
                        }`}
                      >
                        {typeof value === "boolean" ? (
                          <span className="inline-flex justify-center">
                            {value ? <CheckIcon /> : <CrossIcon />}
                          </span>
                        ) : (
                          <span className="text-base font-medium text-foreground">
                            {t(value as Localized)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t-2 border-border bg-muted/30">
                <td className="border-r border-border/50 px-5 py-4 font-heading text-base font-semibold uppercase tracking-wider text-subtle">
                  Precio
                </td>
                {appConfig.plans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`border-r border-border/50 px-5 py-4 text-center last:border-r-0 ${
                      plan.id === currentPlan.id ? "bg-brand-soft/10" : ""
                    }`}
                  >
                    <span className="font-heading text-lg font-bold text-foreground">
                      {plan.priceUsd === 0 ? "$0" : `$${plan.priceUsd}`}
                    </span>
                    <span className="text-xs text-subtle"> /mes</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
