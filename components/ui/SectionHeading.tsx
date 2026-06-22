"use client";

import type { Localized } from "@/config/site.types";
import { useLanguage } from "@/hooks/useLanguage";

interface SectionHeadingProps {
  title: Localized;
  subtitle?: Localized;
  eyebrow?: Localized;
  align?: "left" | "center";
  tone?: "light" | "dark";
}

export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = "left",
  tone = "light",
}: SectionHeadingProps) {
  const { t } = useLanguage();
  const wrap = align === "center" ? "items-center text-center" : "items-start";
  const dark = tone === "dark";

  return (
    <div className={`flex flex-col ${wrap}`}>
      {eyebrow && (
        <span
          className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            dark
              ? "bg-white/5 text-neon ring-1 ring-neon/30"
              : "bg-brand-soft text-brand-dark"
          }`}
        >
          {t(eyebrow)}
        </span>
      )}
      <h2
        className={`font-heading text-3xl font-bold tracking-tight md:text-4xl ${
          dark ? "text-dark-foreground" : "text-foreground"
        }`}
      >
        {t(title)}
      </h2>
      {subtitle && (
        <p className={`mt-3 max-w-xl text-base md:text-lg ${dark ? "text-dark-subtle" : "text-subtle"}`}>
          {t(subtitle)}
        </p>
      )}
    </div>
  );
}
