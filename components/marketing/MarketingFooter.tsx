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
  { label: ui.footer.panel, href: "/panel" },
];

const legalLinks = [
  { label: ui.footer.faq, href: "/faq" },
  { label: ui.footer.terms, href: "/terms" },
  { label: ui.footer.privacy, href: "/privacy" },
];

export function MarketingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-dark-2 text-dark-foreground">
      <div className="h-[3px] bg-gradient-to-r from-transparent via-neon to-transparent" />
      <div className="mx-auto w-full max-w-6xl px-6 py-6 md:px-8 md:py-7">
        <div className="flex items-start justify-between">
          <div className="flex shrink-0 flex-col gap-2.5">
            <Wordmark dark large />
            <a
              href={`https://${appConfig.support.site}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2"
            >
              <Image
                src="/estudio-ve-logo.png"
                alt="Estudio Ve"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <span className="text-sm text-dark-subtle transition-colors group-hover:text-neon">
                {t(ui.footer.madeBy)} Estudio Ve
              </span>
            </a>
          </div>

          <div className="flex justify-between gap-8 md:gap-16">
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

        <div className="mt-5 border-t border-dark-border pt-4 text-center text-xs text-dark-subtle md:mt-6">
          © {new Date().getFullYear()} {appConfig.name} · {appConfig.support.site}
        </div>
      </div>
    </footer>
  );
}
