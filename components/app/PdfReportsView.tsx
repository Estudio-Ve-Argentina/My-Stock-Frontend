"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  BackendMovementType,
  Localized,
  SummarySection,
} from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useBranches } from "@/hooks/useBranches";
import { useCategories } from "@/hooks/useCategories";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useMovements } from "@/hooks/useMovements";
import {
  exportSummaryPdf,
  exportLowStockPdf,
  exportMovementsPdf,
} from "@/lib/api/reports";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button, LinkButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import {
  AlertIcon,
  CalendarIcon,
  ChartIcon,
  ClockIcon,
  DownloadIcon,
} from "./icons";

const SUMMARY_SECTIONS: { value: SummarySection; label: Localized }[] = [
  { value: "KPI", label: ui.pdfReports.sectionKpi },
  { value: "CATEGORY_BREAKDOWN", label: ui.pdfReports.sectionCategoryBreakdown },
  { value: "CRITICAL_STOCK", label: ui.pdfReports.sectionCriticalStock },
  { value: "TOP_MOVERS", label: ui.pdfReports.sectionTopMovers },
  { value: "NO_MOVEMENT", label: ui.pdfReports.sectionNoMovement },
  { value: "NEW_PRODUCTS", label: ui.pdfReports.sectionNewProducts },
  { value: "MOVEMENT_SUMMARY", label: ui.pdfReports.sectionMovementSummary },
];

const MOVEMENT_TYPES: { value: BackendMovementType; label: Localized }[] = [
  { value: "STOCK_UPDATE", label: ui.reports.typeStockUpdate },
  { value: "PRODUCT_CREATED", label: ui.reports.typeCreated },
  { value: "PRODUCT_MODIFIED", label: ui.reports.typeModified },
  { value: "PRODUCT_DELETED", label: ui.reports.typeDeleted },
];

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.max(Math.round((b.getTime() - a.getTime()) / 86_400_000), 1);
}

type ReportId = "summary" | "low-stock" | "movements";

function ReportCard({
  icon: Icon,
  title,
  description,
  children,
  generating,
  generatingLabel,
  generateLabel,
  disabled,
  onGenerate,
  error,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  children?: React.ReactNode;
  generating: boolean;
  generatingLabel: string;
  generateLabel: string;
  disabled: boolean;
  onGenerate: () => void;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-[0_8px_30px_-8px_rgba(22,163,74,0.08)]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-dark">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-subtle">{description}</p>
        </div>
      </div>

      {children}

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          disabled={disabled || generating}
          onClick={onGenerate}
          className="gap-2"
        >
          {generating ? (
            <>
              <Spinner className="h-4 w-4" />
              {generatingLabel}
            </>
          ) : (
            <>
              <DownloadIcon className="h-4 w-4" />
              {generateLabel}
            </>
          )}
        </Button>
        {error && (
          <p className="text-sm font-medium text-danger">{error}</p>
        )}
      </div>
    </div>
  );
}

export function PdfReportsView() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { products } = useProducts(user?.username);
  const { branches } = useBranches();
  const { categories } = useCategories();
  const { suppliers } = useSuppliers();
  const { movements } = useMovements(user?.userId);

  const isFreePlan = user?.planName === "FREE";

  const [generating, setGenerating] = useState<ReportId | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ReportId, string>>>({});

  const today = todayISO();

  const [summaryBranchIds, setSummaryBranchIds] = useState<Set<number>>(
    new Set(),
  );
  const [summarySectionIds, setSummarySectionIds] = useState<Set<number>>(
    new Set(),
  );
  const [summaryDateFrom, setSummaryDateFrom] = useState(today);
  const [summaryDateTo, setSummaryDateTo] = useState(today);

  const [lowStockBranchIds, setLowStockBranchIds] = useState<Set<number>>(
    new Set(),
  );
  const [lowStockCategoryIds, setLowStockCategoryIds] = useState<Set<number>>(
    new Set(),
  );
  const [lowStockSupplierIds, setLowStockSupplierIds] = useState<Set<number>>(
    new Set(),
  );
  const [lowStockOnly, setLowStockOnly] = useState(true);

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [movBranchIds, setMovBranchIds] = useState<Set<number>>(new Set());
  const [movCategoryIds, setMovCategoryIds] = useState<Set<number>>(
    new Set(),
  );
  const [movSupplierIds, setMovSupplierIds] = useState<Set<number>>(
    new Set(),
  );
  const [movTypes, setMovTypes] = useState<Set<BackendMovementType>>(
    new Set(),
  );

  const sectionItems = useMemo(
    () => SUMMARY_SECTIONS.map((s, i) => ({ id: i, name: t(s.label) })),
    [t],
  );

  const lowStockCount = useMemo(() => {
    let filtered = products.filter((p) => p.active);

    if (lowStockOnly) {
      filtered = filtered.filter((p) => p.lowStock || p.stock === 0);
    }

    if (lowStockCategoryIds.size > 0) {
      filtered = filtered.filter(
        (p) => p.categoryId !== null && lowStockCategoryIds.has(p.categoryId),
      );
    }

    if (lowStockSupplierIds.size > 0) {
      filtered = filtered.filter(
        (p) => p.supplierId !== null && lowStockSupplierIds.has(p.supplierId),
      );
    }

    if (lowStockBranchIds.size > 0) {
      filtered = filtered.filter((p) =>
        p.branchStocks.some((bs) => lowStockBranchIds.has(bs.branchId)),
      );
    }

    return filtered.length;
  }, [
    products,
    lowStockOnly,
    lowStockCategoryIds,
    lowStockSupplierIds,
    lowStockBranchIds,
  ]);

  const movementsInRange = useMemo(() => {
    if (!dateFrom || !dateTo) return movements.length;
    return movements.filter((m) => {
      const day = m.at.slice(0, 10);
      return day >= dateFrom && day <= dateTo;
    }).length;
  }, [movements, dateFrom, dateTo]);

  const clearError = useCallback((id: ReportId) => {
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleGenerate = useCallback(
    async (id: ReportId) => {
      if (isFreePlan || generating) return;
      setGenerating(id);
      clearError(id);
      try {
        switch (id) {
          case "summary": {
            const sections =
              summarySectionIds.size > 0
                ? SUMMARY_SECTIONS.filter((_, i) =>
                    summarySectionIds.has(i),
                  ).map((s) => s.value)
                : undefined;
            await exportSummaryPdf({
              branchIds:
                summaryBranchIds.size > 0
                  ? Array.from(summaryBranchIds)
                  : undefined,
              sections,
              periodDays: daysBetween(summaryDateFrom, summaryDateTo),
            });
            break;
          }
          case "low-stock":
            await exportLowStockPdf({
              branchIds:
                lowStockBranchIds.size > 0
                  ? Array.from(lowStockBranchIds)
                  : undefined,
              categoryIds:
                lowStockCategoryIds.size > 0
                  ? Array.from(lowStockCategoryIds)
                  : undefined,
              supplierIds:
                lowStockSupplierIds.size > 0
                  ? Array.from(lowStockSupplierIds)
                  : undefined,
              lowStockOnly,
            });
            break;
          case "movements":
            await exportMovementsPdf({
              dateFrom,
              dateTo,
              branchIds:
                movBranchIds.size > 0
                  ? Array.from(movBranchIds)
                  : undefined,
              categoryId:
                movCategoryIds.size === 1
                  ? [...movCategoryIds][0]
                  : undefined,
              supplierId:
                movSupplierIds.size === 1
                  ? [...movSupplierIds][0]
                  : undefined,
              movementTypes:
                movTypes.size > 0 ? Array.from(movTypes) : undefined,
            });
            break;
        }
      } catch (caught) {
        setErrors((prev) => ({
          ...prev,
          [id]: resolveErrorMessage(caught, t),
        }));
      } finally {
        setGenerating(null);
      }
    },
    [
      isFreePlan,
      generating,
      clearError,
      summaryBranchIds,
      summarySectionIds,
      summaryDateFrom,
      summaryDateTo,
      lowStockBranchIds,
      lowStockCategoryIds,
      lowStockSupplierIds,
      lowStockOnly,
      dateFrom,
      dateTo,
      movBranchIds,
      movCategoryIds,
      movSupplierIds,
      movTypes,
      t,
    ],
  );

  const toggleMovType = useCallback((type: BackendMovementType) => {
    setMovTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const chipClass = (active: boolean) =>
    `cursor-pointer rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
      active
        ? "bg-brand text-brand-foreground shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]"
        : "bg-muted text-subtle hover:bg-border hover:text-foreground"
    }`;

  const dateInputClass =
    "w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm font-medium text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

  const movDatesValid = dateFrom !== "" && dateTo !== "";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.pdfReports.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.pdfReports.subtitle)}</p>
      </header>

      {isFreePlan && (
        <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent-soft/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">
              {t(ui.reports.proOnly)}
            </p>
            <p className="mt-0.5 text-sm text-subtle">
              {t(ui.pdfReports.proRequired)}
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

      <ReportCard
        icon={ChartIcon}
        title={t(ui.pdfReports.summaryTitle)}
        description={t(ui.pdfReports.summaryDescription)}
        generating={generating === "summary"}
        generatingLabel={t(ui.pdfReports.generating)}
        generateLabel={t(ui.pdfReports.generate)}
        disabled={isFreePlan}
        onGenerate={() => handleGenerate("summary")}
        error={errors.summary ?? null}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.history.filterFrom)}
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={summaryDateFrom}
                  onChange={(e) => setSummaryDateFrom(e.target.value)}
                  className={dateInputClass}
                />
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.history.filterTo)}
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={summaryDateTo}
                  onChange={(e) => setSummaryDateTo(e.target.value)}
                  className={dateInputClass}
                />
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              </div>
            </label>
          </div>

          <div className="flex gap-2 sm:flex-wrap sm:gap-3">
            {branches.length > 0 && (
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-initial">
                <span className="text-xs font-semibold text-subtle">
                  {t(ui.nav.branches)}
                </span>
                <MultiSelectDropdown
                  items={branches}
                  selectedIds={summaryBranchIds}
                  onChange={setSummaryBranchIds}
                  allLabel={t(ui.pdfReports.allBranches)}
                  selectedLabel={t(ui.nav.branches).toLowerCase()}
                />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-initial">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.pdfReports.sections)}
              </span>
              <MultiSelectDropdown
                items={sectionItems}
                selectedIds={summarySectionIds}
                onChange={setSummarySectionIds}
                allLabel={t(ui.pdfReports.allSections)}
                selectedLabel={t(ui.pdfReports.sections).toLowerCase()}
              />
            </div>
          </div>
        </div>
      </ReportCard>

      <ReportCard
        icon={AlertIcon}
        title={t(ui.pdfReports.lowStockTitle)}
        description={t(ui.pdfReports.lowStockDescription)}
        generating={generating === "low-stock"}
        generatingLabel={t(ui.pdfReports.generating)}
        generateLabel={t(ui.pdfReports.generate)}
        disabled={isFreePlan}
        onGenerate={() => handleGenerate("low-stock")}
        error={errors["low-stock"] ?? null}
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 sm:flex-wrap sm:gap-3">
            {branches.length > 0 && (
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-initial">
                <span className="text-xs font-semibold text-subtle">
                  {t(ui.nav.branches)}
                </span>
                <MultiSelectDropdown
                  items={branches}
                  selectedIds={lowStockBranchIds}
                  onChange={setLowStockBranchIds}
                  allLabel={t(ui.pdfReports.allBranches)}
                  selectedLabel={t(ui.nav.branches).toLowerCase()}
                />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-initial">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.nav.categories)}
              </span>
              <MultiSelectDropdown
                items={categories}
                selectedIds={lowStockCategoryIds}
                onChange={setLowStockCategoryIds}
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
                selectedIds={lowStockSupplierIds}
                onChange={setLowStockSupplierIds}
                allLabel={t(ui.products.allSuppliers)}
                selectedLabel={t(ui.nav.suppliers).toLowerCase()}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl bg-accent-soft px-3 py-2 text-sm font-semibold tabular-nums text-accent-foreground">
              {lowStockCount} {t(ui.pdfReports.lowStockCount)}
            </span>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={() => setLowStockOnly((prev) => !prev)}
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-brand"
              />
              <span className="text-sm font-medium text-foreground">
                {t(ui.pdfReports.lowStockOnly)}
              </span>
              {!lowStockOnly && (
                <span className="text-xs text-subtle">
                  — {t(ui.pdfReports.allProducts)}
                </span>
              )}
            </label>
          </div>
        </div>
      </ReportCard>

      <ReportCard
        icon={ClockIcon}
        title={t(ui.pdfReports.movementsTitle)}
        description={t(ui.pdfReports.movementsDescription)}
        generating={generating === "movements"}
        generatingLabel={t(ui.pdfReports.generating)}
        generateLabel={t(ui.pdfReports.generate)}
        disabled={isFreePlan || !movDatesValid}
        onGenerate={() => handleGenerate("movements")}
        error={errors.movements ?? null}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.history.filterFrom)}
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className={dateInputClass}
                />
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.history.filterTo)}
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className={dateInputClass}
                />
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              </div>
            </label>
            <span className="col-span-2 rounded-xl bg-muted px-3 py-2.5 text-center text-sm font-semibold tabular-nums text-subtle sm:col-span-1 sm:text-left">
              {movementsInRange}{" "}
              {movementsInRange === 1
                ? locale === "es"
                  ? "movimiento"
                  : "movement"
                : locale === "es"
                  ? "movimientos"
                  : "movements"}
            </span>
          </div>

          <div className="flex gap-2 sm:flex-wrap sm:gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-initial">
              <span className="text-xs font-semibold text-subtle">
                {t(ui.nav.categories)}
              </span>
              <MultiSelectDropdown
                items={categories}
                selectedIds={movCategoryIds}
                onChange={setMovCategoryIds}
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
                selectedIds={movSupplierIds}
                onChange={setMovSupplierIds}
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
                selectedIds={movBranchIds}
                onChange={setMovBranchIds}
                allLabel={t(ui.products.allBranches)}
                selectedLabel={t(ui.nav.branches).toLowerCase()}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-subtle">
              {t(ui.reports.movementType)}
            </span>
            <div className="flex flex-wrap gap-2">
              {MOVEMENT_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleMovType(value)}
                  className={chipClass(movTypes.has(value))}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ReportCard>
    </div>
  );
}
