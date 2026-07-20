"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminSubscriptionResponse, SubscriptionStatus } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { listAdminSubscriptions } from "@/lib/api/admin";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Spinner } from "@/components/ui/Spinner";
import { AdminPageHeader } from "./AdminPageHeader";
import { AdminPager } from "./AdminPager";

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_FILTERS: { value: SubscriptionStatus | "ALL"; label: keyof typeof ui.admin }[] = [
  { value: "ALL", label: "statusAll" },
  { value: "AUTHORIZED", label: "statusAuthorized" },
  { value: "PENDING", label: "statusPending" },
  { value: "PAUSED", label: "statusPaused" },
  { value: "CANCELLED", label: "statusCancelled" },
];

const selectClasses =
  "rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/10";

export function AdminSubscriptions() {
  const { t, locale } = useLanguage();
  const [status, setStatus] = useState<SubscriptionStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    listAdminSubscriptions({ status: status === "ALL" ? undefined : status, page, size: 10 })
      .then((result) => {
        setSubscriptions(result.content);
        setTotalPages(result.totalPages);
      })
      .catch((caught) => setError(resolveErrorMessage(caught, t)))
      .finally(() => setLoading(false));
  }, [status, page, t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title={t(ui.admin.tabSubscriptions)}
        subtitle={t(ui.admin.subscriptionsSubtitle)}
      />

      <div className="flex flex-col gap-4">
        <select
          className={`${selectClasses} self-start`}
          value={status}
          onChange={(e) => {
            setPage(0);
            setStatus(e.target.value as SubscriptionStatus | "ALL");
          }}
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {t(ui.admin[filter.label])}
            </option>
          ))}
        </select>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="text-brand" />
          </div>
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-sm text-subtle">{t(ui.admin.noSubscriptions)}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b-2 border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-subtle">
                  <th className="px-4 py-3">{t(ui.admin.columnUser)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnPlan)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnStatus)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnNextPayment)}</th>
                  <th className="px-4 py-3">{t(ui.admin.columnCreatedAt)}</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{subscription.userName}</p>
                      <p className="text-xs text-subtle">{subscription.userEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{subscription.planName}</td>
                    <td className="px-4 py-3 text-sm text-subtle">{subscription.status}</td>
                    <td className="px-4 py-3 text-sm text-subtle">
                      {formatDate(subscription.nextPaymentDate, locale)}
                    </td>
                    <td className="px-4 py-3 text-sm text-subtle">
                      {formatDate(subscription.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPager page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
