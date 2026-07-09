"use client";

import { useCallback, useMemo, useState } from "react";
import type { ProductResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useBranches } from "@/hooks/useBranches";
import { useSuppliers } from "@/hooks/useSuppliers";
import { exportInventoryExcel } from "@/lib/api/reports";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button, LinkButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { DownloadIcon } from "./icons";

function stockBadge(p: ProductResponse): string {
  if (p.stock === 0) return "bg-danger/10 text-danger";
  if (p.lowStock) return "bg-accent-soft text-accent-foreground";
  return "bg-brand-soft text-brand-dark";
}

function CheckMark({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
        checked
          ? "border-brand bg-brand text-white"
          : "border-border bg-surface"
      }`}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </span>
  );
}

function ProductRow({
  product,
  selected,
  odd,
  lowStockLabel,
  onToggle,
}: {
  product: ProductResponse;
  selected: boolean;
  odd: boolean;
  lowStockLabel: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full cursor-pointer items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-brand-soft/10 ${
        selected ? "bg-brand-tint/40" : odd ? "bg-muted/15" : ""
      }`}
    >
      <CheckMark checked={selected} />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate font-heading text-sm font-semibold text-foreground">
          {product.name}
        </span>
        {product.lowStock && (
          <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
            {lowStockLabel}
          </span>
        )}
      </div>
      {product.categoryName && (
        <span className="hidden shrink-0 text-xs text-subtle sm:block">
          {product.categoryName}
        </span>
      )}
      <span
        className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums ${stockBadge(product)}`}
      >
        {product.stock}
      </span>
    </button>
  );
}

interface ProductGroup {
  label: string | null;
  subgroups: { label: string | null; products: ProductResponse[] }[];
}

export function ExportView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { products, loading, error } = useProducts(user?.username);
  const { categories } = useCategories();
  const { branches } = useBranches();
  const { suppliers } = useSuppliers();

  const isFreePlan = user?.planName === "FREE";

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const [filterCategoryIds, setFilterCategoryIds] = useState<Set<number>>(
    new Set(),
  );
  const [filterSupplierIds, setFilterSupplierIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<number>>(
    new Set(),
  );
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [separateByCategory, setSeparateByCategory] = useState(false);
  const [separateBySupplier, setSeparateBySupplier] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const activeProducts = useMemo(
    () => products.filter((p) => p.active),
    [products],
  );

  const filtered = useMemo(() => {
    let result = activeProducts;
    if (filterCategoryIds.size > 0)
      result = result.filter(
        (p) => p.categoryId !== null && filterCategoryIds.has(p.categoryId),
      );
    if (filterSupplierIds.size > 0)
      result = result.filter(
        (p) => p.supplierId !== null && filterSupplierIds.has(p.supplierId),
      );
    if (selectedBranchIds.size > 0)
      result = result.filter((p) =>
        p.branchStocks?.some((bs) => selectedBranchIds.has(bs.branchId)),
      );
    if (lowStockOnly) result = result.filter((p) => p.lowStock);
    const term = query.trim().toLowerCase();
    if (term)
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    return result;
  }, [
    activeProducts,
    query,
    filterCategoryIds,
    filterSupplierIds,
    selectedBranchIds,
    lowStockOnly,
  ]);

  const validSelectedCount = useMemo(
    () => activeProducts.filter((p) => selectedIds.has(p.id)).length,
    [activeProducts, selectedIds],
  );

  const allVisibleSelected = useMemo(
    () => filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id)),
    [filtered, selectedIds],
  );

  const grouped = useMemo((): ProductGroup[] | null => {
    if (!separateBySupplier && !separateByCategory) return null;

    const noSup = t(ui.products.noSupplier);
    const noCat = t(ui.products.noCategory);

    if (separateBySupplier && !separateByCategory) {
      const map = new Map<string, ProductResponse[]>();
      for (const p of filtered) {
        const key = p.supplierName ?? noSup;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
      }
      return [...map].map(([label, prods]) => ({
        label,
        subgroups: [{ label: null, products: prods }],
      }));
    }

    if (!separateBySupplier && separateByCategory) {
      const map = new Map<string, ProductResponse[]>();
      for (const p of filtered) {
        const key = p.categoryName ?? noCat;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
      }
      return [
        {
          label: null,
          subgroups: [...map].map(([label, prods]) => ({
            label,
            products: prods,
          })),
        },
      ];
    }

    const outer = new Map<string, Map<string, ProductResponse[]>>();
    for (const p of filtered) {
      const sKey = p.supplierName ?? noSup;
      const cKey = p.categoryName ?? noCat;
      if (!outer.has(sKey)) outer.set(sKey, new Map());
      const inner = outer.get(sKey)!;
      if (!inner.has(cKey)) inner.set(cKey, []);
      inner.get(cKey)!.push(p);
    }
    return [...outer].map(([sLabel, catMap]) => ({
      label: sLabel,
      subgroups: [...catMap].map(([cLabel, prods]) => ({
        label: cLabel,
        products: prods,
      })),
    }));
  }, [filtered, separateBySupplier, separateByCategory, t]);

  const selectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.add(p.id));
      return next;
    });
  }, [filtered]);

  const deselectAll = useCallback(() => setSelectedIds(new Set()), []);

  const toggleProduct = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const canExport = !isFreePlan && !exporting && validSelectedCount > 0;

  const handleExport = useCallback(async () => {
    if (!canExport) return;
    setExporting(true);
    setExportError(null);
    try {
      await exportInventoryExcel({
        productIds: Array.from(selectedIds),
        branchIds:
          selectedBranchIds.size > 0
            ? Array.from(selectedBranchIds)
            : undefined,
        categoryIds: separateByCategory
          ? filterCategoryIds.size > 0
            ? Array.from(filterCategoryIds)
            : categories.map((c) => c.id)
          : undefined,
        supplierIds: separateBySupplier
          ? filterSupplierIds.size > 0
            ? Array.from(filterSupplierIds)
            : suppliers.map((s) => s.id)
          : undefined,
        lowStockOnly: lowStockOnly || undefined,
      });
    } catch (caught) {
      setExportError(resolveErrorMessage(caught, t));
    } finally {
      setExporting(false);
    }
  }, [
    canExport,
    selectedIds,
    selectedBranchIds,
    separateByCategory,
    separateBySupplier,
    filterCategoryIds,
    filterSupplierIds,
    categories,
    suppliers,
    lowStockOnly,
    t,
  ]);

  const lowStockLabel = t(ui.products.lowStock);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.reports.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.reports.subtitle)}</p>
      </header>

      {isFreePlan && (
        <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent-soft/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">
              {t(ui.reports.proOnly)}
            </p>
            <p className="mt-0.5 text-sm text-subtle">
              {t(ui.reports.proOnlyDetail)}
            </p>
          </div>
          <LinkButton
            href="/mi-plan"
            variant="accent"
            size="sm"
            className="shrink-0"
          >
            {t(ui.products.upgrade)}
          </LinkButton>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16 text-brand">
          <Spinner />
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-subtle">{t(ui.common.genericError)}</p>
        </div>
      )}

      {!loading && !error && activeProducts.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-brand-tint/50 py-16 text-center">
          <p className="text-sm text-subtle">{t(ui.reports.noProducts)}</p>
        </div>
      )}

      {!loading && !error && activeProducts.length > 0 && (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(ui.products.search)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base caret-brand text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10 sm:max-w-xs"
          />

          <div className="flex gap-2 sm:flex-wrap sm:gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-initial">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.nav.categories)}
              </span>
              <MultiSelectDropdown
                items={categories}
                selectedIds={filterCategoryIds}
                onChange={setFilterCategoryIds}
                allLabel={t(ui.products.allCategories)}
                selectedLabel={t(ui.nav.categories).toLowerCase()}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-initial">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.nav.suppliers)}
              </span>
              <MultiSelectDropdown
                items={suppliers}
                selectedIds={filterSupplierIds}
                onChange={setFilterSupplierIds}
                allLabel={t(ui.products.allSuppliers)}
                selectedLabel={t(ui.nav.suppliers).toLowerCase()}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-initial">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.nav.branches)}
              </span>
              <MultiSelectDropdown
                items={branches}
                selectedIds={selectedBranchIds}
                onChange={setSelectedBranchIds}
                allLabel={t(ui.products.allBranches)}
                selectedLabel={t(ui.nav.branches).toLowerCase()}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            {categories.length > 0 && (
              <button
                type="button"
                onClick={() => setSeparateByCategory((v) => !v)}
                className="flex cursor-pointer items-center gap-2"
              >
                <CheckMark checked={separateByCategory} />
                <span className="text-sm font-medium text-foreground">
                  {t(ui.reports.separateByCategory)}
                </span>
              </button>
            )}
            {suppliers.length > 0 && (
              <button
                type="button"
                onClick={() => setSeparateBySupplier((v) => !v)}
                className="flex cursor-pointer items-center gap-2"
              >
                <CheckMark checked={separateBySupplier} />
                <span className="text-sm font-medium text-foreground">
                  {t(ui.reports.separateBySupplier)}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setLowStockOnly((v) => !v)}
              className="flex cursor-pointer items-center gap-2"
            >
              <CheckMark checked={lowStockOnly} />
              <span className="text-sm font-medium text-foreground">
                {t(ui.reports.lowStockOnly)}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm tabular-nums text-subtle">
              {validSelectedCount} {t(ui.reports.selected)}
            </span>
            <button
              type="button"
              onClick={allVisibleSelected ? deselectAll : selectAllVisible}
              className="flex cursor-pointer items-center gap-2"
            >
              <span className="text-sm font-semibold text-brand">
                {t(ui.reports.selectAll)}
              </span>
              <CheckMark checked={allVisibleSelected} />
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto rounded-2xl border border-border bg-surface shadow-[0_8px_30px_-8px_rgba(22,163,74,0.08)]">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-subtle">
                {t(ui.products.noResults)}
              </p>
            ) : grouped ? (
              grouped.map((group, gi) => (
                <div key={group.label ?? gi}>
                  {group.label && (
                    <div className="sticky top-0 z-10 border-b border-dark-border bg-dark px-4 py-2 text-xs font-bold uppercase tracking-wider text-dark-foreground">
                      {group.label}
                    </div>
                  )}
                  {group.subgroups.map((sub, si) => (
                    <div key={sub.label ?? si}>
                      {sub.label && (
                        <div className="border-b border-border/60 bg-muted/50 px-4 py-1.5 pl-6 text-[11px] font-bold uppercase tracking-wider text-subtle">
                          {sub.label}
                        </div>
                      )}
                      {sub.products.map((product, pi) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          selected={selectedIds.has(product.id)}
                          odd={pi % 2 === 1}
                          lowStockLabel={lowStockLabel}
                          onToggle={() => toggleProduct(product.id)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              filtered.map((product, index) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  selected={selectedIds.has(product.id)}
                  odd={index % 2 === 1}
                  lowStockLabel={lowStockLabel}
                  onToggle={() => toggleProduct(product.id)}
                />
              ))
            )}
          </div>

          <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {validSelectedCount === 0 && !exportError && (
              <p className="text-sm text-subtle sm:mr-auto">
                {t(ui.reports.noSelection)}
              </p>
            )}
            {exportError && (
              <p className="text-sm font-medium text-danger sm:mr-auto">
                {exportError}
              </p>
            )}
            <Button
              variant="primary"
              size="sm"
              disabled={!canExport}
              onClick={handleExport}
              className="gap-2"
            >
              {exporting ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t(ui.reports.exporting)}
                </>
              ) : (
                <>
                  <DownloadIcon className="h-4 w-4" />
                  {t(ui.reports.exportExcel)}
                </>
              )}
            </Button>
          </footer>
        </>
      )}
    </div>
  );
}
