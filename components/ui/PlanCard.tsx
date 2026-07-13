"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Plan } from "@/config/site.types";
import { formatPrice } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";

interface PlanCardProps {
  plan: Plan;
  current?: boolean;
  action?: ReactNode;
  index?: number;
}

export function PlanCard({ plan, current = false, action, index = 0 }: PlanCardProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const isPro = plan.id !== "free";
  const isAnnual = plan.id === "pro-annual";
  const periodLabel =
    plan.price === 0
      ? ""
      : plan.durationDays === 365
        ? ` ${t(ui.plans.perYear)}`
        : ` ${t(ui.plans.perMonth)}`;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: index * 0.12 }}
      className={`relative flex h-full cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-foreground transition-shadow md:gap-5 md:p-6 ${
        isPro
          ? "border-brand/25 bg-brand-soft/50 shadow-[0_14px_40px_-8px_rgba(22,163,74,0.20)] hover:shadow-[0_20px_48px_-8px_rgba(22,163,74,0.30)]"
          : "border-brand/20 bg-brand-soft/45 shadow-[0_12px_36px_-8px_rgba(22,163,74,0.16)] hover:shadow-[0_18px_44px_-8px_rgba(22,163,74,0.26)]"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand/40 via-brand/20 to-transparent" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-bold md:text-lg">{t(plan.name)}</h3>
          {current && (
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-brand-foreground">
              {t(ui.account.current)}
            </span>
          )}
          {isAnnual && !current && (
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-brand-foreground">
              {t(ui.plans.bestValue)}
            </span>
          )}
        </div>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight md:mt-2 md:text-4xl">
          {formatPrice(plan.price)}
          <span className="text-xs font-medium text-subtle md:text-base">{periodLabel}</span>
        </p>
      </div>

      <ul className="relative flex flex-col gap-1.5 text-xs md:gap-2.5 md:text-sm">
        {t(plan.features).map((feature) => (
          <li key={feature} className="flex items-start gap-1.5 md:gap-2.5">
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand-dark md:h-5 md:w-5"
            >
              <svg className="h-2.5 w-2.5 md:h-3 md:w-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
