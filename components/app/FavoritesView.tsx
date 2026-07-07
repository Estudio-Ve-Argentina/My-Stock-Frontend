"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { Spinner } from "@/components/ui/Spinner";
import { LinkButton } from "@/components/ui/Button";
import { PinIcon } from "./icons";

function stockBadge(stock: number, lowStock: boolean): string {
  if (stock === 0) return "bg-danger/10 text-danger";
  if (lowStock) return "bg-accent-soft text-accent-foreground";
  return "bg-brand-soft text-brand-dark";
}

export function FavoritesView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { products, loading } = useProducts(user?.username);

  const favorites = useMemo(
    () => products.filter((p) => p.pinned && p.active),
    [products],
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.nav.favorites)}
        </h1>
        <p className="text-sm text-subtle">
          {t(ui.panel.favoritesEmpty)}
        </p>
      </header>

      {loading && (
        <div className="flex justify-center py-16 text-brand">
          <Spinner />
        </div>
      )}

      {!loading && favorites.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-brand-tint/50 py-16 text-center">
          <PinIcon className="h-8 w-8 text-subtle" />
          <p className="text-sm text-subtle">{t(ui.panel.favoritesEmpty)}</p>
          <LinkButton href="/productos" variant="primary" size="sm">
            {t(ui.panel.viewProducts)}
          </LinkButton>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((product) => (
            <Link
              key={product.id}
              href="/productos"
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold tabular-nums ${stockBadge(product.stock, product.lowStock)}`}
              >
                {product.stock}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-heading text-sm font-semibold text-foreground">
                  {product.name}
                </h3>
                {product.categoryName && (
                  <p className="truncate text-xs text-subtle">
                    {product.categoryName}
                  </p>
                )}
              </div>
              <PinIcon className="h-4 w-4 shrink-0 text-brand" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
