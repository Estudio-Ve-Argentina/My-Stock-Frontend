"use client";

import { useState, type FormEvent } from "react";
import type { ProductRequest } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";

interface ProductFormProps {
  userId: number;
  onCreate: (input: ProductRequest) => Promise<void>;
  onDone: () => void;
}

export function ProductForm({ userId, onCreate, onDone }: ProductFormProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
