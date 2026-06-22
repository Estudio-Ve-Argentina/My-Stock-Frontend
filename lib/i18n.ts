import { LOCALES, type Locale, type Localized } from "@/config/site.types";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function translate<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}
