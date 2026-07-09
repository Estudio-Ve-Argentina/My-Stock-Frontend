"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BranchResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { resolveErrorMessage } from "@/lib/error-utils";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PlusIcon } from "./icons";

type ModalState =
  | { kind: "none" }
  | { kind: "delete"; branch: BranchResponse }
  | { kind: "edit"; branch: BranchResponse; name: string; address: string };

function ActionMenu({
  onEdit,
  onDelete,
  onViewProducts,
  editLabel,
  deleteLabel,
  viewProductsLabel,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onViewProducts?: () => void;
  editLabel: string;
  deleteLabel: string;
  viewProductsLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropUp(rect.bottom + 140 > window.innerHeight);
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
        <div
          className={`absolute right-0 z-20 min-w-40 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[0_12px_36px_-8px_rgba(22,163,74,0.18)] ${dropUp ? "bottom-full mb-1" : "top-full mt-1"}`}
        >
          {onViewProducts && viewProductsLabel && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onViewProducts();
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15 md:hidden"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {viewProductsLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            {editLabel}
          </button>
          <div className="mx-3 my-1 h-px bg-border/60" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/8"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
            </svg>
            {deleteLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export function BranchesView() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const { branches, loading, error, reload, add, update, remove } =
    useBranches();
  const { products } = useProducts(user?.username);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  const productCountByBranch = useMemo(() => {
    const counts = new Map<number, number>();
    for (const product of products) {
      if (product.branchStocks) {
        for (const bs of product.branchStocks) {
          counts.set(bs.branchId, (counts.get(bs.branchId) ?? 0) + 1);
        }
      }
    }
    return counts;
  }, [products]);

  const resetForm = useCallback(() => {
    setName("");
    setAddress("");
    setShowForm(false);
    setFormError(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    setFormError(null);
    try {
      await add({
        name: name.trim(),
        address: address.trim() || undefined,
      });
      resetForm();
    } catch (caught) {
      setFormError(resolveErrorMessage(caught, t));
    } finally {
      setCreating(false);
    }
  }, [name, address, creating, add, resetForm, t]);

  const confirmDelete = useCallback(async () => {
    if (modal.kind !== "delete") return;
    setModalError(null);
    try {
      await remove(modal.branch.id);
      setModal({ kind: "none" });
    } catch (caught) {
      setModalError(resolveErrorMessage(caught, t));
    }
  }, [modal, remove, t]);

  const confirmEdit = useCallback(async () => {
    if (modal.kind !== "edit" || !modal.name.trim()) return;
    setModalError(null);
    try {
      await update(modal.branch.id, {
        name: modal.name.trim(),
        address: modal.address.trim() || undefined,
      });
      setModal({ kind: "none" });
    } catch (caught) {
      setModalError(resolveErrorMessage(caught, t));
    }
  }, [modal, update, t]);

  const closeModal = useCallback(() => {
    setModal({ kind: "none" });
    setModalError(null);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.branches.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.branches.subtitle)}</p>
      </header>

      <div className="flex flex-col gap-3">
        {showForm ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label={t(ui.branches.nameLabel)}
                name="branch-name"
                required
                placeholder={t(ui.branches.namePlaceholder)}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label={t(ui.branches.addressLabel)}
                name="branch-address"
                placeholder={t(ui.branches.addressPlaceholder)}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm}>
                {t(ui.common.cancel)}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!name.trim() || creating}
                onClick={handleCreate}
              >
                {creating ? <Spinner /> : t(ui.common.save)}
              </Button>
            </div>
            {formError && <p className="text-sm text-danger">{formError}</p>}
          </div>
        ) : (
          <Button
            variant="primary"
            className="w-fit"
            onClick={() => setShowForm(true)}
          >
            <PlusIcon className="h-4 w-4" />
            {t(ui.branches.create)}
          </Button>
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

      {!loading && !error && branches.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-brand-tint/50 py-16 text-center">
          <p className="text-sm text-subtle">{t(ui.branches.empty)}</p>
        </div>
      )}

      {!loading && !error && branches.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface shadow-[0_8px_30px_-8px_rgba(22,163,74,0.12)]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[45%] md:w-[35%]" />
              <col className="hidden md:table-column md:w-[30%]" />
              <col className="w-[35%] md:w-[20%]" />
              <col className="w-[20%] md:w-16" />
            </colgroup>
            <thead>
              <tr className="border-b-2 border-border bg-muted/40">
                <th className="border-r border-border/50 px-4 py-3 text-left font-heading text-base font-semibold uppercase tracking-wider text-subtle md:px-5">
                  {t(ui.branches.nameLabel)}
                </th>
                <th className="hidden border-r border-border/50 px-5 py-3 text-left font-heading text-base font-semibold uppercase tracking-wider text-subtle md:table-cell">
                  {t(ui.branches.addressLabel)}
                </th>
                <th className="border-r border-border/50 px-3 py-3 text-center font-heading text-base font-semibold uppercase tracking-wider text-subtle md:px-5">
                  {t(ui.categories.totalProducts)}
                </th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {branches.map((branch, index) => {
                const count = productCountByBranch.get(branch.id) ?? 0;
                return (
                  <tr
                    key={branch.id}
                    className={`border-b border-border/50 transition-colors hover:bg-brand-soft/10 ${
                      index % 2 === 1 ? "bg-muted/15" : ""
                    }`}
                  >
                    <td className="border-r border-border/50 px-4 py-3 md:px-5">
                      <span className="line-clamp-2 break-words font-heading text-base font-semibold leading-snug text-foreground md:text-lg">
                        {branch.name}
                      </span>
                    </td>
                    <td className="hidden border-r border-border/50 px-5 py-3 md:table-cell">
                      <span className="line-clamp-1 text-sm text-subtle">
                        {branch.address || "—"}
                      </span>
                    </td>
                    <td className="border-r border-border/50 px-3 py-3 md:px-5">
                      <div className="flex items-center justify-center gap-2.5">
                        <span className="inline-flex h-8 min-w-9 items-center justify-center rounded-lg bg-brand-soft px-2 font-heading text-sm font-bold tabular-nums text-brand-dark md:h-9 md:min-w-11 md:px-3 md:text-base">
                          {count}
                        </span>
                        <Link
                          href={`/productos?branchId=${branch.id}`}
                          className="hidden text-xs font-semibold text-brand transition-colors hover:text-brand-dark hover:underline md:inline"
                        >
                          {t(ui.categories.viewProducts)}
                        </Link>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex justify-center">
                        <ActionMenu
                          editLabel={t(ui.branches.edit)}
                          deleteLabel={t(ui.common.delete)}
                          viewProductsLabel={t(ui.categories.viewProducts)}
                          onEdit={() =>
                            setModal({
                              kind: "edit",
                              branch,
                              name: branch.name,
                              address: branch.address ?? "",
                            })
                          }
                          onDelete={() =>
                            setModal({ kind: "delete", branch })
                          }
                          onViewProducts={() =>
                            router.push(`/productos?branchId=${branch.id}`)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={modal.kind === "edit"}
        title={t(ui.branches.edit)}
        confirmLabel={t(ui.common.save)}
        cancelLabel={t(ui.common.cancel)}
        onConfirm={confirmEdit}
        onCancel={closeModal}
      >
        {modal.kind === "edit" && (
          <div className="flex flex-col gap-3">
            <TextField
              label={t(ui.branches.nameLabel)}
              name="edit-branch-name"
              required
              value={modal.name}
              onChange={(e) =>
                setModal({
                  ...modal,
                  name: (e.target as HTMLInputElement).value,
                })
              }
            />
            <TextField
              label={t(ui.branches.addressLabel)}
              name="edit-branch-address"
              value={modal.address}
              onChange={(e) =>
                setModal({
                  ...modal,
                  address: (e.target as HTMLInputElement).value,
                })
              }
            />
            {modalError && <p className="text-sm text-danger">{modalError}</p>}
          </div>
        )}
      </ConfirmModal>

      <ConfirmModal
        open={modal.kind === "delete"}
        title={t(ui.branches.deleteConfirm)}
        confirmLabel={t(ui.common.delete)}
        cancelLabel={t(ui.common.cancel)}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={closeModal}
      >
        {modal.kind === "delete" && (
          <div className="flex flex-col gap-2">
            <p className="font-heading text-base font-semibold text-foreground">
              {modal.branch.name}
            </p>
            <p className="text-sm text-subtle">
              {t(ui.branches.deleteWarning)}
            </p>
            {modalError && <p className="text-sm text-danger">{modalError}</p>}
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
