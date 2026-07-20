"use client";

import { useState } from "react";
import type { PlanResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TextField } from "@/components/ui/TextField";

interface AssignPlanModalProps {
  open: boolean;
  plans: PlanResponse[];
  pending: boolean;
  error: string | null;
  onConfirm: (planId: number, durationDays?: number) => void;
  onCancel: () => void;
}

const selectClasses =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10";

export function AssignPlanModal({
  open,
  plans,
  pending,
  error,
  onConfirm,
  onCancel,
}: AssignPlanModalProps) {
  const { t } = useLanguage();
  const [planId, setPlanId] = useState<number | "">(plans[0]?.id ?? "");
  const [durationDays, setDurationDays] = useState("");

  return (
    <ConfirmModal
      open={open}
      title={t(ui.admin.assignPlan)}
      confirmLabel={t(ui.admin.assignPlanConfirm)}
      cancelLabel={t(ui.common.cancel)}
      onCancel={onCancel}
      onConfirm={() => {
        if (planId === "") return;
        onConfirm(planId, durationDays ? Number(durationDays) : undefined);
      }}
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            {t(ui.admin.assignPlanTarget)}
          </span>
          <select
            className={selectClasses}
            value={planId}
            onChange={(e) => setPlanId(Number(e.target.value))}
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </label>

        <TextField
          label={t(ui.admin.assignPlanDuration)}
          name="durationDays"
          type="number"
          min={1}
          hint={t(ui.admin.assignPlanDurationHint)}
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}
        {pending && <p className="text-sm text-subtle">{t(ui.common.loading)}</p>}
      </div>
    </ConfirmModal>
  );
}
