"use client";

import { useCallback, useMemo, useState } from "react";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PlusIcon } from "./icons";

type ModalState =
  | { kind: "none" }
  | { kind: "delete"; id: number; name: string }
  | { kind: "rename"; id: number; name: string };

export function CategoriesView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { categories, loading, error, reload, add, rename, remove } =
    useCategories();
  const { products } = useProducts(user?.username);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [modal, setModal] = useState<ModalState>({ kind: "none" });

  const productCountByCategory = useMemo(() => {
    const counts = new Map<number, number>();
    for (const product of products) {
      if (product.categoryId !== null && product.categoryId !== undefined) {
        counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
      }
    }
    return counts;
  }, [products]);

  const handleCreate = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed || creating) return;
    setCreating(true);
    try {
      await add({ name: trimmed });
      setNewName("");
      setShowCreateInput(false);
    } catch {
      // error handled in hook
    } finally {
      setCreating(false);
    }
  }, [newName, creating, add]);

  const confirmDelete = useCallback(async () => {
    if (modal.kind !== "delete") return;
    await remove(modal.id);
    setModal({ kind: "none" });
  }, [modal, remove]);

  const confirmRename = useCallback(async () => {
    if (modal.kind !== "rename" || !modal.name.trim()) return;
    await rename(modal.id, { name: modal.name.trim() });
    setModal({ kind: "none" });
  }, [modal, rename]);

  const closeModal = useCallback(() => setModal({ kind: "none" }), []);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.categories.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.categories.subtitle)}</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {showCreateInput ? (
          <div className="flex w-full gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setShowCreateInput(false);
                  setNewName("");
                }
              }}
              placeholder={t(ui.categories.namePlaceholder)}
              autoFocus
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10"
            />
            <Button
              variant="primary"
              disabled={!newName.trim() || creating}
              onClick={handleCreate}
            >
              {creating ? <Spinner /> : t(ui.common.save)}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateInput(false);
                setNewName("");
              }}
            >
              {t(ui.common.cancel)}
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={() => setShowCreateInput(true)}
          >
            <PlusIcon className="h-4 w-4" />
            {t(ui.categories.create)}
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

      {!loading && !error && categories.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-brand-tint/50 py-16 text-center">
          <p className="text-sm text-subtle">{t(ui.categories.empty)}</p>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const count = productCountByCategory.get(category.id) ?? 0;
            return (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-lg font-bold text-foreground">
                    {category.name}
                  </h3>
                  <p className="text-sm text-subtle">
                    {count}{" "}
                    {count === 1
                      ? t(ui.categories.productCount)
                      : t(ui.categories.productsCount)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        kind: "rename",
                        id: category.id,
                        name: category.name,
                      })
                    }
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-muted hover:text-foreground"
                    title={t(ui.categories.rename)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        kind: "delete",
                        id: category.id,
                        name: category.name,
                      })
                    }
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                    title={t(ui.common.delete)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rename modal */}
      <ConfirmModal
        open={modal.kind === "rename"}
        title={t(ui.categories.rename)}
        confirmLabel={t(ui.common.save)}
        cancelLabel={t(ui.common.cancel)}
        onConfirm={confirmRename}
        onCancel={closeModal}
      >
        {modal.kind === "rename" && (
          <input
            type="text"
            value={modal.name}
            onChange={(e) => setModal({ ...modal, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmRename();
            }}
            autoFocus
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        )}
      </ConfirmModal>

      {/* Delete modal */}
      <ConfirmModal
        open={modal.kind === "delete"}
        title={t(ui.categories.deleteConfirm)}
        description={modal.kind === "delete" ? modal.name : ""}
        confirmLabel={t(ui.common.delete)}
        cancelLabel={t(ui.common.cancel)}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={closeModal}
      />
    </div>
  );
}
