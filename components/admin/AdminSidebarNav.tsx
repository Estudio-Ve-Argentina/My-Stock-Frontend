"use client";

import { type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Localized } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Wordmark } from "@/components/ui/Wordmark";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import {
  PanelIcon,
  UserIcon,
  ChartIcon,
  SparkIcon,
  LogoutIcon,
  ChevronDownIcon,
} from "@/components/app/icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  href: string;
  label: Localized;
  icon: Icon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: ui.admin.tabOverview, icon: PanelIcon },
  { href: "/admin/usuarios", label: ui.admin.tabUsers, icon: UserIcon },
  { href: "/admin/suscripciones", label: ui.admin.tabSubscriptions, icon: ChartIcon },
  { href: "/admin/planes", label: ui.admin.tabPlans, icon: SparkIcon },
];

interface AdminSidebarNavProps {
  onNavigate?: () => void;
}

export function AdminSidebarNav({ onNavigate }: AdminSidebarNavProps) {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  function isActive(href: string): boolean {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  function linkClass(href: string): string {
    const active = isActive(href);
    return `group relative mr-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
      active
        ? "bg-gradient-to-r from-accent to-brown text-white ring-1 ring-accent/40 shadow-[0_10px_28px_-8px_rgba(245,194,17,0.55)]"
        : "text-dark-subtle hover:bg-white/5 hover:text-dark-foreground"
    }`;
  }

  return (
    <div className="flex h-full flex-col gap-5 bg-gradient-to-b from-dark-2 to-dark p-4 text-dark-foreground">
      <div className="flex items-center justify-between px-1 pt-2">
        <Wordmark href="/admin" dark nameOverride="Admin" />
        <LanguageToggle />
      </div>

      <span className="ml-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_2px_rgba(245,194,17,0.7)]" />
        {t(ui.admin.modeBadge)}
      </span>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={linkClass(item.href)}
            >
              <ItemIcon className="h-5 w-5 shrink-0" />
              {t(item.label)}
              {isActive(item.href) && (
                <ChevronDownIcon className="ml-auto h-3.5 w-3.5 -rotate-90 opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1.5 border-t border-dark-border pt-3">
        <Link
          href="/panel"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-dark-subtle transition-all hover:bg-white/5 hover:text-dark-foreground"
        >
          <PanelIcon className="h-5 w-5 shrink-0" />
          {t(ui.admin.backToApp)}
        </Link>

        <div className="mt-1 rounded-xl bg-white/5 p-3 ring-1 ring-dark-border">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brown text-brown-foreground">
              <UserIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-dark-foreground">
                {user?.name || user?.username}
              </span>
              <span className="block truncate text-xs text-dark-subtle">{user?.username}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dark-border py-2 text-xs font-semibold text-dark-subtle transition-colors hover:text-danger"
          >
            <LogoutIcon className="h-4 w-4" />
            {t(ui.nav.logout)}
          </button>
        </div>
      </div>
    </div>
  );
}
