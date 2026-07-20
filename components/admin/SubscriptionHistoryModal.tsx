"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { AdminSubscriptionResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Spinner } from "@/components/ui/Spinner";

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface SubscriptionHistoryModalProps {
  open: boolean;
  loading: boolean;
  history: AdminSubscriptionResponse[];
  onClose: () => void;
}

export function SubscriptionHistoryModal({
  open,
  loading,
  history,
  onClose,
}: SubscriptionHistoryModalProps) {
  const { t, locale } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-dark/50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-brand/25 bg-surface shadow-[0_20px_60px_-12px_rgba(22,163,74,0.25)]"
          >
            <div className="h-1 bg-gradient-to-r from-brand via-neon to-brand/40" />

            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>

            <div className="max-h-[70vh] overflow-y-auto p-6 pt-5">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {t(ui.admin.historyTitle)}
              </h2>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="text-brand" />
                </div>
              ) : history.length === 0 ? (
                <p className="mt-4 text-sm text-subtle">{t(ui.admin.historyEmpty)}</p>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-border bg-background/60 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          {entry.planName}
                        </span>
                        <span className="text-xs font-medium text-subtle">{entry.status}</span>
                      </div>
                      <p className="mt-1 text-xs text-subtle">
                        {t(ui.admin.columnCreatedAt)}: {formatDate(entry.createdAt, locale)}
                      </p>
                      {entry.nextPaymentDate && (
                        <p className="text-xs text-subtle">
                          {t(ui.admin.columnNextPayment)}: {formatDate(entry.nextPaymentDate, locale)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
