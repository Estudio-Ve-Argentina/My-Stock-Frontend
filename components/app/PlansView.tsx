"use client";

import { useCallback, useEffect, useState } from "react";
import { configIdFromBackend, backendPlanName, formatPrice } from "@/config/app.config";
import type { PlanId, SubscriptionResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { usePlans } from "@/hooks/usePlans";
import { subscribe, getSubscription, cancelSubscription } from "@/lib/api/subscriptions";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PlansComparisonTable } from "@/components/ui/PlansComparisonTable";
import { Spinner } from "@/components/ui/Spinner";

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SubscriptionBadge({ status }: { status: string }) {
  const { t } = useLanguage();

  if (status === "AUTHORIZED") {
    return (
      <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
        {t(ui.plans.subscriptionActive)}
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        {t(ui.plans.subscriptionPending)}
      </span>
    );
  }
  if (status === "PAUSED") {
    return (
      <span className="rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-semibold text-danger">
        {t(ui.plans.subscriptionPaused)}
      </span>
    );
  }
  return null;
}

export function PlansView() {
  const { t, locale } = useLanguage();
  const { user, refreshUser } = useAuth();
  const { plans, loading: plansLoading } = usePlans({ includeHidden: true });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const currentPlanId = configIdFromBackend(user?.planName ?? "FREE");
  const currentPlan = plans.find((p) => p.id === currentPlanId) ?? plans[0];
  const monthlyPlan = plans.find((p) => p.id === "pro-monthly");
  const annualPlan = plans.find((p) => p.id === "pro-annual");
  const isFree = currentPlanId === "free";
  const isPro = currentPlanId === "pro-monthly" || currentPlanId === "pro-annual";
  const subscriptionStatus = user?.subscriptionStatus ?? null;

  const loadSubscription = useCallback(() => {
    getSubscription()
      .then(setSubscription)
      .catch(() => {})
      .finally(() => setSubscriptionLoaded(true));
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  async function handleSubscribe(targetPlanId: PlanId) {
    setLoading(true);
    setFeedback(null);
    setPlanError(null);
    try {
      const result = await subscribe(backendPlanName(targetPlanId));
      window.location.href = result.initPoint;
    } catch (caught) {
      setPlanError(resolveErrorMessage(caught, t));
      setLoading(false);
    }
  }

  async function handleCancel() {
    setLoading(true);
    setFeedback(null);
    setPlanError(null);
    setConfirmCancel(false);
    try {
      await cancelSubscription();
      refreshUser();
      setSubscription(null);
      setFeedback(t(ui.plans.subscriptionCancelled));
    } catch (caught) {
      setPlanError(resolveErrorMessage(caught, t));
    } finally {
      setLoading(false);
    }
  }

  const periodLabel =
    !currentPlan || currentPlan.price === 0
      ? ""
      : currentPlan.durationDays === 365
        ? ` ${t(ui.plans.perYear)}`
        : ` ${t(ui.plans.perMonth)}`;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.plans.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.plans.subtitle)}</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold text-foreground">
          {t(ui.plans.yourPlan)}
        </h2>
        {plansLoading || !currentPlan ? (
          <div className="flex justify-center py-10">
            <Spinner className="text-brand" />
          </div>
        ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4 shadow-[0_8px_30px_-8px_rgba(22,163,74,0.12)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-heading text-base font-bold text-foreground">
                  {t(currentPlan.name)}
                </span>
                {subscriptionStatus && <SubscriptionBadge status={subscriptionStatus} />}
              </div>
              <span className="text-sm text-subtle">
                {formatPrice(currentPlan.price)}{periodLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isFree && (
                <>
                  {monthlyPlan && (
                    <Button
                      variant="primary"
                      disabled={loading}
                      onClick={() => handleSubscribe("pro-monthly")}
                    >
                      {loading
                        ? t(ui.plans.subscribing)
                        : `${t(ui.plans.upgrade)} — ${formatPrice(monthlyPlan.price)}${t(ui.plans.perMonth)}`}
                    </Button>
                  )}
                  {annualPlan && (
                    <Button
                      variant="outline"
                      disabled={loading}
                      onClick={() => handleSubscribe("pro-annual")}
                    >
                      {`${t(ui.plans.upgrade)} — ${formatPrice(annualPlan.price)}${t(ui.plans.perYear)}`}
                    </Button>
                  )}
                </>
              )}
              {isPro && subscriptionStatus === "AUTHORIZED" && (
                <>
                  {currentPlanId === "pro-monthly" && (
                    <Button
                      variant="primary"
                      disabled={loading}
                      onClick={() => handleSubscribe("pro-annual")}
                    >
                      {loading ? t(ui.plans.subscribing) : t(ui.plans.switchToAnnual)}
                    </Button>
                  )}
                  {currentPlanId === "pro-annual" && (
                    <Button
                      variant="outline"
                      disabled={loading}
                      onClick={() => handleSubscribe("pro-monthly")}
                    >
                      {loading ? t(ui.plans.subscribing) : t(ui.plans.switchToMonthly)}
                    </Button>
                  )}
                </>
              )}
              {isPro && (
                <Button
                  variant="ghost"
                  disabled={loading}
                  onClick={() => setConfirmCancel(true)}
                  className="text-subtle hover:text-danger"
                >
                  {t(ui.plans.cancelSubscription)}
                </Button>
              )}
            </div>
          </div>

          {subscriptionLoaded && subscription?.nextPaymentDate && subscriptionStatus === "AUTHORIZED" && (
            <div className="border-t border-border pt-3">
              <p className="text-sm text-subtle">
                {t(ui.plans.nextPayment)}{": "}
                {formatDate(subscription.nextPaymentDate, locale)}
              </p>
            </div>
          )}

          {subscriptionStatus === "PAUSED" && (
            <div className="border-t border-border pt-3">
              <p className="text-sm text-amber-700">
                {t(ui.plans.subscriptionPaused)}
              </p>
            </div>
          )}

          {feedback && (
            <p className="text-sm font-medium text-brand">{feedback}</p>
          )}
          {planError && (
            <p className="text-sm font-medium text-danger">{planError}</p>
          )}
        </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold text-foreground">
          {t(ui.plans.compare)}
        </h2>
        <PlansComparisonTable highlightPlanId={currentPlanId} />
      </section>

      <ConfirmModal
        open={confirmCancel}
        title={t(ui.plans.cancelSubscription)}
        description={t(ui.plans.cancelSubscriptionConfirm)}
        confirmLabel={t(ui.plans.cancelSubscription)}
        cancelLabel={t(ui.common.cancel)}
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
