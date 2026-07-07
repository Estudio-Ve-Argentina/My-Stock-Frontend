"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ui } from "@/config/i18n";
import { appConfig } from "@/config/app.config";
import { backendIdFromConfig } from "@/config/app.config";
import type { PlanId } from "@/config/site.types";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile } from "@/lib/api/user";
import { changePlan } from "@/lib/api/user";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { PlanCard } from "@/components/ui/PlanCard";
import { Spinner } from "@/components/ui/Spinner";
import { PlusIcon, PinIcon, SparkIcon } from "@/components/app/icons";

const ONBOARDED_KEY = "mystock_onboarded";

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export function OnboardingView() {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("free");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(ONBOARDED_KEY)) {
      router.replace("/panel");
    }
  }, [router]);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.lastName) setLastName(user.lastName);
  }, [user?.name, user?.lastName]);

  const handleProfileSubmit = useCallback(async () => {
    if (!name.trim() || !user?.userId) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile(user.userId, { name: name.trim(), lastName: lastName.trim() || undefined });
      refreshUser();
      setStep(1);
    } catch (caught) {
      setError(resolveErrorMessage(caught, t));
    } finally {
      setSaving(false);
    }
  }, [name, lastName, user?.userId, refreshUser, t]);

  const handlePlanSubmit = useCallback(async () => {
    if (!user?.userId) return;
    setSaving(true);
    setError(null);
    try {
      if (selectedPlan !== "free") {
        await changePlan(user.userId, backendIdFromConfig(selectedPlan));
        refreshUser();
      }
      setStep(2);
    } catch (caught) {
      setError(resolveErrorMessage(caught, t));
    } finally {
      setSaving(false);
    }
  }, [selectedPlan, user?.userId, refreshUser, t]);

  const handleFinish = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    router.replace("/panel");
  }, [router]);

  if (!user) {
    return (
      <div className="flex justify-center py-16 text-brand">
        <Spinner />
      </div>
    );
  }

  const tips = [
    { icon: PlusIcon, text: t(ui.onboarding.tipCreate) },
    { icon: PinIcon, text: t(ui.onboarding.tipPin) },
    { icon: SparkIcon, text: t(ui.onboarding.tipStock) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-8 bg-brand" : i < step ? "w-4 bg-brand/40" : "w-4 bg-border"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="profile"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            <div className="text-center">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                {t(ui.onboarding.profileTitle)}
              </h1>
              <p className="mt-1 text-sm text-subtle">{t(ui.onboarding.profileSubtitle)}</p>
            </div>

            <div className="flex flex-col gap-3">
              <TextField
                label={t(ui.auth.name)}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <TextField
                label={t(ui.auth.lastname)}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {error && <p className="text-center text-sm text-danger">{error}</p>}

            <Button
              variant="primary"
              fullWidth
              disabled={!name.trim() || saving}
              onClick={handleProfileSubmit}
            >
              {saving ? <Spinner /> : t(ui.onboarding.next)}
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="plan"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-5"
          >
            <div className="text-center">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                {t(ui.onboarding.planTitle)}
              </h1>
              <p className="mt-1 text-sm text-subtle">{t(ui.onboarding.planSubtitle)}</p>
            </div>

            <div className="grid gap-3">
              {appConfig.plans.map((plan, index) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`rounded-2xl ring-2 transition-all ${
                    selectedPlan === plan.id
                      ? "ring-brand shadow-[0_0_0_1px_var(--color-brand)]"
                      : "ring-transparent"
                  }`}
                >
                  <PlanCard plan={plan} index={index} />
                </button>
              ))}
            </div>

            {error && <p className="text-center text-sm text-danger">{error}</p>}

            <Button
              variant="primary"
              fullWidth
              disabled={saving}
              onClick={handlePlanSubmit}
            >
              {saving ? <Spinner /> : t(ui.onboarding.next)}
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="welcome"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 13 4 4L19 7" />
              </svg>
            </div>

            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                {t(ui.onboarding.welcomeTitle)}
              </h1>
              <p className="mt-1 text-sm text-subtle">{t(ui.onboarding.welcomeSubtitle)}</p>
            </div>

            <ul className="flex w-full flex-col gap-3">
              {tips.map((tip) => {
                const TipIcon = tip.icon;
                return (
                  <li
                    key={tip.text}
                    className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3 text-left text-sm font-medium text-foreground"
                  >
                    <TipIcon className="h-5 w-5 shrink-0 text-brand" />
                    {tip.text}
                  </li>
                );
              })}
            </ul>

            <Button variant="primary" fullWidth onClick={handleFinish}>
              {t(ui.onboarding.goToPanel)}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
