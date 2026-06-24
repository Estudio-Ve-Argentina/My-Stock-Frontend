"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "primary",
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

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
          <div
            className="absolute inset-0 bg-dark/50"
            onClick={onCancel}
          />
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
              onClick={onCancel}
              className="absolute right-3 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>

            <div className="p-6 pt-5">
              <h2 className="font-heading text-lg font-bold text-foreground">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm text-subtle">{description}</p>
              )}
              {children && <div className="mt-4">{children}</div>}
              <div className="mt-6 flex gap-3">
                {cancelLabel && (
                  <Button variant="outline" fullWidth onClick={onCancel}>
                    {cancelLabel}
                  </Button>
                )}
                <Button
                  ref={confirmRef}
                  variant={variant === "danger" ? "danger" : "primary"}
                  fullWidth
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
