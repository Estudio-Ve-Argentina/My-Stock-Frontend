"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  BackendMovementType,
  Localized,
  Movement,
  MovementType,
} from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useMovements } from "@/hooks/useMovements";
import { useBranches } from "@/hooks/useBranches";
import { useCategories } from "@/hooks/useCategories";
import { useSuppliers } from "@/hooks/useSuppliers";
import { exportMovementsExcel } from "@/lib/api/reports";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button, LinkButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { CalendarIcon, DownloadIcon } from "./icons";

const MOVEMENT_TYPES: { value: BackendMovementType; label: Localized }[] = [
  { value: "STOCK_UPDATE", label: ui.reports.typeStockUpdate },
  { value: "PRODUCT_CREATED", label: ui.reports.typeCreated },
  { value: "PRODUCT_MODIFIED", label: ui.reports.typeModified },
  { value: "PRODUCT_DELETED", label: ui.reports.typeDeleted },
];

const BACKEND_TO_FRONTEND: Record<BackendMovementType, MovementType[]> = {
  STOCK_UPDATE: ["increased", "decreased"],
  PRODUCT_CREATED: ["created"],
  PRODUCT_MODIFIED: ["modified"],
  PRODUCT_DELETED: ["deleted"],
};

const typeMeta: Record<
  MovementType,
  { label: Localized; chip: string; sign: string }
> = {
  created: {
    label: ui.history.created,
    chip: "bg-brown-soft text-brown",
    sign: "",
  },
  increased: {
    label: ui.history.increased,
    chip: "bg-brand-soft text-brand-dark",
    sign: "+",
  },
  decreased: {
    label: ui.history.decreased,
    chip: "bg-accent-soft text-accent-foreground",
    sign: "−",
  },
  modified: {
    label: ui.history.modified,
    chip: "bg-brown-soft text-brown",
    sign: "",
  },
  deleted: {
    label: ui.history.deleted,
    chip: "bg-danger/10 text-danger",
    sign: "",
  },
};

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function dateLabel(key: string, locale: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (key === todayKey) return locale === "es" ? "Hoy" : "Today";
  if (key === yesterdayKey) return locale === "es" ? "Ayer" : "Yesterday";

  return new Date(key + "T12:00:00").toLocaleDateString(
    locale === "es" ? "es-AR" : "en-US",
    { weekday: "long", day: "numeric", month: "long" },
  );
}

function timeLabel(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "es" ? "es-AR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MovementRow({
  movement,
  odd,
  locale,
  t,
}: {
  movement: Movement;
  odd: boolean;
  locale: string;
  t: (l: Localized) => string;
}) {
  const meta = typeMeta[movement.type];
  return (
    <div
      className={`flex items-center gap-3 border-b border-border/50 px-4 py-3 last:border-b-0 ${
        odd ? "bg-muted/15" : ""
      }`}
    >
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.chip}`}
      >
        {t(meta.label)}
      </span>
      <span className="min-w-0 flex-1 truncate font-heading text-sm font-semibold text-foreground">
        {movement.productName}
      </span>
      {movement.branchName && (
        <span className="hidden shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-subtle sm:block">
          {movement.branchName}
        </span>
      )}
      {meta.sign && movement.quantity > 0 && (
        <span className="shrink-0 font-heading text-sm font-bold tabular-nums text-foreground">
          {meta.sign}
          {movement.quantity}
        </span>
      )}
      <span className="shrink-0 text-xs tabular-nums text-subtle">
        {timeLabel(movement.at, locale)}
      </span>
    </div>
  );
}

export function ExportMovementsView() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { movements, loading, error } = useMovements(user?.userId);
  const { branches } = useBranches();
  const { categories } = useCategories();
  const { suppliers } = useSuppliers();

  const isFreePlan = user?.planName === "FREE";

  const today = todayISO();
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [selectedBranchIds, setSelectedBranchIds] = useState<Set<number>>(
    new Set(),
  );
  const [filterCategoryIds, setFilterCategoryIds] = useState<Set<number>>(
    new Set(),
  );
  const [filterSupplierIds, setFilterSupplierIds] = useState<Set<number>>(
    new Set(),
  );
  const [selectedTypes, setSelectedTypes] = useState<
    Set<BackendMovementType>
  >(new Set());
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const selectedBranchNames = useMemo(() => {
    if (selectedBranchIds.size === 0) return null;
    return new Set(
      branches
        .filter((b) => selectedBranchIds.has(b.id))
        .map((b) => b.name),
    );
  }, [selectedBranchIds, branches]);

  const allowedFrontendTypes = useMemo(() => {
    if (selectedTypes.size === 0) return null;
    const set = new Set<MovementType>();
    for (const bt of selectedTypes) {
      for (const ft of BACKEND_TO_FRONTEND[bt]) set.add(ft);
    }
    return set;
  }, [selectedTypes]);

  const filtered = useMemo(() => {
    let result = movements;

    if (dateFrom || dateTo) {
      result = result.filter((m) => {
        const day = dateKey(m.at);
        if (dateFrom && day < dateFrom) return false;
        if (dateTo && day > dateTo) return false;
        return true;
      });
    }

    if (selectedBranchNames) {
      result = result.filter(
        (m) => m.branchName !== null && selectedBranchNames.has(m.branchName),
      );
    }

    if (allowedFrontendTypes) {
      result = result.filter((m) => allowedFrontendTypes.has(m.type));
    }

    return result;
  }, [movements, dateFrom, dateTo, selectedBranchNames, allowedFrontendTypes]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Movement[]>();
    for (const m of filtered) {
      const key = dateKey(m.at);
      const group = groups.get(key);
      if (group) group.push(m);
      else groups.set(key, [m]);
    }
    return groups;
  }, [filtered]);

  const canExport =
    !isFreePlan && !exporting && dateFrom !== "" && dateTo !== "";

  const toggleType = useCallback((type: BackendMovementType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleExport = useCallback(async () => {
    if (!canExport) return;
    setExporting(true);
    setExportError(null);
    try {
      await exportMovementsExcel({
        dateFrom,
        dateTo,
        branchIds:
          selectedBranchIds.size > 0
            ? Array.from(selectedBranchIds)
            : undefined,
        categoryId:
          filterCategoryIds.size === 1
            ? [...filterCategoryIds][0]
            : undefined,
        supplierId:
          filterSupplierIds.size === 1
            ? [...filterSupplierIds][0]
            : undefined,
        movementTypes:
          selectedTypes.size > 0 ? Array.from(selectedTypes) : undefined,
      });
    } catch (caught) {
      setExportError(resolveErrorMessage(caught, t));
    } finally {
      setExporting(false);
    }
  }, [
    canExport,
    dateFrom,
    dateTo,
    selectedBranchIds,
    filterCategoryIds,
    filterSupplierIds,
    selectedTypes,
    t,
  ]);

  const chipClass = (active: boolean) =>
    `cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
      active
        ? "bg-brand text-brand-foreground shadow-[0_4px_12px_-2px_rgba(22,163,74,0.3)]"
        : "bg-muted text-subtle hover:bg-border hover:text-foreground"
    }`;

  const dateInputClass =
    "w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm font-medium text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.reports.movementsTitle)}
        </h1>
        <p className="text-sm text-subtle">
          {t(ui.reports.movementsSubtitle)}
        </p>
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
      </div>

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

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-subtle">
          {t(ui.reports.movementType)}
        </span>
        <div className="flex flex-wrap gap-2">
          {MOVEMENT_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleType(value)}
              className={chipClass(selectedTypes.has(value))}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>

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

      {!loading && !error && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm tabular-nums text-subtle">
              {filtered.length}{" "}
              {filtered.length === 1
                ? (locale === "es" ? "movimiento" : "movement")
                : (locale === "es" ? "movimientos" : "movements")}
            </span>
          </div>

          <div className="max-h-[28rem] overflow-y-auto rounded-2xl border border-border bg-surface shadow-[0_8px_30px_-8px_rgba(22,163,74,0.08)]">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-subtle">
                {t(ui.history.empty)}
              </p>
            ) : (
              [...grouped.entries()].map(([key, items]) => (
                <div key={key}>
                  <div className="sticky top-0 z-10 border-b border-dark-border bg-dark px-4 py-2 text-xs font-bold capitalize tracking-wider text-dark-foreground">
                    {dateLabel(key, locale)}
                  </div>
                  {items.map((movement, i) => (
                    <MovementRow
                      key={movement.id}
                      movement={movement}
                      odd={i % 2 === 1}
                      locale={locale}
                      t={t}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}

      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
    </div>
  );
}
