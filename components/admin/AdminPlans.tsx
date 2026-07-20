"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/config/app.config";
import type { PlanRequest, PlanResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { createPlan, deletePlan, listPlans, updatePlan } from "@/lib/api/plans";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Spinner } from "@/components/ui/Spinner";
import { AdminPageHeader } from "./AdminPageHeader";
import { PlanFormModal } from "./PlanFormModal";

export function AdminPlans() {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<PlanResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    listPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, []);

  function openCreate() {
    setFormTarget(null);
    setFormOpen(true);
    setError(null);
  }

  function openEdit(plan: PlanResponse) {
    setFormTarget(plan);
    setFormOpen(true);
    setError(null);
  }

  async function handleFormConfirm(input: PlanRequest) {
    setPending(true);
    setError(null);
    try {
      if (formTarget) {
        await updatePlan(formTarget.id, input);
      } else {
        await createPlan(input);
      }
      setFormOpen(false);
      setFormTarget(null);
      refresh();
    } catch (caught) {
      setError(resolveErrorMessage(caught, t));
    } finally {
      setPending(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setPending(true);
    setError(null);
    try {
      await deletePlan(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch (caught) {
      setError(resolveErrorMessage(caught, t));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <AdminPageHeader title={t(ui.admin.tabPlans)} subtitle={t(ui.admin.plansSubtitle)} />

      <div className="flex flex-col gap-4">
        <Button variant="primary" size="sm" onClick={openCreate} className="self-start">
          {t(ui.admin.createPlan)}
        </Button>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="text-brand" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b-2 border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-subtle">
                  <th className="px-4 py-3">{t(ui.admin.planFormName)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnMaxProducts)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnPrice)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnDuration)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnActions)}</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{plan.name}</td>
                    <td className="px-4 py-3 text-sm text-subtle">{plan.maxProducts}</td>
                    <td className="px-4 py-3 text-sm text-subtle">{formatPrice(plan.price)}</td>
                    <td className="px-4 py-3 text-sm text-subtle">{plan.durationDays}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>
                          {t(ui.admin.editPlan)}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(plan)}
                          className="text-danger hover:text-danger"
                        >
                          {t(ui.common.delete)}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PlanFormModal
        key={formTarget?.id ?? "create"}
        open={formOpen}
        editingPlan={formTarget}
        pending={pending}
        error={error}
        onConfirm={handleFormConfirm}
        onCancel={() => {
          setFormOpen(false);
          setFormTarget(null);
          setError(null);
        }}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title={t(ui.admin.deletePlan)}
        description={t(ui.admin.deletePlanConfirm)}
        confirmLabel={t(ui.common.delete)}
        cancelLabel={t(ui.common.cancel)}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteTarget(null);
          setError(null);
        }}
      />
    </div>
  );
}
