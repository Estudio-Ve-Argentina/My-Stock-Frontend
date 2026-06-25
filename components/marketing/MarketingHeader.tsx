"use client";

import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Wordmark } from "@/components/ui/Wordmark";
import { LinkButton } from "@/components/ui/Button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function MarketingHeader() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 bg-muted">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-6 md:px-8">
        <Wordmark />
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <LinkButton href="/login" variant="outline" size="sm">
            {t(ui.auth.loginCta)}
          </LinkButton>
          <LinkButton href="/signup" variant="primary" size="sm">
            {t(ui.auth.goSignup)}
          </LinkButton>
        </div>
      </div>
      <div className="h-[3px] bg-gradient-to-r from-brand via-accent to-brown/40" />
    </header>
  );
}
