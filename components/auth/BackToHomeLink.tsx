"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { ui } from "@/config/i18n";

export function BackToHomeLink() {
  const { t } = useLanguage();

  return (
    <Link
      href="/"
      className="text-sm text-subtle transition-colors hover:text-foreground"
    >
      {t(ui.common.backToHome)}
    </Link>
  );
}
