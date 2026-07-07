"use client";

import { useMemo } from "react";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useMovements } from "@/hooks/useMovements";
import { Carousel } from "@/components/ui/Carousel";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { StatCard } from "./StatCard";
import { BoxIcon, AlertIcon, TrendingIcon, DownloadIcon } from "./icons";

interface CategoryGroup {
  name: string;
  count: number;
  lowStock: number;
}

interface ProductMovementRank {
  name: string;
  count: number;
}

export function MetricsView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { products, loading } = useProducts(user?.username);
  const { movements } = useMovements(user?.userId);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.active);
    return {
      totalActive: active.length,
      lowStock: active.filter((p) => p.lowStock).length,
    };
  }, [products]);

  const topSelling = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of movements) {
      if (m.type === "decreased") {
        counts[m.productName] = (counts[m.productName] || 0) + m.quantity;
      }
    }
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }, [movements]);

  const topProducts = useMemo((): ProductMovementRank[] => {
    const counts: Record<string, number> = {};
    for (const m of movements) {
      counts[m.productName] = (counts[m.productName] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [movements]);

  const categoryGroups = useMemo((): CategoryGroup[] => {
    const active = products.filter((p) => p.active);
    const groups: Record<string, CategoryGroup> = {};
    for (const p of active) {
      const name = p.categoryName || t(ui.metrics.uncategorized);
      if (!groups[name]) groups[name] = { name, count: 0, lowStock: 0 };
      groups[name].count++;
      if (p.lowStock) groups[name].lowStock++;
    }
    return Object.values(groups).sort((a, b) => b.count - a.count);
  }, [products, t]);

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-brand">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {t(ui.metrics.title)}
          </h1>
          <p className="text-sm text-subtle">{t(ui.metrics.subtitle)}</p>
        </div>
        <Button variant="outline" size="sm" disabled className="w-fit gap-2 opacity-60">
          <DownloadIcon className="h-4 w-4" />
          {t(ui.metrics.exportPdf)}
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
            {t(ui.metrics.comingSoon)}
          </span>
        </Button>
      </header>

      <Carousel cols={4}>
        <StatCard
          label={t(ui.metrics.totalProducts)}
          value={stats.totalActive}
          icon={BoxIcon}
          tone="green"
          index={0}
        />
        <StatCard
          label={t(ui.metrics.inventoryValue)}
          value="—"
          icon={TrendingIcon}
          tone="yellow"
          index={1}
        />
        <StatCard
          label={t(ui.metrics.lowStockCount)}
          value={stats.lowStock}
          icon={AlertIcon}
          tone={stats.lowStock > 0 ? "brown" : "plain"}
          index={2}
        />
        <StatCard
          label={t(ui.metrics.topSelling)}
          value={topSelling || "—"}
          icon={TrendingIcon}
          tone="plain"
          index={3}
        />
      </Carousel>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-[0_8px_30px_-8px_rgba(22,163,74,0.08)]">
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            {t(ui.metrics.topProducts)}
          </h2>
          {topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-subtle">
              {t(ui.metrics.noData)}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {topProducts.map((item, i) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand-dark">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-subtle">
                    {item.count} {t(ui.metrics.movementsLabel)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-[0_8px_30px_-8px_rgba(22,163,74,0.08)]">
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            {t(ui.metrics.byCategory)}
          </h2>
          {categoryGroups.length === 0 ? (
            <p className="py-6 text-center text-sm text-subtle">
              {t(ui.metrics.noData)}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {categoryGroups.map((group) => (
                <li
                  key={group.name}
                  className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {group.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums text-subtle">
                      {group.count}
                    </span>
                    {group.lowStock > 0 && (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                        {group.lowStock} {t(ui.metrics.lowStockCount).toLowerCase()}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="rounded-2xl border border-dashed border-brand/30 bg-brand-tint/30 p-6 text-center">
        <p className="text-sm font-medium text-subtle">
          {t(ui.metrics.needsBackend)}
        </p>
        <p className="mt-1 text-xs text-subtle/70">
          {t(ui.metrics.inventoryValue)} · {t(ui.metrics.topSelling)} · PDF (JasperReports)
        </p>
      </div>
    </div>
  );
}
