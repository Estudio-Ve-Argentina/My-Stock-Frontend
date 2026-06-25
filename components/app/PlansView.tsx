"use client";

import { useState } from "react";
import { appConfig, configIdFromBackend, backendIdFromConfig } from "@/config/app.config";
import type { PlanId } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { changePlan, cancelPlanRenewal } from "@/lib/api/user";
import { Button } from "@/components/ui/Button";
import { PlansComparisonTable } from "@/components/ui/PlansComparisonTable";

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PlansView() {
  const { t, locale } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentPlanId = configIdFromBackend(user?.planName ?? "FREE");
  const currentPlan = appConfig.plans.find((p) => p.id === currentPlanId) ?? appConfig.plans[0];
  const isFree = currentPlanId === "free";
  const isPro = currentPlanId === "pro-monthly" || currentPlanId === "pro-annual";

  async function handleChangePlan(targetPlanId: PlanId) {
    if (!user?.userId || targetPlanId === currentPlanId) {
      setFeedback(t(ui.plans.alreadyOnPlan));
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      await changePlan(user.userId, backendIdFromConfig(targetPlanId));
      refreshUser();
      if (targetPlanId === "free") {
        setFeedback(t(ui.plans.downgradeSuccess));
      } else if (currentPlanId === "free") {
        setFeedback(t(ui.plans.upgradeSuccess));
      } else {
        setFeedback(t(ui.plans.planChanged));
      }
    } catch {
      setFeedback(t(ui.common.genericError));
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelRenewal() {
    if (!user?.userId) return;
    setLoading(true);
    setFeedback(null);
    try {
      await cancelPlanRenewal(user.userId);
      refreshUser();
      setFeedback(t(ui.plans.cancelSuccess));
    } catch {
      setFeedback(t(ui.common.genericError));
    } finally {
      setLoading(false);
    }
  }

  const periodLabel =
    currentPlan.priceUsd === 0
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
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-5 py-4 shadow-[0_8px_30px_-8px_rgba(22,163,74,0.12)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-heading text-base font-bold text-foreground">
                {t(currentPlan.name)}
              </span>
              <span className="text-sm text-subtle">
                ${currentPlan.priceUsd}{periodLabel}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isFree && (
                <>
                  <Button
                    variant="primary"
                    disabled={loading}
                    onClick={() => handleChangePlan("pro-monthly")}
                  >
                    {t(ui.plans.upgrade)} — $6{t(ui.plans.perMonth)}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => handleChangePlan("pro-annual")}
                  >
                    {t(ui.plans.upgrade)} — $48{t(ui.plans.perYear)}
                  </Button>
                </>
              )}
              {currentPlanId === "pro-monthly" && (
                <Button
                  variant="primary"
                  disabled={loading}
                  onClick={() => handleChangePlan("pro-annual")}
                >
                  {t(ui.plans.switchToAnnual)}
                </Button>
              )}
              {currentPlanId === "pro-annual" && (
                <Button
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleChangePlan("pro-monthly")}
                >
                  {t(ui.plans.switchToMonthly)}
                </Button>
              )}
              {isPro && (
                <Button
                  variant="ghost"
                  disabled={loading}
                  onClick={() => handleChangePlan("free")}
                  className="text-subtle hover:text-danger"
                >
                  {t(ui.plans.downgrade)}
                </Button>
              )}
            </div>
          </div>

          {isPro && (
            <div className="flex flex-col gap-2 border-t border-border pt-3">
              <p className="text-sm text-subtle">
                {t(ui.plans.expires)}{": "}
                {user?.planExpiresAt
                  ? formatDate(user.planExpiresAt, locale)
                  : t(ui.plans.neverExpires)}
              </p>
              <p className="text-sm text-subtle">
                {user?.autoRenew
                  ? t(ui.plans.renewalActive)
                  : t(ui.plans.renewalCancelled)}
              </p>
              {user?.autoRenew && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={handleCancelRenewal}
                  className="self-start text-subtle hover:text-danger"
                >
                  {t(ui.plans.cancelRenewal)}
                </Button>
              )}
            </div>
          )}

          {feedback && (
            <p className="text-sm font-medium text-brand">{feedback}</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold text-foreground">
          {t(ui.plans.compare)}
        </h2>
        <PlansComparisonTable highlightPlanId={currentPlanId} />
      </section>
    </div>
  );
}
