"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Plan } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";

interface PlanCardProps {
  plan: Plan;
  current?: boolean;
  action?: ReactNode;
}

export function PlanCard({ plan, current = false, action }: PlanCardProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const highlighted = plan.id === "pro";

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl p-6 text-foreground ${
        highlighted
          ? "bg-brand-soft ring-1 ring-brand/30 shadow-[0_24px_60px_-28px_rgba(22,163,74,0.5)]"
          : "border border-border bg-surface"
      }`}
    >
      {highlighted && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-neon via-brand to-transparent" />
      )}
      <div className="relative">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-lg font-bold">{t(plan.name)}</h3>
          {current && (
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-brand-foreground">
              {t(ui.account.current)}
            </span>
          )}
          {highlighted && !current && (
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-brand-foreground">
              Popular
            </span>
          )}
        </div>
        <p className="mt-2 font-heading text-4xl font-bold tracking-tight">
          {plan.priceUsd === 0 ? "$0" : `$${plan.priceUsd}`}
          <span className="text-base font-medium text-subtle"> /mes</span>
        </p>
      </div>

      <ul className="relative flex flex-col gap-2.5 text-sm">
        {t(plan.features).map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                highlighted ? "bg-brand text-brand-foreground" : "bg-brand-soft text-brand-dark"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m5 13 4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {feature}
          </li>
        ))}
      </ul>

      {action && <div className="relative mt-auto pt-1">{action}</div>}
    </motion.div>
  );
}
