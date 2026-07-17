"use client";

import { motion, useReducedMotion } from "framer-motion";
import { marketing } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PanelIcon, BoxIcon, ClockIcon } from "@/components/app/icons";

function stockTone(stock: number): string {
  if (stock === 0) {
    return "bg-danger/15 text-danger";
  }
  if (stock <= 3) {
    return "bg-accent-soft text-accent-foreground";
  }
  return "bg-brand-soft text-brand-dark";
}

export function MarketingPreview() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { preview } = marketing;

  const navItems = [
    { label: ui.nav.panel, active: true },
    { label: ui.nav.products, active: false },
    { label: ui.nav.history, active: false },
  ];

  const tiles = [
    { label: ui.panel.totalProducts, value: 24, filled: true },
    { label: ui.panel.movementsToday, value: 6, filled: false },
    { label: ui.panel.outOfStock, value: 1, filled: false },
  ];

  return (
    <Section>
      <div>
        <SectionHeading
          eyebrow={preview.eyebrow}
          title={preview.title}
          subtitle={preview.subtitle}
          align="center"
          tone="dark"
        />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border-2 border-dark-border bg-surface shadow-[0_20px_60px_-12px_rgba(52,240,138,0.25)]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-neon via-brand to-transparent" />

          <div className="flex items-center gap-2 border-b-2 border-border px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-brand/60" />
            <span className="ml-2 text-xs font-medium text-subtle">Stockeo · {t(ui.nav.panel)}</span>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-0">
            <div className="hidden flex-col gap-1.5 border-r-2 border-border bg-muted/50 p-3 sm:flex">
              {navItems.map((entry, index) => (
                <span
                  key={index}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                    entry.active
                      ? "bg-brand text-brand-foreground shadow-[0_8px_20px_-10px_rgba(22,163,74,0.7)]"
                      : "text-subtle"
                  }`}
                >
                  <PanelIcon className="h-4 w-4" />
                  {t(entry.label)}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-4 p-4 md:p-6">
              <div className="grid grid-cols-3 gap-3">
                {tiles.map((tile, index) => (
                  <div
                    key={index}
                    className={`relative overflow-hidden rounded-xl p-3 ${
                      tile.filled
                        ? "bg-gradient-to-br from-brand to-brand-dark text-brand-foreground shadow-[0_14px_30px_-16px_rgba(22,163,74,0.7)]"
                        : "border-2 border-border bg-background text-foreground"
                    }`}
                  >
                    <p className="font-heading text-2xl font-bold tabular-nums">{tile.value}</p>
                    <p className={`mt-0.5 truncate text-[11px] font-medium ${tile.filled ? "text-brand-foreground/80" : "text-subtle"}`}>
                      {t(tile.label)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {marketing.sampleStock.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-subtle">
                        <BoxIcon className="h-4 w-4" />
                      </span>
                      <span className="truncate text-sm font-medium text-foreground">{row.name}</span>
                    </div>
                    <span
                      className={`flex h-7 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold tabular-nums ${stockTone(row.stock)}`}
                    >
                      {row.stock}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 px-1 pt-1 text-xs text-subtle">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {t(ui.panel.recent)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
