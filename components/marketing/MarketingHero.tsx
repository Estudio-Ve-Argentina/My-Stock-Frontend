"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { marketing } from "@/config/app.config";
import { useLanguage } from "@/hooks/useLanguage";
import { LinkButton } from "@/components/ui/Button";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

function stockTone(stock: number): string {
  if (stock === 0) {
    return "bg-danger/15 text-danger";
  }
  if (stock <= 3) {
    return "bg-accent-soft text-accent-foreground";
  }
  return "bg-brand-soft text-brand-dark";
}

export function MarketingHero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { hero } = marketing;

  return (
    <section className="relative overflow-hidden">
      <div className="texture-dots texture-fade pointer-events-none absolute inset-0 opacity-100" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/15 blur-[110px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-8 md:px-8 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          variants={container}
          initial={reduceMotion ? undefined : "hidden"}
          animate="show"
          className="flex flex-col items-start"
        >
          <motion.span
            variants={item}
            className="inline-flex rounded-full bg-brand-soft px-3.5 py-1 text-xs font-bold text-brand-dark ring-1 ring-brand/25"
          >
            {t(hero.eyebrow)}
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-5 font-heading text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl"
          >
            {t(hero.title)}
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-md text-lg text-subtle">
            {t(hero.subtitle)}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-row gap-3">
            <LinkButton href="/signup" variant="featured" size="md">
              {t(hero.ctaPrimary)}
            </LinkButton>
            <LinkButton href="/login" variant="outline" size="md">
              {t(hero.ctaSecondary)}
            </LinkButton>
          </motion.div>
        </motion.div>

        <motion.div
          variants={container}
          initial={reduceMotion ? undefined : "hidden"}
          animate="show"
          className="relative"
        >
          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-2xl border-2 border-border bg-surface p-6 shadow-[0_20px_60px_-10px_rgba(52,240,138,0.3)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-neon via-brand to-transparent" />
            <div className="mb-5 flex items-center justify-between">
              <span className="font-heading text-sm font-bold text-foreground">Stock</span>
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-neon shadow-[0_0_12px_3px_rgba(52,240,138,0.6)]" />
            </div>
            <div className="flex flex-col gap-3">
              {marketing.sampleStock.map((row) => (
                <motion.div
                  key={row.name}
                  variants={item}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted px-4 py-3"
                >
                  <span className="truncate text-sm font-medium text-foreground">{row.name}</span>
                  <span
                    className={`flex h-8 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-bold tabular-nums ${stockTone(row.stock)}`}
                  >
                    {row.stock}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
