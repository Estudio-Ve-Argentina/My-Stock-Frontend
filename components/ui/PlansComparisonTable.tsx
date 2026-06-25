"use client";

import { appConfig } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import type { Localized } from "@/config/site.types";

interface FeatureRow {
  label: Localized;
  values: Record<string, Localized | boolean>;
}

const featureRows: FeatureRow[] = [
  {
    label: ui.plans.products,
    values: {
      free: ui.plans.productsLimit,
      "pro-monthly": ui.plans.paidProductsLimit,
      "pro-annual": ui.plans.paidProductsLimit,
    },
  },
  {
    label: ui.plans.realtimeStock,
    values: { free: true, "pro-monthly": true, "pro-annual": true },
  },
  {
    label: ui.plans.history,
    values: { free: true, "pro-monthly": true, "pro-annual": true },
  },
  {
    label: ui.plans.prioritySupport,
    values: { free: false, "pro-monthly": true, "pro-annual": true },
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

interface PlansComparisonTableProps {
  highlightPlanId?: string;
}

export function PlansComparisonTable({ highlightPlanId }: PlansComparisonTableProps) {
  const { t } = useLanguage();

  return (
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
                  plan.id === highlightPlanId ? "bg-brand-soft/20 text-brand" : "text-foreground"
                }`}
              >
                {t(plan.name)}
                {plan.id === highlightPlanId && (
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
                      plan.id === highlightPlanId ? "bg-brand-soft/10" : ""
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
              {t(ui.plans.price)}
            </td>
            {appConfig.plans.map((plan) => {
              const period =
                plan.priceUsd === 0
                  ? ""
                  : plan.durationDays === 365
                    ? ` ${t(ui.plans.perYear)}`
                    : ` ${t(ui.plans.perMonth)}`;
              return (
                <td
                  key={plan.id}
                  className={`border-r border-border/50 px-5 py-4 text-center last:border-r-0 ${
                    plan.id === highlightPlanId ? "bg-brand-soft/10" : ""
                  }`}
                >
                  <span className="font-heading text-lg font-bold text-foreground">
                    {plan.priceUsd === 0 ? "$0" : `$${plan.priceUsd}`}
                  </span>
                  <span className="text-xs text-subtle">{period}</span>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
