"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/app/icons";

interface MultiSelectItem {
  id: number;
  name: string;
}

interface MultiSelectDropdownProps {
  items: MultiSelectItem[];
  selectedIds: Set<number>;
  onChange: (ids: Set<number>) => void;
  allLabel: string;
  selectedLabel: string;
}

export function MultiSelectDropdown({
  items,
  selectedIds,
  onChange,
  allLabel,
  selectedLabel,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allSelected = selectedIds.size === 0;

  const displayText = allSelected
    ? allLabel
    : selectedIds.size === 1
      ? (items.find((i) => selectedIds.has(i.id))?.name ?? allLabel)
      : `${selectedIds.size} ${selectedLabel}`;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleToggle = useCallback(
    (id: number) => {
      if (allSelected) {
        const next = new Set(items.map((i) => i.id));
        next.delete(id);
        onChange(next);
      } else if (selectedIds.has(id)) {
        const next = new Set(selectedIds);
        next.delete(id);
        if (next.size === 0) onChange(new Set());
        else onChange(next);
      } else {
        const next = new Set(selectedIds);
        next.add(id);
        if (next.size === items.length) onChange(new Set());
        else onChange(next);
      }
    },
    [allSelected, selectedIds, items, onChange],
  );

  const handleSelectAll = useCallback(() => {
    onChange(new Set());
    setOpen(false);
  }, [onChange]);

  if (items.length === 0) return null;

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full cursor-pointer items-center justify-between gap-1 rounded-xl border bg-surface px-3 py-2.5 text-sm font-medium outline-none transition-all sm:gap-2 sm:px-4 sm:min-w-48 ${
          open
            ? "border-brand ring-4 ring-brand/10"
            : "border-border hover:border-brand/40"
        } ${allSelected ? "text-foreground" : "text-brand"}`}
      >
        <span className="line-clamp-1 text-left">{displayText}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-subtle transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-full min-w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)] sm:w-auto">
          <button
            type="button"
            onClick={handleSelectAll}
            className={`flex w-full items-center gap-2.5 border-b border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-soft/10 ${
              allSelected ? "text-brand" : "text-subtle"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                allSelected
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface"
              }`}
            >
              {allSelected && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>
            {allLabel}
          </button>

          <div className="max-h-56 overflow-y-auto py-1">
            {items.map((item) => {
              const checked = allSelected || selectedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors hover:bg-brand-soft/10"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      checked
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-surface"
                    }`}
                  >
                    {checked && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`truncate ${checked ? "font-medium text-foreground" : "text-subtle"}`}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
