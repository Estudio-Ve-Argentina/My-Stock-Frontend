"use client";

import { createContext, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { appConfig } from "@/config/app.config";
import type { Locale, Localized } from "@/config/site.types";
import { translate } from "@/lib/i18n";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const STORAGE_KEY = "locale";

export interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: <T>(value: Localized<T>) => T;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useLocalStorage<Locale>(
    STORAGE_KEY,
    appConfig.defaultLocale,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "es" ? "en" : "es");
  }, [locale, setLocale]);

  const t = useCallback(
    <T,>(value: Localized<T>): T => translate(value, locale),
    [locale],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
