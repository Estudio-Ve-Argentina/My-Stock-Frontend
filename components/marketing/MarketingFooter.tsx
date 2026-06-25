"use client";

import Image from "next/image";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Wordmark } from "@/components/ui/Wordmark";

const navLinks = [
  { label: ui.footer.home, href: "/" },
  { label: ui.footer.login, href: "/login" },
  { label: ui.footer.signup, href: "/signup" },
];

const productLinks = [
  { label: ui.nav.plans, href: "/planes" },
  { label: ui.contact.title, href: "/contacto" },
  { label: ui.footer.faq, href: "/faq" },
];

const legalLinks = [
  { label: ui.footer.terms, href: "/terms" },
  { label: ui.footer.privacy, href: "/privacy" },
];

export function MarketingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="overflow-hidden bg-dark-2 text-dark-foreground">
      <div className="h-[3px] bg-gradient-to-r from-transparent via-neon to-transparent" />
      <div className="mx-auto w-full max-w-6xl px-6 py-6 md:px-8 md:py-7">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <Wordmark dark large />

          <div className="flex gap-6 md:gap-14">
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-dark-foreground md:text-sm">
                {t(ui.footer.nav)}
              </h3>
              <ul className="flex flex-col gap-1 md:gap-1.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-dark-subtle transition-colors hover:text-neon md:text-sm"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-dark-foreground md:text-sm">
                {t(ui.footer.product)}
              </h3>
              <ul className="flex flex-col gap-1 md:gap-1.5">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-dark-subtle transition-colors hover:text-neon md:text-sm"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-dark-foreground md:text-sm">
                {t(ui.footer.legal)}
              </h3>
              <ul className="flex flex-col gap-1 md:gap-1.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-dark-subtle transition-colors hover:text-neon md:text-sm"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 border-t border-dark-border pt-4 text-xs text-dark-subtle md:mt-6">
          <span>© {new Date().getFullYear()} {appConfig.name} ·</span>
          <a
            href={`https://${appConfig.support.site}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 transition-colors hover:text-neon"
          >
            <Image
              src="/estudio-ve-logo.png"
              alt="Estudio Ve"
              width={20}
              height={20}
              className="rounded"
            />
            {appConfig.support.site}
          </a>
        </div>
      </div>
    </footer>
  );
}
