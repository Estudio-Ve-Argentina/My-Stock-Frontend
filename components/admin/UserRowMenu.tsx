"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";

interface UserRowMenuProps {
  onEdit: () => void;
  onAssignPlan: () => void;
  onCancelPlan: () => void;
  onViewHistory: () => void;
  onDelete: () => void;
  showCancelPlan: boolean;
}

export function UserRowMenu({
  onEdit,
  onAssignPlan,
  onCancelPlan,
  onViewHistory,
  onDelete,
  showCancelPlan,
}: UserRowMenuProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 260;
        setDropUp(rect.bottom + dropdownHeight > window.innerHeight);
      }
      return !prev;
    });
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-subtle transition-colors hover:bg-muted hover:text-foreground"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute right-0 z-20 min-w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-[0_12px_36px_-8px_rgba(22,163,74,0.18)] ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
              <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
            {t(ui.admin.editUser)}
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAssignPlan();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            {t(ui.admin.assignPlan)}
          </button>

          {showCancelPlan && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCancelPlan();
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6M9 9l6 6" />
              </svg>
              {t(ui.admin.cancelPlan)}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onViewHistory();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/15"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            {t(ui.admin.viewHistory)}
          </button>

          <div className="mx-3 my-1 h-px bg-border/60" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/8"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />
            </svg>
            {t(ui.common.delete)}
          </button>
        </div>
      )}
    </div>
  );
}
