"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Wordmark } from "@/components/ui/Wordmark";
import { MenuIcon } from "@/components/app/icons";
import { AdminSidebarNav } from "./AdminSidebarNav";

export function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 lg:block">
        <AdminSidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label={t(ui.nav.menu)}
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-foreground"
          >
            <MenuIcon />
          </button>
          <Wordmark href="/admin" nameOverride="Admin" />
          <span className="w-10" />
        </header>

        <main className="relative flex-1">
          <div className="texture-dots pointer-events-none absolute inset-0 opacity-100" />
          <div className="relative mx-auto w-full max-w-6xl px-5 py-8">{children}</div>
        </main>
      </div>

      <AnimatePresence>
        {open && (
          <div className="lg:hidden">
            <motion.div
              className="fixed inset-0 z-40 bg-foreground/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col bg-dark shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            >
              <div className="flex-1 overflow-y-auto">
                <AdminSidebarNav onNavigate={() => setOpen(false)} />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
