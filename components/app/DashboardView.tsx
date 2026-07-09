"use client";

import { useMemo } from "react";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useMovements } from "@/hooks/useMovements";
import { isToday } from "@/lib/api/history";
import { Carousel } from "@/components/ui/Carousel";
import { LinkButton } from "@/components/ui/Button";
import { StatCard } from "./StatCard";
import { MovementItem } from "./MovementItem";
import { BoxIcon, ClockIcon, SparkIcon, PlusIcon, PinIcon } from "./icons";

export function DashboardView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { products } = useProducts(user?.username);
  const { movements } = useMovements(user?.userId);

  const stats = useMemo(() => {
    const active = products.filter((product) => product.active);
    const today = movements.filter((movement) => isToday(movement.at));
    const modified = new Set(
      today
        .filter((movement) => movement.type === "increased" || movement.type === "decreased")
        .map((movement) => movement.productName),
    );
    return {
      total: active.length,
      movementsToday: today.length,
      modifiedToday: modified.size,
      outOfStock: active.filter((product) => product.stock === 0).length,
    };
  }, [products, movements]);

  const recent = movements.slice(0, 5);
  const favorites = useMemo(() => products.filter((p) => p.pinned && p.active), [products]);

  return (
    <div className="flex flex-col gap-6">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-2 to-dark p-5 text-dark-foreground ring-1 ring-neon/15 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-neon/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-neon via-brand to-transparent" />
        <div className="relative">
          <p className="text-xs font-medium text-neon">{t(ui.panel.welcome)}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight md:text-3xl">
            <span className="mark-underline text-dark-foreground">{user?.name || user?.username}</span>
          </h1>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <LinkButton href="/cargar" variant="primary" size="sm">
              <PlusIcon className="h-3.5 w-3.5" />
              {t(ui.panel.quickCreate)}
            </LinkButton>
            <LinkButton
              href="/productos"
              variant="soft"
              size="sm"
              className="!bg-white/10 !text-dark-foreground hover:!bg-white/20"
            >
              {t(ui.panel.viewProducts)}
            </LinkButton>
          </div>
        </div>
      </header>

      <Carousel cols={4}>
        <StatCard label={t(ui.panel.totalProducts)} value={stats.total} icon={BoxIcon} tone="green" index={0} />
        <StatCard label={t(ui.panel.movementsToday)} value={stats.movementsToday} icon={ClockIcon} tone="yellow" index={1} />
        <StatCard label={t(ui.panel.modifiedToday)} value={stats.modifiedToday} icon={SparkIcon} tone="brown" index={2} />
        <StatCard label={t(ui.panel.outOfStock)} value={stats.outOfStock} icon={BoxIcon} tone="plain" index={3} />
      </Carousel>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            {t(ui.panel.recent)}
          </h2>
          <LinkButton href="/historial" variant="ghost" size="sm">
            {t(ui.history.title)}
          </LinkButton>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/40 py-8 text-center text-sm text-subtle">
            {t(ui.panel.recentEmpty)}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((movement) => (
              <MovementItem key={movement.id} movement={movement} />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            {t(ui.panel.favorites)}
          </h2>
          <LinkButton href="/productos" variant="ghost" size="sm">
            {t(ui.panel.viewProducts)}
          </LinkButton>
        </div>
        {favorites.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/40 py-8 text-center text-sm text-subtle">
            {t(ui.panel.favoritesEmpty)}
          </p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-heading text-xs font-bold tabular-nums ${product.stock === 0 ? "bg-danger/10 text-danger" : product.lowStock ? "bg-accent-soft text-accent-foreground" : "bg-brand-soft text-brand-dark"}`}>
                  {product.stock}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading text-sm font-semibold text-foreground">
                    {product.name}
                  </h3>
                  {product.categoryName && (
                    <p className="truncate text-xs text-subtle">{product.categoryName}</p>
                  )}
                </div>
                <PinIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
