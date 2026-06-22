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
import { BoxIcon, ClockIcon, SparkIcon, PlusIcon } from "./icons";

export function DashboardView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { products } = useProducts(user?.username);
  const { movements } = useMovements();

  const stats = useMemo(() => {
    const today = movements.filter((movement) => isToday(movement.at));
    const modified = new Set(
      today
        .filter((movement) => movement.type === "increased" || movement.type === "decreased")
        .map((movement) => movement.productName),
    );
    return {
      total: products.length,
      movementsToday: today.length,
      modifiedToday: modified.size,
      outOfStock: products.filter((product) => product.stock === 0).length,
    };
  }, [products, movements]);

  const recent = movements.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-2 to-dark p-6 text-dark-foreground ring-1 ring-neon/15 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-neon/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-neon via-brand to-transparent" />
        <div className="relative">
          <p className="text-sm font-medium text-neon">{t(ui.panel.welcome)}</p>
          <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            <span className="mark-underline text-dark-foreground">{user?.username}</span>
          </h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <LinkButton href="/cargar" variant="primary" size="sm">
              <PlusIcon className="h-4 w-4" />
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

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
            {t(ui.panel.recent)}
          </h2>
          <LinkButton href="/historial" variant="ghost" size="sm">
            {t(ui.history.title)}
          </LinkButton>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-muted/40 py-10 text-center text-sm text-subtle">
            {t(ui.panel.recentEmpty)}
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {recent.map((movement) => (
              <MovementItem key={movement.id} movement={movement} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
