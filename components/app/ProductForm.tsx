"use client";

import { useState, type FormEvent } from "react";
import type { ProductRequest, StockDistribution } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useCategories } from "@/hooks/useCategories";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useBranches } from "@/hooks/useBranches";
import { ApiError } from "@/lib/api/client";
import { resolveErrorMessage } from "@/lib/error-utils";
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
  const { suppliers } = useSuppliers();
  const { branches } = useBranches();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [minStock, setMinStock] = useState("0");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [distributeEnabled, setDistributeEnabled] = useState(false);
  const [distributions, setDistributions] = useState<
    { branchId: number; stock: string; minStock: string }[]
  >([]);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const hasMultipleBranches = branches.length > 1;
  const totalStock = Math.max(0, Number(stock) || 0);

  const distributionSum = distributions.reduce(
    (sum, d) => sum + Math.max(0, Number(d.stock) || 0),
    0,
  );
  const distributionValid =
    !distributeEnabled || distributionSum === totalStock;

  function addDistributionRow() {
    const usedIds = new Set(distributions.map((d) => d.branchId));
    const available = branches.find((b) => !usedIds.has(b.id));
    if (!available) return;
    setDistributions([
      ...distributions,
      { branchId: available.id, stock: "0", minStock: "0" },
    ]);
  }

  function removeDistributionRow(index: number) {
    setDistributions(distributions.filter((_, i) => i !== index));
  }

  function updateDistribution(
    index: number,
    field: "branchId" | "stock" | "minStock",
    value: string | number,
  ) {
    setDistributions(
      distributions.map((d, i) =>
        i === index ? { ...d, [field]: value } : d,
      ),
    );
  }

  async function handleCreateCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed || creatingCategory) return;
    setCreatingCategory(true);
    try {
      const created = await addCategory({ name: trimmed });
      setCategoryId(created.id);
      setNewCategoryName("");
      setShowNewCategory(false);
    } catch (caught) {
      setError(resolveErrorMessage(caught, t));
    } finally {
      setCreatingCategory(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (distributeEnabled && !distributionValid) {
      setError(t(ui.products.distributionSum));
      return;
    }

    setPending(true);
    try {
      const input: ProductRequest = {
        name: name.trim(),
        description: description.trim(),
        stock: totalStock,
        userId,
        categoryId: categoryId || undefined,
        supplierId: supplierId || undefined,
        minStock: Math.max(0, Number(minStock) || 0),
      };

      if (distributeEnabled && distributions.length > 0) {
        input.distributions = distributions.map(
          (d): StockDistribution => ({
            branchId: d.branchId,
            stock: Math.max(0, Number(d.stock) || 0),
            minStock: Math.max(0, Number(d.minStock) || 0),
          }),
        );
      }

      await onCreate(input);
      onDone();
    } catch (caught) {
      if (caught instanceof ApiError && Object.keys(caught.fieldErrors).length > 0) {
        setFieldErrors(caught.fieldErrors);
      }
      setError(resolveErrorMessage(caught, t));
      setPending(false);
    }
  }

  const usedBranchIds = new Set(distributions.map((d) => d.branchId));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <TextField
        label={t(ui.products.nameLabel)}
        name="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={fieldErrors.name}
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
        error={fieldErrors.description}
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
                className="select-field w-full rounded-xl border border-border bg-surface px-4 py-3 text-base font-medium text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10"
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

          {suppliers.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                {t(ui.products.supplierLabel)}
              </span>
              <select
                value={supplierId ?? ""}
                onChange={(e) =>
                  setSupplierId(
                    e.target.value ? Number(e.target.value) : null,
                  )
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
            </div>
          )}

          <TextField
            label={t(ui.products.minStockLabel)}
            name="minStock"
            type="number"
            min={0}
            hint={t(ui.products.minStockHint)}
            value={minStock}
            onChange={(event) => setMinStock(event.target.value)}
          />

          {hasMultipleBranches && (
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-surface/50 p-4">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={distributeEnabled}
                  onChange={(e) => {
                    setDistributeEnabled(e.target.checked);
                    if (e.target.checked && distributions.length === 0) {
                      setDistributions(
                        branches.map((b) => ({
                          branchId: b.id,
                          stock: "0",
                          minStock: "0",
                        })),
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-border accent-brand"
                />
                <span className="text-sm font-semibold text-foreground">
                  {t(ui.products.distributeStock)}
                </span>
              </label>

              {distributeEnabled && (
                <div className="flex flex-col gap-2">
                  {distributions.map((dist, i) => {
                    const branch = branches.find(
                      (b) => b.id === dist.branchId,
                    );
                    return (
                      <div
                        key={dist.branchId}
                        className="flex items-center gap-2"
                      >
                        <select
                          value={dist.branchId}
                          onChange={(e) =>
                            updateDistribution(
                              i,
                              "branchId",
                              Number(e.target.value),
                            )
                          }
                          className="select-field min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-brand"
                        >
                          {branches
                            .filter(
                              (b) =>
                                b.id === dist.branchId ||
                                !usedBranchIds.has(b.id),
                            )
                            .map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                        </select>
                        <input
                          type="number"
                          min={0}
                          value={dist.stock}
                          onChange={(e) =>
                            updateDistribution(i, "stock", e.target.value)
                          }
                          placeholder={t(ui.products.stock)}
                          className="w-20 rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm font-medium tabular-nums text-foreground outline-none focus:border-brand"
                        />
                        {distributions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDistributionRow(i)}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {distributions.length < branches.length && (
                    <button
                      type="button"
                      onClick={addDistributionRow}
                      className="flex cursor-pointer items-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs font-semibold text-brand transition-colors hover:text-brand-dark"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      {t(ui.products.branchLabel)}
                    </button>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-subtle">
                      {distributionSum} / {totalStock}
                    </span>
                    {!distributionValid && (
                      <span className="font-medium text-danger">
                        {t(ui.products.distributionSum)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          {t(ui.common.cancel)}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={pending || (distributeEnabled && !distributionValid)}
        >
          {pending ? <Spinner /> : t(ui.common.save)}
        </Button>
      </div>
    </form>
  );
}
