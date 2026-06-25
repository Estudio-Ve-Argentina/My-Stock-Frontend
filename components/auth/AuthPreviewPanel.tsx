"use client";

import { marketing } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Wordmark } from "@/components/ui/Wordmark";
import { BoxIcon } from "@/components/app/icons";

function stockTone(stock: number): string {
  if (stock === 0) return "bg-danger/15 text-danger";
  if (stock <= 3) return "bg-accent-soft text-accent-foreground";
  return "bg-brand-soft text-brand-dark";
}

export function AuthPreviewPanel() {
  const { t } = useLanguage();
  const { hero } = marketing;

  return (
    <div className="relative flex h-full flex-col justify-center overflow-hidden bg-dark-2 px-10 py-16 xl:px-16">
      <div
        className="texture-grid pointer-events-none absolute inset-0 opacity-60"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-neon/8 blur-[140px]" />
      <div className="pointer-events-none absolute -right-10 bottom-1/4 h-56 w-56 rounded-full bg-brand/10 blur-[100px]" />

      <div className="relative flex flex-col gap-10">
        <Wordmark dark />

        <div>
          <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight text-dark-foreground xl:text-4xl">
            {t(hero.title)}
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-dark-subtle">
            {t(hero.subtitle)}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-dark-border bg-dark/60 shadow-[0_20px_60px_-12px_rgba(52,240,138,0.15)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-neon via-brand to-transparent" />

          <div className="flex items-center justify-between border-b border-dark-border px-4 py-3">
            <span className="text-xs font-semibold text-dark-subtle">
              My-Stock · {t(ui.nav.panel)}
            </span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-neon shadow-[0_0_8px_2px_rgba(52,240,138,0.5)]" />
          </div>

          <div className="flex flex-col gap-2 p-4">
            {marketing.sampleStock.map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between rounded-xl border border-dark-border/60 bg-dark-2/80 px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neon-soft text-dark-subtle">
                    <BoxIcon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-dark-foreground">
                    {row.name}
                  </span>
                </div>
                <span
                  className={`flex h-7 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-bold tabular-nums ${stockTone(row.stock)}`}
                >
                  {row.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
