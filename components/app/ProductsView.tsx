"use client";

import { useMemo, useState } from "react";
import type { ProductResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { planById } from "@/config/app.config";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { Button, LinkButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Carousel } from "@/components/ui/Carousel";
import { ProductCard } from "./ProductCard";
import { PlanLimitBanner } from "./PlanLimitBanner";
import { PlusIcon } from "./icons";

export function ProductsView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { products, loading, error, reload, changeStock, remove } = useProducts(
    user?.username,
  );

  const [query, setQuery] = useState("");

  const plan = planById(user?.plan ?? "free");
  const atLimit = plan.productLimit !== null && products.length >= plan.productLimit;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return products;
    }
    return products.filter((product) => product.name.toLowerCase().includes(term));
  }, [products, query]);

  function onDelete(product: ProductResponse) {
    if (window.confirm(t(ui.products.deleteConfirm))) {
      remove(product);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.products.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.products.subtitle)}</p>
      </header>

      {atLimit && <PlanLimitBanner />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(ui.products.search)}
          className="h-11 flex-1 rounded-xl border border-border bg-surface px-4 text-base text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        {!atLimit && (
          <LinkButton href="/cargar" variant="primary" className="shrink-0">
            <PlusIcon className="h-4 w-4" />
            {t(ui.products.add)}
          </LinkButton>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16 text-brand">
          <Spinner />
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-subtle">{t(ui.common.genericError)}</p>
          <Button variant="outline" size="sm" onClick={reload}>
            {t(ui.common.retry)}
          </Button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-brand-tint/50 py-16 text-center">
          <p className="text-sm text-subtle">{t(ui.products.empty)}</p>
          <LinkButton href="/cargar" variant="primary" size="sm">
            {t(ui.products.emptyCta)}
          </LinkButton>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-subtle">
            {t(ui.products.noResults)}
          </p>
        ) : (
          <Carousel cols={3}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id ?? product.name}
                product={product}
                onStock={changeStock}
                onDelete={onDelete}
              />
            ))}
          </Carousel>
        )
      )}
    </div>
  );
}
