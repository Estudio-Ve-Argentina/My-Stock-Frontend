"use client";

import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export function PrivacyContent() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[600px] -translate-x-1/2 rounded-full bg-brand/8 blur-[140px]" />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-16 md:px-8 md:py-22">
        <header className="mb-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t(ui.privacy.title)}
          </h1>
          <p className="mt-2 text-sm text-subtle">
            {t(ui.privacy.lastUpdated)}: junio 2025
          </p>
          <p className="mt-4 text-sm leading-relaxed text-subtle md:text-base">
            {t(ui.privacy.intro)}
          </p>
        </header>

        <div className="flex flex-col gap-8">
          {ui.privacy.sections.map((section, index) => (
            <div key={index}>
              <h2 className="font-heading text-base font-bold text-foreground md:text-lg">
                {t(section.heading)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-subtle md:text-base">
                {t(section.body)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
