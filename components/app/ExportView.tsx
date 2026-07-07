"use client";

import { useCallback, useMemo, useState } from "react";
import type { ProductResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useBranches } from "@/hooks/useBranches";
import { exportInventoryExcel } from "@/lib/api/reports";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button, LinkButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { DownloadIcon } from "./icons";

function stockBadge(product: ProductResponse): string {
  if (product.stock === 0) return "bg-danger/10 text-danger";
  if (product.lowStock) return "bg-accent-soft text-accent-foreground";
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

export function ExportView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { products, loading, error } = useProducts(user?.username);
  const { categories } = useCategories();
  const { branches } = useBranches();

  const isFreePlan = user?.planName === "FREE";

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<number>>(
    new Set(),
  );
  const [splitByBranch, setSplitByBranch] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const activeProducts = useMemo(
    () => products.filter((p) => p.active),
    [products],
  );

  const filtered = useMemo(() => {
    let result = activeProducts;
    if (filterCategoryId !== null) {
      result = result.filter((p) => p.categoryId === filterCategoryId);
    }
    const term = query.trim().toLowerCase();
    if (term) {
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }
    return result;
  }, [activeProducts, query, filterCategoryId]);

  const validSelectedCount = useMemo(
    () => activeProducts.filter((p) => selectedIds.has(p.id)).length,
    [activeProducts, selectedIds],
  );

  const allVisibleSelected = useMemo(
    () => filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id)),
    [filtered, selectedIds],
  );

  const selectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.add(p.id));
      return next;
    });
  }, [filtered]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleProduct = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleBranch = useCallback((branchId: number) => {
    setSelectedBranchIds((prev) => {
      const next = new Set(prev);
      if (next.has(branchId)) next.delete(branchId);
      else next.add(branchId);
      return next;
    });
  }, []);

  const selectAllBranches = useCallback(() => {
    setSelectedBranchIds(new Set());
  }, []);

  const allBranchesMode = selectedBranchIds.size === 0;
  const hasBranches = branches.length > 0;

  const handleExport = useCallback(async () => {
    if (validSelectedCount === 0 || isFreePlan || exporting) return;
    setExporting(true);
    setExportError(null);
    try {
      await exportInventoryExcel({
        productIds: Array.from(selectedIds),
        branchIds: Array.from(selectedBranchIds),
        splitByBranch: allBranchesMode ? splitByBranch : false,
      });
    } catch (caught) {
      setExportError(resolveErrorMessage(caught, t));
    } finally {
      setExporting(false);
    }
  }, [
    validSelectedCount,
    selectedIds,
    selectedBranchIds,
    allBranchesMode,
    splitByBranch,
    isFreePlan,
    exporting,
    t,
  ]);

  return (
    <div className="flex flex-col gap-8">
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
          <section className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
              {t(ui.nav.products)}
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(ui.products.search)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base caret-brand text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10 sm:max-w-xs"
              />
              {categories.length > 0 && (
                <select
                  value={filterCategoryId ?? ""}
                  onChange={(e) =>
                    setFilterCategoryId(
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="select-field w-full rounded-xl border border-border bg-surface px-4 py-3 text-base font-medium text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10 sm:max-w-52"
                >
                  <option value="">{t(ui.products.allCategories)}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={allVisibleSelected ? deselectAll : selectAllVisible}
                className="cursor-pointer text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
              >
                {allVisibleSelected
                  ? t(ui.reports.deselectAll)
                  : t(ui.reports.selectAll)}
              </button>
              <span className="text-sm tabular-nums text-subtle">
                {validSelectedCount} {t(ui.reports.selected)}
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto rounded-2xl border border-border bg-surface shadow-[0_8px_30px_-8px_rgba(22,163,74,0.08)]">
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-subtle">
                  {t(ui.products.noResults)}
                </p>
              ) : (
                filtered.map((product, index) => {
                  const isSelected = selectedIds.has(product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`flex w-full cursor-pointer items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-brand-soft/10 ${
                        isSelected
                          ? "bg-brand-tint/40"
                          : index % 2 === 1
                            ? "bg-muted/15"
                            : ""
                      }`}
                    >
                      <CheckMark checked={isSelected} />
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        {product.pinned && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0 text-brand"
                          >
                            <path d="M12 17v5M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
                            <path d="M5 11h14l-1.5 6H6.5L5 11Z" />
                          </svg>
                        )}
                        <span className="truncate font-heading text-sm font-semibold text-foreground">
                          {product.name}
                        </span>
                        {product.lowStock && (
                          <span className="shrink-0 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                            {t(ui.products.lowStock)}
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
                })
              )}
            </div>
          </section>

          {hasBranches && (
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
                {t(ui.nav.branches)}
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAllBranches}
                  className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    allBranchesMode
                      ? "bg-brand text-brand-foreground shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]"
                      : "bg-muted text-subtle hover:bg-border hover:text-foreground"
                  }`}
                >
                  {t(ui.reports.allBranches)}
                </button>
                {branches.map((branch) => {
                  const active = selectedBranchIds.has(branch.id);
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => toggleBranch(branch.id)}
                      className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                        active
                          ? "bg-brand text-brand-foreground shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]"
                          : "bg-muted text-subtle hover:bg-border hover:text-foreground"
                      }`}
                    >
                      {branch.name}
                    </button>
                  );
                })}
              </div>
              {allBranchesMode && (
                <button
                  type="button"
                  onClick={() => setSplitByBranch((v) => !v)}
                  className="flex cursor-pointer items-center gap-2.5 self-start"
                >
                  <CheckMark checked={splitByBranch} />
                  <span className="text-sm font-medium text-foreground">
                    {t(ui.reports.splitByBranch)}
                  </span>
                </button>
              )}
            </section>
          )}

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
              disabled={validSelectedCount === 0 || isFreePlan || exporting}
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
