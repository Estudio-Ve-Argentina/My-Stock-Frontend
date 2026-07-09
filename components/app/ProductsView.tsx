"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  BranchStock,
  ProductResponse,
  StockDistribution,
  StockReason,
} from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useBranches } from "@/hooks/useBranches";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button, LinkButton } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { BranchPickerModal } from "./BranchPickerModal";
import { PlanLimitBanner } from "./PlanLimitBanner";
import { ChevronDownIcon, PlusIcon } from "./icons";

const STOCK_REASONS: { value: StockReason; label: { es: string; en: string } }[] = [
  { value: "VENTA", label: ui.products.reasonSale },
  { value: "MERMA", label: ui.products.reasonWaste },
  { value: "DEVOLUCION", label: ui.products.reasonReturn },
  { value: "AJUSTE_CONTEO", label: ui.products.reasonCount },
];

function stockBadge(product: ProductResponse, branchStock?: BranchStock): string {
  const s = branchStock ? branchStock.stock : product.stock;
  const low = branchStock ? branchStock.lowStock : product.lowStock;
  if (s === 0) return "bg-danger/10 text-danger";
  if (low) return "bg-accent-soft text-accent-foreground";
  return "bg-brand-soft text-brand-dark";
}

type ModalState =
  | { kind: "none" }
  | { kind: "detail"; product: ProductResponse }
  | { kind: "delete"; product: ProductResponse }
  | {
      kind: "edit";
      product: ProductResponse;
      name: string;
      description: string;
      categoryId: number | null;
      supplierId: number | null;
      minStock: string;
      showAdvanced: boolean;
      showNewSupplier: boolean;
      newSupplierName: string;
      newSupplierContact: string;
      distributions: { branchId: number; stock: string; minStock: string }[];
      distributeEnabled: boolean;
    }
  | {
      kind: "stock";
      product: ProductResponse;
      delta: number;
      quantity: string;
      reason: StockReason | "";
      branchId: number | null;
    }
  | {
      kind: "redistribute";
      product: ProductResponse;
      distributions: { branchId: number; stock: string; minStock: string }[];
    };

function RowMenu({
  product,
  onDetail,
  onEdit,
  onPin,
  onRedistribute,
  onDelete,
  showRedistribute,
}: {
  product: ProductResponse;
  onDetail: () => void;
  onEdit: () => void;
  onPin: () => void;
  onRedistribute: () => void;
  onDelete: () => void;
  showRedistribute: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 260;
        setDropUp(rect.bottom + dropdownHeight > window.innerHeight);
      }
      return !prev;
    });
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-muted hover:text-foreground"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <div className={`absolute right-0 z-20 min-w-40 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[0_12px_36px_-8px_rgba(22,163,74,0.18)] ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}`}>
          <button
            type="button"
            onClick={() => { setOpen(false); onDetail(); }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            {t(ui.products.viewDetails)}
          </button>
          {product.active && (
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit(); }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              {t(ui.products.edit)}
            </button>
          )}
          {product.active && showRedistribute && (
            <button
              type="button"
              onClick={() => { setOpen(false); onRedistribute(); }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
                <path d="M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5M21 3l-8.5 8.5M3 21l8.5-8.5" />
              </svg>
              {t(ui.products.redistribute)}
            </button>
          )}
          <button
            type="button"
            onClick={() => { setOpen(false); onPin(); }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={product.pinned ? "text-brand" : "text-subtle"}>
              <path d="M12 17v5M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
              <path d="M5 11h14l-1.5 6H6.5L5 11Z" />
            </svg>
            {product.pinned ? t(ui.products.unpin) : t(ui.products.pin)}
          </button>
          <div className="mx-3 my-1 h-px bg-border/60" />
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete(); }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/8"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
            </svg>
            {t(ui.common.delete)}
          </button>
        </div>
      )}
    </div>
  );
}

function DistributionEditor({
  distributions,
  totalStock,
  branches,
  onChange,
  onPickerOpen,
}: {
  distributions: { branchId: number; stock: string; minStock: string }[];
  totalStock: number;
  branches: { id: number; name: string }[];
  onChange: (d: { branchId: number; stock: string; minStock: string }[]) => void;
  onPickerOpen: () => void;
}) {
  const { t } = useLanguage();

  const distributionSum = distributions.reduce(
    (sum, d) => sum + Math.max(0, Number(d.stock) || 0),
    0,
  );
  const valid = distributionSum === totalStock;
  const exceeds = distributionSum > totalStock;

  return (
    <div className="flex flex-col gap-2">
      {distributions.length > 0 && (
        <div className="flex items-center gap-2 px-3">
          <span className="min-w-0 flex-1" />
          <span className="w-20 text-center text-[11px] font-bold uppercase tracking-wider text-subtle">
            {t(ui.products.stock)}
          </span>
          <span className="w-20 text-center text-[11px] font-bold uppercase tracking-wider text-subtle">
            {t(ui.products.minStockLabel)}
          </span>
          <span className="w-8" />
        </div>
      )}
      {distributions.map((dist, i) => {
        const branch = branches.find((b) => b.id === dist.branchId);
        return (
          <div
            key={dist.branchId}
            className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2"
          >
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {branch?.name}
            </span>
            <input
              type="number"
              min={0}
              value={dist.stock}
              onChange={(e) => {
                const next = [...distributions];
                next[i] = { ...next[i], stock: e.target.value };
                onChange(next);
              }}
              placeholder={t(ui.products.stock)}
              className="w-20 rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm font-medium tabular-nums text-foreground outline-none focus:border-brand"
            />
            <input
              type="number"
              min={0}
              value={dist.minStock}
              onChange={(e) => {
                const next = [...distributions];
                next[i] = { ...next[i], minStock: e.target.value };
                onChange(next);
              }}
              placeholder={t(ui.products.minStockLabel)}
              className="w-20 rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm font-medium tabular-nums text-foreground outline-none focus:border-brand"
              title={t(ui.products.minStockLabel)}
            />
            <button
              type="button"
              onClick={() => onChange(distributions.filter((_, j) => j !== i))}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
            >
              ×
            </button>
          </div>
        );
      })}

      {distributions.length < branches.length && (
        <button
          type="button"
          onClick={onPickerOpen}
          className="flex cursor-pointer items-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          {t(ui.products.addBranch)}
        </button>
      )}

      {distributions.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span
            className={`font-semibold tabular-nums ${
              valid
                ? "text-brand"
                : exceeds
                  ? "text-danger"
                  : "text-subtle"
            }`}
          >
            {distributionSum} / {totalStock}
            {valid && " ✓"}
          </span>
          {exceeds && (
            <span className="font-medium text-danger">
              {t(ui.products.distributionExceeds)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ProductsView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { products, loading, error, reload, changeStock, remove, update, togglePin } =
    useProducts(user?.username);
  const { categories } = useCategories();
  const { suppliers, add: addSupplier } = useSuppliers();
  const { branches } = useBranches();
  const hasMultipleBranches = branches.length > 1;

  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [filterCategoryIds, setFilterCategoryIds] = useState<Set<number>>(() => {
    const v = searchParams.get("categoryId");
    return v ? new Set([Number(v)]) : new Set();
  });
  const [filterBranchIds, setFilterBranchIds] = useState<Set<number>>(() => {
    const v = searchParams.get("branchId");
    return v ? new Set([Number(v)]) : new Set();
  });
  const [filterSupplierIds, setFilterSupplierIds] = useState<Set<number>>(() => {
    const v = searchParams.get("supplierId");
    return v ? new Set([Number(v)]) : new Set();
  });
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [modalError, setModalError] = useState<string | null>(null);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const [creatingSup, setCreatingSup] = useState(false);
  const { show } = useToast();

  const activeCount = products.filter((p) => p.active).length;
  const atLimit =
    user?.maxProducts !== null &&
    user?.maxProducts !== undefined &&
    activeCount >= user.maxProducts;

  const singleBranchId =
    filterBranchIds.size === 1 ? [...filterBranchIds][0] : null;

  function getBranchStock(product: ProductResponse): BranchStock | undefined {
    if (!singleBranchId) return undefined;
    return product.branchStocks?.find((bs) => bs.branchId === singleBranchId);
  }

  const filtered = useMemo(() => {
    let result = products;

    if (filterCategoryIds.size > 0) {
      result = result.filter(
        (p) => p.categoryId !== null && filterCategoryIds.has(p.categoryId),
      );
    }

    if (filterBranchIds.size > 0) {
      result = result.filter((p) =>
        p.branchStocks?.some((bs) => filterBranchIds.has(bs.branchId)),
      );
    }

    if (filterSupplierIds.size > 0) {
      result = result.filter(
        (p) => p.supplierId !== null && filterSupplierIds.has(p.supplierId),
      );
    }

    const term = query.trim().toLowerCase();
    if (term) {
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    return result;
  }, [products, query, filterCategoryIds, filterBranchIds, filterSupplierIds]);

  const confirmDelete = useCallback(async () => {
    if (modal.kind !== "delete") return;
    setModalError(null);
    try {
      await remove(modal.product);
      setModal({ kind: "none" });
    } catch (caught) {
      setModalError(resolveErrorMessage(caught, t));
    }
  }, [modal, remove, t]);

  const confirmEdit = useCallback(async () => {
    if (modal.kind !== "edit" || !modal.product.id) return;
    setModalError(null);

    const dists: StockDistribution[] | undefined =
      modal.distributeEnabled && modal.distributions.length > 0
        ? modal.distributions.map((d) => ({
            branchId: d.branchId,
            stock: Math.max(0, Number(d.stock) || 0),
            minStock: Math.max(0, Number(d.minStock) || 0),
          }))
        : undefined;

    try {
      await update(modal.product, {
        name: modal.name,
        description: modal.description,
        categoryId: modal.categoryId,
        supplierId: modal.supplierId,
        minStock: Math.max(0, Number(modal.minStock) || 0),
        distributions: dists,
      });
      setModal({ kind: "none" });
    } catch (caught) {
      setModalError(resolveErrorMessage(caught, t));
    }
  }, [modal, update, t]);

  const confirmRedistribute = useCallback(async () => {
    if (modal.kind !== "redistribute") return;
    setModalError(null);

    const dists: StockDistribution[] = modal.distributions.map((d) => ({
      branchId: d.branchId,
      stock: Math.max(0, Number(d.stock) || 0),
      minStock: Math.max(0, Number(d.minStock) || 0),
    }));

    try {
      await update(modal.product, {
        name: modal.product.name,
        description: modal.product.description,
        categoryId: modal.product.categoryId,
        supplierId: modal.product.supplierId,
        minStock: modal.product.minStock,
        distributions: dists,
      });
      setModal({ kind: "none" });
    } catch (caught) {
      setModalError(resolveErrorMessage(caught, t));
    }
  }, [modal, update, t]);

  const confirmStock = useCallback(async () => {
    if (modal.kind !== "stock") return;
    const qty = parseInt(modal.quantity, 10);
    if (isNaN(qty) || qty <= 0) return;
    setModalError(null);
    try {
      await changeStock(
        modal.product,
        modal.delta * qty,
        modal.reason || null,
        modal.branchId,
      );
      setModal({ kind: "none" });
    } catch (caught) {
      setModalError(resolveErrorMessage(caught, t));
    }
  }, [modal, changeStock, t]);

  const stepStock = useCallback(
    (direction: 1 | -1) => {
      if (modal.kind !== "stock") return;
      const current = parseInt(modal.quantity, 10) || 0;
      const next = current + direction;
      if (next < 1) return;
      setModal({ ...modal, quantity: String(next) });
    },
    [modal],
  );

  const closeModal = useCallback(() => {
    setModal({ kind: "none" });
    setModalError(null);
  }, []);

  const handleTogglePin = useCallback(async (product: ProductResponse) => {
    try {
      await togglePin(product);
    } catch (caught) {
      show(resolveErrorMessage(caught, t));
    }
  }, [togglePin, t, show]);

  const handleCreateSupplierInEdit = useCallback(async () => {
    if (modal.kind !== "edit") return;
    const trimmedName = modal.newSupplierName.trim();
    const trimmedContact = modal.newSupplierContact.trim();
    if (!trimmedName || !trimmedContact || creatingSup) return;
    setCreatingSup(true);
    try {
      const created = await addSupplier({
        name: trimmedName,
        contact: trimmedContact,
      });
      setModal({
        ...modal,
        supplierId: created.id,
        showNewSupplier: false,
        newSupplierName: "",
        newSupplierContact: "",
      });
    } catch (caught) {
      setModalError(resolveErrorMessage(caught, t));
    } finally {
      setCreatingSup(false);
    }
  }, [modal, addSupplier, creatingSup, t]);

  const openEditModal = useCallback(
    (product: ProductResponse) => {
      const existingDists =
        product.branchStocks?.length > 0
          ? product.branchStocks.map((bs) => ({
              branchId: bs.branchId,
              stock: String(bs.stock),
              minStock: String(bs.minStock),
            }))
          : [];

      setModal({
        kind: "edit",
        product,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        minStock: String(product.minStock ?? 0),
        showAdvanced: false,
        showNewSupplier: false,
        newSupplierName: "",
        newSupplierContact: "",
        distributions: existingDists,
        distributeEnabled: existingDists.length > 0,
      });
    },
    [],
  );

  const openRedistributeModal = useCallback(
    (product: ProductResponse) => {
      const existingDists =
        product.branchStocks?.length > 0
          ? product.branchStocks.map((bs) => ({
              branchId: bs.branchId,
              stock: String(bs.stock),
              minStock: String(bs.minStock),
            }))
          : [];

      setModal({
        kind: "redistribute",
        product,
        distributions: existingDists,
      });
    },
    [],
  );

  const redistributeValid = useMemo(() => {
    if (modal.kind !== "redistribute") return false;
    const sum = modal.distributions.reduce(
      (s, d) => s + Math.max(0, Number(d.stock) || 0),
      0,
    );
    return sum === modal.product.stock;
  }, [modal]);

  const editDistributeValid = useMemo(() => {
    if (modal.kind !== "edit" || !modal.distributeEnabled) return true;
    if (modal.distributions.length === 0) return true;
    const sum = modal.distributions.reduce(
      (s, d) => s + Math.max(0, Number(d.stock) || 0),
      0,
    );
    return sum === modal.product.stock;
  }, [modal]);

  const usedBranchIdsInModal = useMemo(() => {
    if (modal.kind === "edit") {
      return new Set(modal.distributions.map((d) => d.branchId));
    }
    if (modal.kind === "redistribute") {
      return new Set(modal.distributions.map((d) => d.branchId));
    }
    return new Set<number>();
  }, [modal]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.products.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.products.subtitle)}</p>
      </header>

      {atLimit && <PlanLimitBanner />}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {!atLimit && (
          <LinkButton href="/cargar" variant="primary" className="mx-auto w-fit shrink-0 sm:order-5 sm:mx-0">
            <PlusIcon className="h-4 w-4" />
            {t(ui.products.add)}
          </LinkButton>
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(ui.products.search)}
          className="w-full rounded-2xl border border-border bg-surface px-5 py-2.5 text-lg caret-brand text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10 sm:order-1 sm:min-w-0 sm:flex-1 sm:py-2 sm:rounded-xl sm:px-4 sm:text-sm"
        />
        {categories.length > 0 && (
          <div className="flex flex-col gap-1 sm:order-2">
            <span className="text-[11px] font-bold text-subtle">{t(ui.products.categoryLabel)}</span>
            <MultiSelectDropdown
              items={categories}
              selectedIds={filterCategoryIds}
              onChange={setFilterCategoryIds}
              allLabel={t(ui.products.allCategories)}
              selectedLabel={t(ui.nav.categories).toLowerCase()}
            />
          </div>
        )}
        {hasMultipleBranches && (
          <div className="flex flex-col gap-1 sm:order-3">
            <span className="text-[11px] font-bold text-subtle">{t(ui.products.branchLabel)}</span>
            <MultiSelectDropdown
              items={branches}
              selectedIds={filterBranchIds}
              onChange={setFilterBranchIds}
              allLabel={t(ui.products.allBranches)}
              selectedLabel={t(ui.nav.branches).toLowerCase()}
            />
          </div>
        )}
        {suppliers.length > 0 && (
          <div className="flex flex-col gap-1 sm:order-4">
            <span className="text-[11px] font-bold text-subtle">{t(ui.products.supplierLabel)}</span>
            <MultiSelectDropdown
              items={suppliers}
              selectedIds={filterSupplierIds}
              onChange={setFilterSupplierIds}
              allLabel={t(ui.products.allSuppliers)}
              selectedLabel={t(ui.nav.suppliers).toLowerCase()}
            />
          </div>
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
          <div className="rounded-2xl border border-border bg-surface shadow-[0_8px_30px_-8px_rgba(22,163,74,0.12)]">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[57%] md:w-[20%]" />
                <col className="hidden md:table-column md:w-[40%]" />
                <col className="w-[33%] md:w-auto" />
                <col className="w-[10%] md:w-16" />
              </colgroup>
              <thead>
                <tr className="border-b-2 border-border bg-muted/40">
                  <th className="border-r border-border/50 px-4 py-3 text-left font-heading text-base font-semibold uppercase tracking-wider text-subtle md:px-5">
                    {t(ui.products.nameLabel)}
                  </th>
                  <th className="hidden border-r border-border/50 px-5 py-3 text-left font-heading text-base font-semibold uppercase tracking-wider text-subtle md:table-cell">
                    {t(ui.products.descriptionLabel)}
                  </th>
                  <th className="border-r border-border/50 px-3 py-3 text-center font-heading text-base font-semibold uppercase tracking-wider text-subtle md:px-5">
                    {t(ui.products.stock)}
                  </th>
                  <th className="px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, index) => {
                  const bs = getBranchStock(product);
                  const displayStock = bs ? bs.stock : product.stock;
                  const isLow = bs ? bs.lowStock : product.lowStock;

                  return (
                    <tr
                      key={product.id ?? product.name}
                      className={`border-b border-border/50 transition-colors hover:bg-brand-soft/10 ${
                        index % 2 === 1 ? "bg-muted/15" : ""
                      } ${!product.active ? "opacity-50" : ""}`}
                    >
                      <td className="border-r border-border/50 px-4 py-3 md:px-5">
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <div className="flex min-w-0 items-center gap-2">
                            {isLow && product.active && (
                              <span
                                title={t(ui.products.lowStock)}
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent-foreground"
                              >
                                !
                              </span>
                            )}
                            {product.pinned && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-brand">
                                <path d="M12 17v5M9 11V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
                                <path d="M5 11h14l-1.5 6H6.5L5 11Z" />
                              </svg>
                            )}
                            <span
                              title={product.name}
                              className="line-clamp-2 break-words font-heading text-base font-semibold leading-snug text-foreground md:text-lg"
                            >
                              {product.name}
                            </span>
                            {!product.active && (
                              <span className="shrink-0 rounded-full bg-subtle/10 px-2 py-0.5 text-xs font-medium text-subtle">
                                {t(ui.products.frozen)}
                              </span>
                            )}
                          </div>
                          {product.categoryName && (
                            <span className="truncate text-xs font-medium text-subtle">
                              {product.categoryName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="hidden border-r border-border/50 px-5 py-3 md:table-cell">
                        <span className="line-clamp-1 text-base text-subtle">
                          {product.description}
                        </span>
                      </td>
                      <td className="border-r border-border/50 px-2 py-3 md:px-5">
                        {product.active ? (
                          <div className="flex items-center justify-center gap-1.5 md:gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setModal({
                                  kind: "stock",
                                  product,
                                  delta: -1,
                                  quantity: "1",
                                  reason: "",
                                  branchId: singleBranchId,
                                })
                              }
                              disabled={displayStock <= 0}
                              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-muted text-sm font-medium text-foreground transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-40 md:h-9 md:w-9 md:text-base"
                            >
                              −
                            </button>
                            <span
                              className={`flex h-8 min-w-9 items-center justify-center rounded-lg px-2 font-heading text-sm font-bold tabular-nums md:h-9 md:min-w-11 md:px-3 md:text-base ${stockBadge(product, bs)}`}
                            >
                              {displayStock}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setModal({
                                  kind: "stock",
                                  product,
                                  delta: 1,
                                  quantity: "1",
                                  reason: "",
                                  branchId: singleBranchId,
                                })
                              }
                              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-brand text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-dark md:h-9 md:w-9 md:text-base"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="flex items-center justify-center font-heading text-sm font-bold tabular-nums text-subtle md:text-base">
                            {displayStock}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex justify-center">
                          <RowMenu
                            product={product}
                            showRedistribute={hasMultipleBranches}
                            onDetail={() => setModal({ kind: "detail", product })}
                            onEdit={() => openEditModal(product)}
                            onRedistribute={() => openRedistributeModal(product)}
                            onPin={() => handleTogglePin(product)}
                            onDelete={() => setModal({ kind: "delete", product })}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Detail modal */}
      <ConfirmModal
        open={modal.kind === "detail"}
        title={t(ui.products.detailTitle)}
        confirmLabel={t(ui.common.back)}
        onConfirm={closeModal}
        onCancel={closeModal}
      >
        {modal.kind === "detail" && (
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-subtle">
                {t(ui.products.nameLabel)}
              </span>
              <p className="mt-0.5 font-heading text-lg font-semibold text-foreground">
                {modal.product.name}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-subtle">
                {t(ui.products.descriptionLabel)}
              </span>
              <p className="mt-0.5 text-base text-foreground">
                {modal.product.description}
              </p>
            </div>
            {modal.product.categoryName && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-subtle">
                  {t(ui.products.categoryLabel)}
                </span>
                <p className="mt-0.5 text-base text-foreground">
                  {modal.product.categoryName}
                </p>
              </div>
            )}
            {modal.product.supplierName && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-subtle">
                  {t(ui.products.supplierLabel)}
                </span>
                <p className="mt-0.5 text-base text-foreground">
                  {modal.product.supplierName}
                </p>
              </div>
            )}
            <div className="flex gap-6">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-subtle">
                  {t(ui.products.stock)}
                </span>
                <p className="mt-0.5 font-heading text-2xl font-bold text-brand">
                  {modal.product.stock}
                </p>
              </div>
              {(modal.product.minStock ?? 0) > 0 && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-subtle">
                    {t(ui.products.minStockLabel)}
                  </span>
                  <p className="mt-0.5 font-heading text-2xl font-bold text-accent-foreground">
                    {modal.product.minStock}
                  </p>
                </div>
              )}
            </div>
            {modal.product.branchStocks?.length > 0 && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-subtle">
                  {t(ui.products.branchStocks)}
                </span>
                <div className="mt-1.5 flex flex-col gap-1">
                  {modal.product.branchStocks.map((bs) => (
                    <div
                      key={bs.branchId}
                      className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {bs.branchName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-bold tabular-nums text-foreground">
                          {bs.stock}
                        </span>
                        {bs.minStock > 0 && (
                          <span className="text-xs tabular-nums text-subtle">
                            min {bs.minStock}
                          </span>
                        )}
                        {bs.lowStock && (
                          <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
                            {t(ui.products.lowStock)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {modal.product.lowStock && (
              <p className="rounded-lg bg-accent-soft/60 px-3 py-2 text-sm font-semibold text-accent-foreground">
                {t(ui.products.lowStock)}
              </p>
            )}
          </div>
        )}
      </ConfirmModal>

      {/* Delete modal */}
      <ConfirmModal
        open={modal.kind === "delete"}
        title={t(ui.products.deleteConfirm)}
        confirmLabel={t(ui.common.delete)}
        cancelLabel={t(ui.common.cancel)}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={closeModal}
      >
        {modal.kind === "delete" && (
          <div className="flex flex-col gap-2">
            <p className="font-heading text-base font-semibold text-foreground">
              {modal.product.name}
            </p>
            <p className="text-sm text-subtle">
              {t(ui.products.deleteWarning)}
            </p>
            {modalError && <p className="text-sm text-danger">{modalError}</p>}
          </div>
        )}
      </ConfirmModal>

      {/* Edit modal */}
      <ConfirmModal
        open={modal.kind === "edit"}
        title={t(ui.products.editTitle)}
        confirmLabel={t(ui.common.save)}
        cancelLabel={t(ui.common.cancel)}
        onConfirm={confirmEdit}
        onCancel={closeModal}
      >
        {modal.kind === "edit" && (
          <div className="flex flex-col gap-3">
            <TextField
              label={t(ui.products.nameLabel)}
              name="edit-name"
              value={modal.name}
              onChange={(e) =>
                setModal({ ...modal, name: (e.target as HTMLInputElement).value })
              }
            />
            <TextField
              label={t(ui.products.descriptionLabel)}
              name="edit-desc"
              value={modal.description}
              multiline
              onChange={(e) =>
                setModal({
                  ...modal,
                  description: (e.target as HTMLInputElement).value,
                })
              }
            />

            <button
              type="button"
              onClick={() =>
                setModal({ ...modal, showAdvanced: !modal.showAdvanced })
              }
              className="flex cursor-pointer items-center gap-2 self-start rounded-lg px-1 py-1 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${modal.showAdvanced ? "rotate-180" : ""}`}
              />
              {t(ui.products.advancedOptions)}
            </button>

            {modal.showAdvanced && (
              <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    {t(ui.products.categoryLabel)}
                  </span>
                  <select
                    value={modal.categoryId ?? ""}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        categoryId: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="select-field w-full rounded-xl border border-border bg-surface px-4 py-3 text-base font-medium text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                  >
                    <option value="">{t(ui.products.noCategory)}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supplier with inline creation */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">
                    {t(ui.products.supplierLabel)}
                  </span>
                  <div className="flex gap-2">
                    <select
                      value={modal.supplierId ?? ""}
                      onChange={(e) =>
                        setModal({
                          ...modal,
                          supplierId: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="select-field w-full rounded-xl border border-border bg-surface px-4 py-3 text-base font-medium text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                    >
                      <option value="">{t(ui.products.noSupplier)}</option>
                      {suppliers.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setModal({
                          ...modal,
                          showNewSupplier: !modal.showNewSupplier,
                        })
                      }
                      className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-brand transition-colors hover:bg-brand-soft/30"
                      title={t(ui.products.newSupplier)}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {modal.showNewSupplier && (
                    <div className="mt-1 flex flex-col gap-2">
                      <input
                        type="text"
                        value={modal.newSupplierName}
                        onChange={(e) =>
                          setModal({
                            ...modal,
                            newSupplierName: e.target.value,
                          })
                        }
                        placeholder={t(ui.suppliers.namePlaceholder)}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-base text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={modal.newSupplierContact}
                          onChange={(e) =>
                            setModal({
                              ...modal,
                              newSupplierContact: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateSupplierInEdit();
                            }
                          }}
                          placeholder={t(ui.suppliers.contactPlaceholder)}
                          className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-base text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10"
                        />
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={
                            !modal.newSupplierName.trim() ||
                            !modal.newSupplierContact.trim() ||
                            creatingSup
                          }
                          onClick={handleCreateSupplierInEdit}
                        >
                          {creatingSup ? <Spinner /> : t(ui.products.newSupplier)}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <TextField
                  label={t(ui.products.minStockLabel)}
                  name="edit-minStock"
                  type="number"
                  min={0}
                  hint={t(ui.products.minStockHint)}
                  value={modal.minStock}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      minStock: (e.target as HTMLInputElement).value,
                    })
                  }
                />

                {/* Distribution in edit */}
                {hasMultipleBranches && (
                  <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface/50 p-3">
                    <label className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={modal.distributeEnabled}
                        onChange={(e) =>
                          setModal({
                            ...modal,
                            distributeEnabled: e.target.checked,
                            distributions: e.target.checked
                              ? modal.distributions
                              : [],
                          })
                        }
                        className="h-4 w-4 rounded border-border accent-brand"
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {t(ui.products.distributeStock)}
                      </span>
                    </label>

                    {modal.distributeEnabled && (
                      <DistributionEditor
                        distributions={modal.distributions}
                        totalStock={modal.product.stock}
                        branches={branches}
                        onChange={(d) =>
                          setModal({ ...modal, distributions: d })
                        }
                        onPickerOpen={() => setBranchPickerOpen(true)}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
            {modalError && <p className="text-sm text-danger">{modalError}</p>}
          </div>
        )}
      </ConfirmModal>

      {/* Redistribute modal */}
      <ConfirmModal
        open={modal.kind === "redistribute"}
        title={t(ui.products.redistributeTitle)}
        description={modal.kind === "redistribute" ? modal.product.name : ""}
        confirmLabel={t(ui.common.save)}
        cancelLabel={t(ui.common.cancel)}
        onConfirm={confirmRedistribute}
        onCancel={closeModal}
      >
        {modal.kind === "redistribute" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-subtle">
              {t(ui.products.stock)}: <span className="font-bold text-foreground">{modal.product.stock}</span>
            </p>
            <DistributionEditor
              distributions={modal.distributions}
              totalStock={modal.product.stock}
              branches={branches}
              onChange={(d) =>
                setModal({ ...modal, distributions: d })
              }
              onPickerOpen={() => setBranchPickerOpen(true)}
            />
            {modalError && <p className="text-sm text-danger">{modalError}</p>}
          </div>
        )}
      </ConfirmModal>

      {/* Stock adjust modal */}
      <ConfirmModal
        open={modal.kind === "stock"}
        title={
          modal.kind === "stock" && modal.delta > 0
            ? t(ui.products.stockAddTitle)
            : t(ui.products.stockRemoveTitle)
        }
        description={modal.kind === "stock" ? modal.product.name : ""}
        confirmLabel={t(ui.products.stockConfirm)}
        cancelLabel={t(ui.common.cancel)}
        onConfirm={confirmStock}
        onCancel={closeModal}
      >
        {modal.kind === "stock" && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-subtle">
                {t(ui.products.stockQuantity)}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => stepStock(modal.delta > 0 ? -1 : 1)}
                  disabled={modal.delta > 0 && parseInt(modal.quantity, 10) <= 1}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-muted text-lg font-bold text-foreground transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={modal.delta * (parseInt(modal.quantity, 10) || 1)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setModal({ ...modal, quantity: String(Math.max(1, Math.abs(val))) });
                  }}
                  className="w-20 rounded-xl border border-border bg-surface py-2 text-center font-heading text-xl font-bold tabular-nums text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
                <button
                  type="button"
                  onClick={() => stepStock(modal.delta > 0 ? 1 : -1)}
                  disabled={modal.delta < 0 && parseInt(modal.quantity, 10) <= 1}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-foreground transition-colors hover:bg-brand-dark"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-subtle">
                  {t(ui.products.reasonLabel)}
                </span>
                <select
                  value={modal.reason}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      reason: (e.target.value as StockReason) || "",
                    })
                  }
                  className="select-field w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-brand"
                >
                  <option value="">{t(ui.products.noReason)}</option>
                  {STOCK_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {t(r.label)}
                    </option>
                  ))}
                </select>
              </div>

              {hasMultipleBranches && !singleBranchId && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-subtle">
                    {t(ui.products.branchLabel)}
                  </span>
                  <select
                    value={modal.branchId ?? ""}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        branchId: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="select-field w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-brand"
                  >
                    <option value="">—</option>
                    {modal.product.branchStocks?.map((bs) => (
                      <option key={bs.branchId} value={bs.branchId}>
                        {bs.branchName} ({bs.stock})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {singleBranchId && (
                <p className="text-xs text-subtle">
                  {t(ui.products.branchLabel)}: <span className="font-semibold text-foreground">{branches.find((b) => b.id === singleBranchId)?.name}</span>
                </p>
              )}
            </div>
            {modalError && <p className="text-sm text-danger">{modalError}</p>}
          </div>
        )}
      </ConfirmModal>

      {/* Branch picker for edit/redistribute modals */}
      <BranchPickerModal
        open={branchPickerOpen}
        branches={branches}
        disabledIds={usedBranchIdsInModal}
        onSelect={(branch) => {
          if (modal.kind === "edit") {
            setModal({
              ...modal,
              distributions: [
                ...modal.distributions,
                { branchId: branch.id, stock: "0", minStock: "0" },
              ],
            });
          } else if (modal.kind === "redistribute") {
            setModal({
              ...modal,
              distributions: [
                ...modal.distributions,
                { branchId: branch.id, stock: "0", minStock: "0" },
              ],
            });
          }
        }}
        onClose={() => setBranchPickerOpen(false)}
      />
    </div>
  );
}
