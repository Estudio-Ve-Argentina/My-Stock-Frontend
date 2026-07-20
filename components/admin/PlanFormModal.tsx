"use client";

import { useState } from "react";
import type { PlanRequest, PlanResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TextField } from "@/components/ui/TextField";

interface PlanFormModalProps {
  open: boolean;
  editingPlan: PlanResponse | null;
  pending: boolean;
  error: string | null;
  onConfirm: (input: PlanRequest) => void;
  onCancel: () => void;
}

export function PlanFormModal({
  open,
  editingPlan,
  pending,
  error,
  onConfirm,
  onCancel,
}: PlanFormModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(editingPlan?.name ?? "");
  const [maxProducts, setMaxProducts] = useState(String(editingPlan?.maxProducts ?? ""));
  const [price, setPrice] = useState(String(editingPlan?.price ?? ""));
  const [durationDays, setDurationDays] = useState(String(editingPlan?.durationDays ?? ""));

  return (
    <ConfirmModal
      open={open}
      title={t(editingPlan ? ui.admin.editPlan : ui.admin.createPlan)}
      confirmLabel={t(ui.common.save)}
      cancelLabel={t(ui.common.cancel)}
      onCancel={onCancel}
      onConfirm={() =>
        onConfirm({
          name,
          maxProducts: Number(maxProducts),
          price: Number(price),
          durationDays: Number(durationDays),
        })
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label={t(ui.admin.planFormName)}
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label={t(ui.admin.planFormMaxProducts)}
          name="maxProducts"
          type="number"
          min={0}
          required
          value={maxProducts}
          onChange={(e) => setMaxProducts(e.target.value)}
        />
        <TextField
          label={t(ui.admin.planFormPrice)}
          name="price"
          type="number"
          min={0}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <TextField
          label={t(ui.admin.planFormDuration)}
          name="durationDays"
          type="number"
          min={0}
          required
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}
        {pending && <p className="text-sm text-subtle">{t(ui.common.loading)}</p>}
      </div>
    </ConfirmModal>
  );
}
