"use client";

import { useState, type FormEvent } from "react";
import type { ProductRequest } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { ChevronDownIcon, PlusIcon } from "./icons";

interface ProductFormProps {
  userId: number;
  onCreate: (input: ProductRequest) => Promise<void>;
  onDone: () => void;
}

export function ProductForm({ userId, onCreate, onDone }: ProductFormProps) {
  const { t } = useLanguage();
  const { categories, add: addCategory } = useCategories();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [minStock, setMinStock] = useState("0");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCreateCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed || creatingCategory) return;
    setCreatingCategory(true);
    try {
      const created = await addCategory({ name: trimmed });
      setCategoryId(created.id);
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch {
      setError(t(ui.common.genericError));
    } finally {
      setCreatingCategory(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        stock: Math.max(0, Number(stock) || 0),
        userId,
        categoryId: categoryId || undefined,
        minStock: Math.max(0, Number(minStock) || 0),
      });
      onDone();
    } catch {
      setError(t(ui.common.genericError));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <TextField
        label={t(ui.products.nameLabel)}
        name="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <TextField
        label={t(ui.products.descriptionLabel)}
        name="description"
        multiline
        required
        minLength={10}
        maxLength={150}
        hint={t(ui.products.descriptionHint)}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <TextField
        label={t(ui.products.stockLabel)}
        name="stock"
        type="number"
        min={0}
        value={stock}
        onChange={(event) => setStock(event.target.value)}
      />

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="flex cursor-pointer items-center gap-2 self-start rounded-lg px-1 py-1 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
      >
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
        />
        {t(ui.products.advancedOptions)}
      </button>

      {showAdvanced && (
        <div className="flex flex-col gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              {t(ui.products.categoryLabel)}
            </span>
            <div className="flex gap-2">
              <select
                value={categoryId ?? ""}
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
              >
                <option value="">{t(ui.products.noCategory)}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategory((v) => !v)}
                className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-brand transition-colors hover:bg-brand-soft/30"
                title={t(ui.products.newCategory)}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>

            {showNewCategory && (
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                  placeholder={t(ui.categories.namePlaceholder)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-base text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!newCategoryName.trim() || creatingCategory}
                  onClick={handleCreateCategory}
                >
                  {creatingCategory ? <Spinner /> : t(ui.products.newCategory)}
                </Button>
              </div>
            )}
          </div>

          <TextField
            label={t(ui.products.minStockLabel)}
            name="minStock"
            type="number"
            min={0}
            hint={t(ui.products.minStockHint)}
            value={minStock}
            onChange={(event) => setMinStock(event.target.value)}
          />
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          {t(ui.common.cancel)}
        </Button>
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <Spinner /> : t(ui.common.save)}
        </Button>
      </div>
    </form>
  );
}
