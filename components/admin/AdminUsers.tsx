"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AdminSubscriptionResponse,
  PlanResponse,
  SubscriptionStatus,
  UserEntityResponse,
  UserSaveRequest,
} from "@/config/site.types";
import { PLAN_PRESENTATION, configIdFromBackend } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import {
  createUser,
  deleteUser,
  searchUsers,
  updateUser,
  cancelUserPlan,
} from "@/lib/api/user";
import { assignUserPlan, getUserSubscriptionHistory } from "@/lib/api/admin";
import { listPlans } from "@/lib/api/plans";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminPager } from "./AdminPager";
import { AssignPlanModal } from "./AssignPlanModal";
import { UserFormModal } from "./UserFormModal";
import { SubscriptionHistoryModal } from "./SubscriptionHistoryModal";
import { UserRowMenu } from "./UserRowMenu";

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PLAN_FILTERS = ["FREE", "PRO_MONTHLY", "PRO_ANNUAL"];

const STATUS_FILTERS: { value: SubscriptionStatus; label: keyof typeof ui.admin }[] = [
  { value: "AUTHORIZED", label: "statusAuthorized" },
  { value: "PENDING", label: "statusPending" },
  { value: "PAUSED", label: "statusPaused" },
  { value: "CANCELLED", label: "statusCancelled" },
];

const selectClasses =
  "rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10";

export function AdminUsers() {
  const { t, locale } = useLanguage();
  const [plans, setPlans] = useState<PlanResponse[]>([]);

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "">("");
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState<UserEntityResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<UserEntityResponse | null>(null);
  const [assignTarget, setAssignTarget] = useState<UserEntityResponse | null>(null);
  const [cancelTarget, setCancelTarget] = useState<UserEntityResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserEntityResponse | null>(null);
  const [historyTarget, setHistoryTarget] = useState<UserEntityResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<AdminSubscriptionResponse[]>([]);

  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUsers = useCallback(() => {
    setLoading(true);
    setError(null);
    searchUsers({
      search: search || undefined,
      planName: planFilter || undefined,
      subscriptionStatus: statusFilter || undefined,
      page,
      size: 10,
    })
      .then((result) => {
        setUsers(result.content);
        setTotalPages(result.totalPages);
      })
      .catch((caught) => setError(resolveErrorMessage(caught, t)))
      .finally(() => setLoading(false));
  }, [search, planFilter, statusFilter, page, t]);

  useEffect(() => {
    const timeout = setTimeout(loadUsers, 350);
    return () => clearTimeout(timeout);
  }, [loadUsers]);

  useEffect(() => {
    listPlans()
      .then(setPlans)
      .catch(() => {});
  }, []);

  function openCreate() {
    setFormTarget(null);
    setFormOpen(true);
    setActionError(null);
  }

  function openEdit(user: UserEntityResponse) {
    setFormTarget(user);
    setFormOpen(true);
    setActionError(null);
  }

  async function handleFormConfirm(input: UserSaveRequest) {
    setActionPending(true);
    setActionError(null);
    try {
      if (formTarget) {
        await updateUser(formTarget.id, input);
      } else {
        await createUser(input);
      }
      setFormOpen(false);
      setFormTarget(null);
      loadUsers();
    } catch (caught) {
      setActionError(resolveErrorMessage(caught, t));
    } finally {
      setActionPending(false);
    }
  }

  async function handleAssignConfirm(planId: number, durationDays?: number) {
    if (!assignTarget) return;
    setActionPending(true);
    setActionError(null);
    try {
      await assignUserPlan(assignTarget.id, { planId, durationDays });
      setAssignTarget(null);
      loadUsers();
    } catch (caught) {
      setActionError(resolveErrorMessage(caught, t));
    } finally {
      setActionPending(false);
    }
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setActionPending(true);
    setActionError(null);
    try {
      await cancelUserPlan(cancelTarget.id);
      setCancelTarget(null);
      loadUsers();
    } catch (caught) {
      setActionError(resolveErrorMessage(caught, t));
    } finally {
      setActionPending(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setActionPending(true);
    setActionError(null);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      loadUsers();
    } catch (caught) {
      setActionError(resolveErrorMessage(caught, t));
    } finally {
      setActionPending(false);
    }
  }

  function openHistory(user: UserEntityResponse) {
    setHistoryTarget(user);
    setHistoryLoading(true);
    getUserSubscriptionHistory(user.id)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }

  return (
    <div>
      <AdminPageHeader title={t(ui.admin.tabUsers)} subtitle={t(ui.admin.usersSubtitle)} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
            <div className="w-full sm:max-w-xs">
              <TextField
                label={t(ui.admin.searchPlaceholder)}
                name="search"
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
              />
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">{t(ui.admin.columnPlan)}</span>
              <select
                className={selectClasses}
                value={planFilter}
                onChange={(e) => {
                  setPage(0);
                  setPlanFilter(e.target.value);
                }}
              >
                <option value="">{t(ui.common.all)}</option>
                {PLAN_FILTERS.map((backendName) => (
                  <option key={backendName} value={backendName}>
                    {t(PLAN_PRESENTATION[configIdFromBackend(backendName)].name)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">{t(ui.admin.columnStatus)}</span>
              <select
                className={selectClasses}
                value={statusFilter}
                onChange={(e) => {
                  setPage(0);
                  setStatusFilter(e.target.value as SubscriptionStatus | "");
                }}
              >
                <option value="">{t(ui.common.all)}</option>
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {t(ui.admin[filter.label])}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Button variant="primary" size="sm" onClick={openCreate} className="self-start">
            {t(ui.admin.createUser)}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="text-brand" />
          </div>
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-subtle">{t(ui.admin.noUsers)}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b-2 border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-subtle">
                  <th className="px-4 py-3">{t(ui.admin.columnName)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnUsername)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnPlan)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnExpires)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnAutoRenew)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnStatus)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnActions)}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.username} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {user.name} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-subtle">{user.username}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{user.planName}</td>
                    <td className="px-4 py-3 text-sm text-subtle">
                      {user.planExpiresAt ? formatDate(user.planExpiresAt, locale) : t(ui.admin.noExpiry)}
                    </td>
                    <td className="px-4 py-3 text-sm text-subtle">
                      {user.autoRenew ? t(ui.admin.yes) : t(ui.admin.no)}
                    </td>
                    <td className="px-4 py-3 text-sm text-subtle">
                      {user.subscriptionStatus ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserRowMenu
                        onEdit={() => openEdit(user)}
                        onAssignPlan={() => setAssignTarget(user)}
                        onCancelPlan={() => setCancelTarget(user)}
                        onViewHistory={() => openHistory(user)}
                        onDelete={() => setDeleteTarget(user)}
                        showCancelPlan={user.planName !== "FREE" && user.autoRenew}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPager page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <UserFormModal
        key={formTarget?.id ?? "create"}
        open={formOpen}
        editingUser={formTarget}
        pending={actionPending}
        error={actionError}
        onConfirm={handleFormConfirm}
        onCancel={() => {
          setFormOpen(false);
          setFormTarget(null);
          setActionError(null);
        }}
      />

      <AssignPlanModal
        key={assignTarget?.id ?? "assign-none"}
        open={assignTarget !== null}
        plans={plans}
        pending={actionPending}
        error={actionError}
        onConfirm={handleAssignConfirm}
        onCancel={() => {
          setAssignTarget(null);
          setActionError(null);
        }}
      />

      <ConfirmModal
        open={cancelTarget !== null}
        title={t(ui.admin.cancelPlan)}
        description={t(ui.admin.cancelPlanConfirm)}
        confirmLabel={t(ui.admin.cancelPlan)}
        cancelLabel={t(ui.common.cancel)}
        variant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => {
          setCancelTarget(null);
          setActionError(null);
        }}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title={t(ui.admin.deleteUser)}
        description={t(ui.admin.deleteUserConfirm)}
        confirmLabel={t(ui.common.delete)}
        cancelLabel={t(ui.common.cancel)}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteTarget(null);
          setActionError(null);
        }}
      />

      <SubscriptionHistoryModal
        open={historyTarget !== null}
        loading={historyLoading}
        history={history}
        onClose={() => setHistoryTarget(null)}
      />
    </div>
  );
}
