"use client";

import { useMemo, useState } from "react";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useMovements } from "@/hooks/useMovements";
import { useBranches } from "@/hooks/useBranches";
import { Spinner } from "@/components/ui/Spinner";
import { MovementItem } from "./MovementItem";
import type { Movement } from "@/config/site.types";

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function dateLabel(key: string, locale: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (key === todayKey) return locale === "es" ? "Hoy" : "Today";
  if (key === yesterdayKey) return locale === "es" ? "Ayer" : "Yesterday";

  return new Date(key + "T12:00:00").toLocaleDateString(
    locale === "es" ? "es-AR" : "en-US",
    { weekday: "long", day: "numeric", month: "long" },
  );
}

function groupByDate(movements: Movement[]): Map<string, Movement[]> {
  const groups = new Map<string, Movement[]>();
  for (const movement of movements) {
    const key = dateKey(movement.at);
    const group = groups.get(key);
    if (group) {
      group.push(movement);
    } else {
      groups.set(key, [movement]);
    }
  }
  return groups;
}

export function HistorialView() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { movements, loading } = useMovements(user?.userId);
  const { branches } = useBranches();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterBranch, setFilterBranch] = useState("");

  const filtered = useMemo(() => {
    let result = movements;

    if (from || to) {
      result = result.filter((m) => {
        const day = dateKey(m.at);
        if (from && day < from) return false;
        if (to && day > to) return false;
        return true;
      });
    }

    if (filterBranch) {
      result = result.filter((m) => m.branchName === filterBranch);
    }

    return result;
  }, [movements, from, to, filterBranch]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const hasFilters = from || to || filterBranch;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.history.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.history.subtitle)}</p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-subtle">{t(ui.history.filterFrom)}</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-subtle">{t(ui.history.filterTo)}</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-brand"
          />
        </label>
        {branches.length > 1 && (
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-subtle">{t(ui.products.branchLabel)}</span>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="select-field truncate rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-brand sm:max-w-40"
            >
              <option value="">{t(ui.common.all)}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {hasFilters && (
          <button
            type="button"
            onClick={() => { setFrom(""); setTo(""); setFilterBranch(""); }}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-subtle transition-colors hover:text-foreground"
          >
            {t(ui.common.cancel)}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-brand">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/40 py-16 text-center text-sm text-subtle">
          {t(ui.history.empty)}
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {[...grouped.entries()].map(([key, items]) => (
            <section key={key} className="flex flex-col gap-2.5">
              <h2 className="font-heading text-base font-bold capitalize tracking-wide text-foreground">
                {dateLabel(key, locale)}
              </h2>
              <ul className="flex flex-col gap-2">
                {items.map((movement) => (
                  <MovementItem key={movement.id} movement={movement} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
