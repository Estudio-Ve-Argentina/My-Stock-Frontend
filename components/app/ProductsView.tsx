"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ProductResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button, LinkButton } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PlanLimitBanner } from "./PlanLimitBanner";
import { ChevronDownIcon, PlusIcon } from "./icons";

function stockBadge(product: ProductResponse): string {
  if (product.stock === 0) return "bg-danger/10 text-danger";
  if (product.lowStock) return "bg-accent-soft text-accent-foreground";
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
      minStock: string;
      showAdvanced: boolean;
    }
  | { kind: "stock"; product: ProductResponse; delta: number; quantity: string };

function RowMenu({
  product,
  onDetail,
  onEdit,
  onDelete,
}: {
  product: ProductResponse;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-muted hover:text-foreground"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-40 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[0_12px_36px_-8px_rgba(22,163,74,0.18)]">
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

export function ProductsView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { products, loading, error, reload, changeStock, remove, update } =
    useProducts(user?.username);
  const { categories } = useCategories();

  const [query, setQuery] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  const activeCount = products.filter((p) => p.active).length;
  const atLimit =
    user?.maxProducts !== null &&
    user?.maxProducts !== undefined &&
    activeCount >= user.maxProducts;

  const filtered = useMemo(() => {
    let result = products;

    if (filterCategoryId !== null) {
      result = result.filter((p) => p.categoryId === filterCategoryId);
    }

    const term = query.trim().toLowerCase();
    if (term) {
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    return result;
  }, [products, query, filterCategoryId]);

  const confirmDelete = useCallback(async () => {
    if (modal.kind !== "delete") return;
    await remove(modal.product);
    setModal({ kind: "none" });
  }, [modal, remove]);

  const confirmEdit = useCallback(async () => {
    if (modal.kind !== "edit" || !modal.product.id) return;
    await update(modal.product, {
      name: modal.name,
      description: modal.description,
      categoryId: modal.categoryId,
      minStock: Math.max(0, Number(modal.minStock) || 0),
    });
    setModal({ kind: "none" });
  }, [modal, update]);

  const confirmStock = useCallback(async () => {
    if (modal.kind !== "stock") return;
    const qty = parseInt(modal.quantity, 10);
    if (isNaN(qty) || qty <= 0) return;
    await changeStock(modal.product, modal.delta * qty);
    setModal({ kind: "none" });
  }, [modal, changeStock]);

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

  const closeModal = useCallback(() => setModal({ kind: "none" }), []);

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
        {!atLimit && (
          <LinkButton href="/cargar" variant="primary" className="mx-auto w-fit shrink-0 sm:order-3 sm:mx-0">
            <PlusIcon className="h-4 w-4" />
            {t(ui.products.add)}
          </LinkButton>
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(ui.products.search)}
          className="w-full rounded-2xl border border-border bg-surface px-5 py-2.5 text-lg caret-brand text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10 sm:order-1 sm:py-2.5 sm:rounded-xl sm:px-4 sm:text-base"
        />
        {categories.length > 0 && (
          <select
            value={filterCategoryId ?? ""}
            onChange={(e) =>
              setFilterCategoryId(e.target.value ? Number(e.target.value) : null)
            }
            className="select-field w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base font-medium text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10 sm:order-2 sm:max-w-52 sm:rounded-xl"
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
                {filtered.map((product, index) => (
                  <tr
                    key={product.id ?? product.name}
                    className={`border-b border-border/50 transition-colors hover:bg-brand-soft/10 ${
                      index % 2 === 1 ? "bg-muted/15" : ""
                    } ${!product.active ? "opacity-50" : ""} ${
                      product.lowStock && product.active
                        ? "border-l-[3px] border-l-accent"
                        : ""
                    }`}
                  >
                    <td className="border-r border-border/50 px-4 py-3 md:px-5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="break-words font-heading text-base font-semibold leading-snug text-foreground md:text-lg">
                            {product.name}
                          </span>
                          {!product.active && (
                            <span className="shrink-0 rounded-full bg-subtle/10 px-2 py-0.5 text-xs font-medium text-subtle">
                              {t(ui.products.frozen)}
                            </span>
                          )}
                          {product.lowStock && product.active && (
                            <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-foreground">
                              {t(ui.products.lowStock)}
                            </span>
                          )}
                        </div>
                        {product.categoryName && (
                          <span className="text-xs font-medium text-subtle">
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
                              setModal({ kind: "stock", product, delta: -1, quantity: "1" })
                            }
                            disabled={product.stock <= 0}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-muted text-sm font-medium text-foreground transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-40 md:h-9 md:w-9 md:text-base"
                          >
                            −
                          </button>
                          <span
                            className={`flex h-8 min-w-9 items-center justify-center rounded-lg px-2 font-heading text-sm font-bold tabular-nums md:h-9 md:min-w-11 md:px-3 md:text-base ${stockBadge(product)}`}
                          >
                            {product.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setModal({ kind: "stock", product, delta: 1, quantity: "1" })
                            }
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-brand text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-dark md:h-9 md:w-9 md:text-base"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center font-heading text-sm font-bold tabular-nums text-subtle md:text-base">
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex justify-center">
                        <RowMenu
                          product={product}
                          onDetail={() => setModal({ kind: "detail", product })}
                          onEdit={() =>
                            setModal({
                              kind: "edit",
                              product,
                              name: product.name,
                              description: product.description,
                              categoryId: product.categoryId,
                              minStock: String(product.minStock ?? 0),
                              showAdvanced: false,
                            })
                          }
                          onDelete={() => setModal({ kind: "delete", product })}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
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
        description={modal.kind === "delete" ? modal.product.name : ""}
        confirmLabel={t(ui.common.delete)}
        cancelLabel={t(ui.common.cancel)}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={closeModal}
      />

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
              </div>
            )}
          </div>
        )}
      </ConfirmModal>

      {/* Stock adjust modal */}
      <ConfirmModal
        open={modal.kind === "stock"}
        title={t(ui.products.stockTitle)}
        description={modal.kind === "stock" ? modal.product.name : ""}
        confirmLabel={
          modal.kind === "stock" && modal.delta > 0
            ? t(ui.products.stockAdd)
            : t(ui.products.stockRemove)
        }
        cancelLabel={t(ui.common.cancel)}
        onConfirm={confirmStock}
        onCancel={closeModal}
      >
        {modal.kind === "stock" && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-subtle">
              {t(ui.products.stockQuantity)}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => stepStock(-1)}
                disabled={parseInt(modal.quantity, 10) <= 1}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-muted text-lg font-bold text-foreground transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={modal.quantity}
                onChange={(e) =>
                  setModal({ ...modal, quantity: e.target.value })
                }
                className="w-20 rounded-xl border border-border bg-surface px-2 py-2 text-center font-heading text-2xl font-bold tabular-nums text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
              />
              <button
                type="button"
                onClick={() => stepStock(1)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-foreground transition-colors hover:bg-brand-dark"
              >
                +
              </button>
            </div>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
