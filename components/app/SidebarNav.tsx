"use client";

import { type ComponentType, type SVGProps, useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Localized } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NeonScrollbar } from "@/components/ui/NeonScrollbar";
import {
  PanelIcon,
  PlusIcon,
  BoxIcon,
  ClockIcon,
  TagIcon,
  TruckIcon,
  BuildingIcon,
  PinIcon,
  ChartIcon,
  FileIcon,
  SparkIcon,
  UserIcon,
  LogoutIcon,
  ChevronDownIcon,
} from "./icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  href: string;
  label: Localized;
  icon: Icon;
}

interface NavGroup {
  label: Localized;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: ui.nav.groupProducts,
    items: [
      { href: "/cargar", label: ui.nav.create, icon: PlusIcon },
      { href: "/productos", label: ui.nav.products, icon: BoxIcon },
      { href: "/historial", label: ui.nav.history, icon: ClockIcon },
    ],
  },
  {
    label: ui.nav.groupOrganization,
    items: [
      { href: "/categorias", label: ui.nav.categories, icon: TagIcon },
      { href: "/proveedores", label: ui.nav.suppliers, icon: TruckIcon },
      { href: "/sucursales", label: ui.nav.branches, icon: BuildingIcon },
      { href: "/favoritos", label: ui.nav.favorites, icon: PinIcon },
    ],
  },
  {
    label: ui.nav.groupReports,
    items: [
      { href: "/metricas", label: ui.nav.metrics, icon: ChartIcon },
      { href: "/informes", label: ui.nav.reports, icon: FileIcon },
    ],
  },
];

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const toggleGroup = useCallback((index: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  function linkClass(href: string): string {
    const active = pathname === href;
    return `group relative mr-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
      active
        ? "bg-gradient-to-r from-brand to-brand-dark text-brand-foreground ring-1 ring-neon/40 shadow-[0_10px_28px_-8px_rgba(52,240,138,0.65)]"
        : "text-dark-subtle hover:bg-white/5 hover:text-dark-foreground"
    }`;
  }

  return (
    <div className="flex h-full flex-col gap-6 bg-gradient-to-b from-dark-2 to-dark p-4 text-dark-foreground">
      <div className="flex items-center justify-between px-1 pt-2">
        <Link href="/panel" onClick={onNavigate} className="inline-flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon text-base font-bold text-dark shadow-[0_6px_18px_-4px_rgba(52,240,138,0.9)]">
            M
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-dark-foreground">
            My-Stock
          </span>
        </Link>
        <LanguageToggle />
      </div>

      <NeonScrollbar className="min-h-0 flex-1">
        <nav className="flex flex-col gap-0.5">
          <Link href="/panel" onClick={onNavigate} className={linkClass("/panel")}>
            <PanelIcon className="h-5 w-5 shrink-0" />
            {t(ui.nav.panel)}
          </Link>

          {NAV_GROUPS.map((group, index) => {
            const hasActiveChild = group.items.some((item) => pathname === item.href);
            const isCollapsed = collapsed.has(index) && !hasActiveChild;
            return (
              <div key={index} className="mt-3">
                <button
                  type="button"
                  onClick={() => toggleGroup(index)}
                  className="flex w-full cursor-pointer items-center gap-2 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-dark-subtle/60 transition-colors hover:text-dark-subtle"
                >
                  <motion.span
                    animate={{ rotate: isCollapsed ? -90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDownIcon className="h-3 w-3" />
                  </motion.span>
                  {t(group.label)}
                </button>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-0.5 flex flex-col gap-0.5">
                        {group.items.map((entry) => {
                          const EntryIcon = entry.icon;
                          return (
                            <Link
                              key={entry.href}
                              href={entry.href}
                              onClick={onNavigate}
                              className={linkClass(entry.href)}
                            >
                              <EntryIcon className="h-5 w-5 shrink-0" />
                              {t(entry.label)}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </NeonScrollbar>

      <div className="flex flex-col gap-1.5 border-t border-dark-border pt-3">
        <Link href="/mi-plan" onClick={onNavigate} className={linkClass("/mi-plan")}>
          <SparkIcon className="h-5 w-5 shrink-0" />
          {t(ui.nav.plans)}
        </Link>

        <div className="mt-1 rounded-xl bg-white/5 p-3 ring-1 ring-dark-border">
          <Link href="/cuenta" onClick={onNavigate} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brown text-brown-foreground">
              <UserIcon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-dark-foreground">
                {user?.name || user?.username}
              </span>
              <span className="block truncate text-xs text-dark-subtle">{user?.username}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dark-border py-2 text-xs font-semibold text-dark-subtle transition-colors hover:text-danger"
          >
            <LogoutIcon className="h-4 w-4" />
            {t(ui.nav.logout)}
          </button>
        </div>
      </div>
    </div>
  );
}
