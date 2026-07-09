"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { SupplierResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { resolveErrorMessage } from "@/lib/error-utils";
import { useAuth } from "@/hooks/useAuth";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PlusIcon } from "./icons";

type ModalState =
  | { kind: "none" }
  | { kind: "delete"; supplier: SupplierResponse }
  | {
      kind: "edit";
      supplier: SupplierResponse;
      name: string;
      contact: string;
      email: string;
      address: string;
    };

function ActionMenu({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: {
  onEdit: () => void;
  onDelete: () => void;
  editLabel: string;
  deleteLabel: string;
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

export function SuppliersView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { suppliers, loading, error, reload, add, update, remove } =
    useSuppliers();
  const { products } = useProducts(user?.username);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  const productCountBySupplier = useMemo(() => {
    const counts = new Map<number, number>();
    for (const product of products) {
      if (product.supplierId !== null && product.supplierId !== undefined) {
        counts.set(
          product.supplierId,
          (counts.get(product.supplierId) ?? 0) + 1,
        );
      }
    }
    return counts;
  }, [products]);

  const resetForm = useCallback(() => {
    setName("");
    setContact("");
    setEmail("");
    setAddress("");
    setShowForm(false);
    setFormError(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !contact.trim() || creating) return;
    setCreating(true);
    setFormError(null);
    try {
      await add({
        name: name.trim(),
        contact: contact.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      resetForm();
    } catch (caught) {
      setFormError(resolveErrorMessage(caught, t));
    } finally {
      setCreating(false);
    }
  }, [name, contact, email, address, creating, add, resetForm, t]);

  const confirmDelete = useCallback(async () => {
    if (modal.kind !== "delete") return;
    setModalError(null);
    try {
      await remove(modal.supplier.id);
      setModal({ kind: "none" });
    } catch (caught) {
      setModalError(resolveErrorMessage(caught, t));
    }
  }, [modal, remove, t]);

  const confirmEdit = useCallback(async () => {
    if (modal.kind !== "edit" || !modal.name.trim() || !modal.contact.trim())
      return;
    setModalError(null);
    try {
      await update(modal.supplier.id, {
        name: modal.name.trim(),
        contact: modal.contact.trim(),
        email: modal.email.trim() || undefined,
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
          {t(ui.suppliers.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.suppliers.subtitle)}</p>
      </header>

      <div className="flex flex-col gap-3">
        {showForm ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label={t(ui.suppliers.nameLabel)}
                name="supplier-name"
                required
                placeholder={t(ui.suppliers.namePlaceholder)}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label={t(ui.suppliers.contactLabel)}
                name="supplier-contact"
                required
                placeholder={t(ui.suppliers.contactPlaceholder)}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
              <TextField
                label={t(ui.suppliers.emailLabel)}
                name="supplier-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label={t(ui.suppliers.addressLabel)}
                name="supplier-address"
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
                disabled={!name.trim() || !contact.trim() || creating}
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
            {t(ui.suppliers.create)}
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

      {!loading && !error && suppliers.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-brand-tint/50 py-16 text-center">
          <p className="text-sm text-subtle">{t(ui.suppliers.empty)}</p>
        </div>
      )}

      {!loading && !error && suppliers.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface shadow-[0_8px_30px_-8px_rgba(22,163,74,0.12)]">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[40%] md:w-[30%]" />
              <col className="w-[35%] md:w-[25%]" />
              <col className="hidden md:table-column md:w-[20%]" />
              <col className="w-[15%] md:w-[15%]" />
              <col className="w-[10%] md:w-16" />
            </colgroup>
            <thead>
              <tr className="border-b-2 border-border bg-muted/40">
                <th className="border-r border-border/50 px-4 py-3 text-left font-heading text-base font-semibold uppercase tracking-wider text-subtle md:px-5">
                  {t(ui.suppliers.nameLabel)}
                </th>
                <th className="border-r border-border/50 px-3 py-3 text-left font-heading text-base font-semibold uppercase tracking-wider text-subtle md:px-5">
                  {t(ui.suppliers.contactLabel)}
                </th>
                <th className="hidden border-r border-border/50 px-5 py-3 text-left font-heading text-base font-semibold uppercase tracking-wider text-subtle md:table-cell">
                  {t(ui.suppliers.emailLabel)}
                </th>
                <th className="border-r border-border/50 px-3 py-3 text-center font-heading text-base font-semibold uppercase tracking-wider text-subtle md:px-5">
                  {t(ui.categories.totalProducts)}
                </th>
                <th className="px-2 py-3" />
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, index) => {
                const count =
                  productCountBySupplier.get(supplier.id) ?? 0;
                return (
                  <tr
                    key={supplier.id}
                    className={`border-b border-border/50 transition-colors hover:bg-brand-soft/10 ${
                      index % 2 === 1 ? "bg-muted/15" : ""
                    }`}
                  >
                    <td className="border-r border-border/50 px-4 py-3 md:px-5">
                      <span className="line-clamp-2 break-words font-heading text-base font-semibold leading-snug text-foreground md:text-lg">
                        {supplier.name}
                      </span>
                    </td>
                    <td className="border-r border-border/50 px-3 py-3 md:px-5">
                      <span className="line-clamp-1 text-sm text-foreground">
                        {supplier.contact}
                      </span>
                    </td>
                    <td className="hidden border-r border-border/50 px-5 py-3 md:table-cell">
                      <span className="line-clamp-1 text-sm text-subtle">
                        {supplier.email || "—"}
                      </span>
                    </td>
                    <td className="border-r border-border/50 px-3 py-3 md:px-5">
                      <div className="flex items-center justify-center gap-2.5">
                        <span className="inline-flex h-8 min-w-9 items-center justify-center rounded-lg bg-brand-soft px-2 font-heading text-sm font-bold tabular-nums text-brand-dark md:h-9 md:min-w-11 md:px-3 md:text-base">
                          {count}
                        </span>
                        <Link
                          href={`/productos?supplierId=${supplier.id}`}
                          className="text-xs font-semibold text-brand transition-colors hover:text-brand-dark hover:underline"
                        >
                          {t(ui.categories.viewProducts)}
                        </Link>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex justify-center">
                        <ActionMenu
                          editLabel={t(ui.suppliers.edit)}
                          deleteLabel={t(ui.common.delete)}
                          onEdit={() =>
                            setModal({
                              kind: "edit",
                              supplier,
                              name: supplier.name,
                              contact: supplier.contact,
                              email: supplier.email ?? "",
                              address: supplier.address ?? "",
                            })
                          }
                          onDelete={() =>
                            setModal({ kind: "delete", supplier })
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
        title={t(ui.suppliers.edit)}
        confirmLabel={t(ui.common.save)}
        cancelLabel={t(ui.common.cancel)}
        onConfirm={confirmEdit}
        onCancel={closeModal}
      >
        {modal.kind === "edit" && (
          <div className="flex flex-col gap-3">
            <TextField
              label={t(ui.suppliers.nameLabel)}
              name="edit-supplier-name"
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
              label={t(ui.suppliers.contactLabel)}
              name="edit-supplier-contact"
              required
              value={modal.contact}
              onChange={(e) =>
                setModal({
                  ...modal,
                  contact: (e.target as HTMLInputElement).value,
                })
              }
            />
            <TextField
              label={t(ui.suppliers.emailLabel)}
              name="edit-supplier-email"
              type="email"
              value={modal.email}
              onChange={(e) =>
                setModal({
                  ...modal,
                  email: (e.target as HTMLInputElement).value,
                })
              }
            />
            <TextField
              label={t(ui.suppliers.addressLabel)}
              name="edit-supplier-address"
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
        title={t(ui.suppliers.deleteConfirm)}
        confirmLabel={t(ui.common.delete)}
        cancelLabel={t(ui.common.cancel)}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={closeModal}
      >
        {modal.kind === "delete" && (
          <div className="flex flex-col gap-2">
            <p className="font-heading text-base font-semibold text-foreground">
              {modal.supplier.name}
            </p>
            <p className="text-sm text-subtle">
              {t(ui.suppliers.deleteWarning)}
            </p>
            {modalError && <p className="text-sm text-danger">{modalError}</p>}
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
