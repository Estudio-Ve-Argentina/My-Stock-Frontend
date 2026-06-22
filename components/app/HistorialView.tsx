"use client";

import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useMovements } from "@/hooks/useMovements";
import { Spinner } from "@/components/ui/Spinner";
import { MovementItem } from "./MovementItem";

export function HistorialView() {
  const { t } = useLanguage();
  const { movements, loading } = useMovements();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.history.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.history.subtitle)}</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16 text-brand">
          <Spinner />
        </div>
      ) : movements.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-muted/40 py-16 text-center text-sm text-subtle">
          {t(ui.history.empty)}
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {movements.map((movement) => (
            <MovementItem key={movement.id} movement={movement} />
          ))}
        </ul>
      )}
    </div>
  );
}
