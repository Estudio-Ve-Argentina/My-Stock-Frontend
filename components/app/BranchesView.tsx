"use client";

import { useCallback, useState } from "react";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { resolveErrorMessage } from "@/lib/error-utils";
import { useBranches } from "@/hooks/useBranches";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PlusIcon } from "./icons";
import type { BranchResponse } from "@/config/site.types";

type ModalState =
  | { kind: "none" }
  | { kind: "delete"; branch: BranchResponse }
  | { kind: "edit"; branch: BranchResponse; name: string; address: string };

export function BranchesView() {
  const { t } = useLanguage();
  const { branches, loading, error, reload, add, update, remove } =
    useBranches();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="min-w-0">
                <h3 className="truncate font-heading text-lg font-bold text-foreground">
                  {branch.name}
                </h3>
                {branch.address && (
                  <p className="text-sm text-subtle">{branch.address}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setModal({
                      kind: "edit",
                      branch,
                      name: branch.name,
                      address: branch.address ?? "",
                    })
                  }
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-muted hover:text-foreground"
                  title={t(ui.branches.edit)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ kind: "delete", branch })}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                  title={t(ui.common.delete)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
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
                setModal({ ...modal, name: (e.target as HTMLInputElement).value })
              }
            />
            <TextField
              label={t(ui.branches.addressLabel)}
              name="edit-branch-address"
              value={modal.address}
              onChange={(e) =>
                setModal({ ...modal, address: (e.target as HTMLInputElement).value })
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
