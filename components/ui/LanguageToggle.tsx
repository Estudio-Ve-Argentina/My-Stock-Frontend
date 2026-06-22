"use client";

import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export function LanguageToggle() {
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t(ui.languageToggle.label)}
      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-subtle transition-colors hover:bg-muted hover:text-foreground"
    >
      {locale === "es" ? "EN" : "ES"}
    </button>
  );
}
