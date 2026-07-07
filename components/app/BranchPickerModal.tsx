"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BranchResponse } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";

interface BranchPickerModalProps {
  open: boolean;
  branches: BranchResponse[];
  disabledIds: Set<number>;
  onSelect: (branch: BranchResponse) => void;
  onClose: () => void;
}

export function BranchPickerModal({
  open,
  branches,
  disabledIds,
  onSelect,
  onClose,
}: BranchPickerModalProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return branches;
    return branches.filter((b) => b.name.toLowerCase().includes(term));
  }, [branches, search]);

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
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-brand/25 bg-surface shadow-[0_20px_60px_-12px_rgba(22,163,74,0.25)]"
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

            <div className="p-6 pt-5">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {t(ui.products.selectBranch)}
              </h2>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(ui.products.searchBranch)}
                autoFocus
                className="mt-3 w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10"
              />

              <ul className="mt-3 flex max-h-60 flex-col gap-1 overflow-y-auto">
                {filtered.map((branch) => {
                  const disabled = disabledIds.has(branch.id);
                  return (
                    <li key={branch.id}>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          onSelect(branch);
                          onClose();
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                          disabled
                            ? "cursor-not-allowed opacity-40"
                            : "cursor-pointer hover:bg-brand-soft/15"
                        }`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-subtle">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {branch.name}
                          </span>
                          {branch.address && (
                            <span className="truncate text-xs text-subtle">
                              {branch.address}
                            </span>
                          )}
                        </div>
                        {disabled && (
                          <span className="ml-auto shrink-0 text-xs font-medium text-subtle">
                            ✓
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && (
                  <li className="py-6 text-center text-sm text-subtle">
                    {t(ui.products.noResults)}
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
