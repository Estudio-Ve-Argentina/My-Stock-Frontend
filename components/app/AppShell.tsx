"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Wordmark } from "@/components/ui/Wordmark";
import { EmailVerificationBanner } from "./EmailVerificationBanner";
import { SidebarNav } from "./SidebarNav";
import { MenuIcon, CloseIcon } from "./icons";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 lg:block">
        <SidebarNav />
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
          <Wordmark href="/panel" />
          <span className="w-10" />
        </header>

        {user && !user.emailVerified && <EmailVerificationBanner />}

        <main className="relative flex-1">
          <div className="texture-dots pointer-events-none absolute inset-0 opacity-100" />
          <div className="relative mx-auto w-full max-w-5xl px-5 py-8">{children}</div>
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
              <button
                type="button"
                aria-label={t(ui.nav.close)}
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-dark-subtle hover:bg-white/10"
              >
                <CloseIcon />
              </button>
              <div className="flex-1 overflow-y-auto">
                <SidebarNav onNavigate={() => setOpen(false)} />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
