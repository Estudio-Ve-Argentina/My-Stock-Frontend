"use client";

import { useEffect, useState } from "react";
import { PLAN_PRESENTATION, configIdFromBackend, formatPrice } from "@/config/app.config";
import type { AdminStatsResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { getAdminStats } from "@/lib/api/admin";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Spinner } from "@/components/ui/Spinner";
import { UserIcon, ChartIcon, TrendingIcon } from "@/components/app/icons";
import { AdminPageHeader } from "./AdminPageHeader";

type Tone = "accent" | "brown" | "brand";

const toneClasses: Record<Tone, string> = {
  accent: "bg-accent/15 text-accent",
  brown: "bg-brown/15 text-brown",
  brand: "bg-brand/15 text-brand-dark",
};

const barToneClasses: Record<Tone, string> = {
  accent: "bg-accent",
  brown: "bg-brown",
  brand: "bg-brand",
};

const PLAN_TIERS: { backendName: string; tone: Tone }[] = [
  { backendName: "FREE", tone: "brand" },
  { backendName: "PRO_MONTHLY", tone: "accent" },
  { backendName: "PRO_ANNUAL", tone: "brown" },
];

function StatTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: typeof UserIcon;
  tone: Tone;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-subtle">{label}</p>
        <p className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAdminStats()
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(resolveErrorMessage(caught, t));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div>
      <AdminPageHeader title={t(ui.admin.tabOverview)} subtitle={t(ui.admin.overviewSubtitle)} />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="text-brand" />
        </div>
      ) : error || !stats ? (
        <p className="text-sm text-danger">{error}</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile
              label={t(ui.admin.totalUsers)}
              value={stats.totalUsers}
              icon={UserIcon}
              tone="brand"
            />
            <StatTile
              label={t(ui.admin.activeSubscriptions)}
              value={stats.activeSubscriptions}
              icon={ChartIcon}
              tone="accent"
            />
            <StatTile
              label={t(ui.admin.mrr)}
              value={formatPrice(stats.mrr)}
              icon={TrendingIcon}
              tone="brown"
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-heading text-base font-bold text-foreground">
              {t(ui.admin.usersByPlan)}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {PLAN_TIERS.map(({ backendName, tone }) => {
                const count = stats.usersByPlan[backendName] ?? 0;
                const label = t(PLAN_PRESENTATION[configIdFromBackend(backendName)].name);
                const ratio = stats.totalUsers > 0 ? count / stats.totalUsers : 0;
                return (
                  <div key={backendName} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <span className="text-sm font-semibold tabular-nums text-subtle">{count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${barToneClasses[tone]}`}
                        style={{ width: `${Math.max(ratio * 100, count > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
