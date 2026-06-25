"use client";

import { appConfig, configIdFromBackend } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { Button, LinkButton } from "@/components/ui/Button";
import { LogoutIcon } from "./icons";

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AccountView() {
  const { t, locale } = useLanguage();
  const { user, signOut } = useAuth();
  const { products } = useProducts(user?.username);

  const planConfigId = configIdFromBackend(user?.planName ?? "FREE");
  const planConfig = appConfig.plans.find((p) => p.id === planConfigId) ?? appConfig.plans[0];
  const planLabel = t(planConfig.name);
  const activeCount = products.filter((p) => p.active).length;
  const usage =
    user?.maxProducts === null || user?.maxProducts === undefined
      ? t(ui.account.unlimited)
      : `${activeCount} / ${user.maxProducts}`;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.account.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.account.data)}</p>
      </header>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brown text-2xl font-bold text-brown-foreground">
          {user?.username?.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="font-heading text-lg font-bold text-foreground">
            @{user?.username}
          </p>
          <p className="text-sm text-subtle">
            {planLabel} · {usage} {t(ui.account.productsUsed)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 text-brand-foreground">
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">
            {t(ui.account.plan)}
          </p>
          <p className="mt-1 font-heading text-2xl font-bold tracking-tight">
            {planLabel}
          </p>
          {user?.planExpiresAt && (
            <p className="mt-1 text-xs opacity-80">
              {t(ui.plans.expires)}{": "}
              {formatDate(user.planExpiresAt, locale)}
              {" · "}
              {user.autoRenew
                ? t(ui.plans.renewalActive)
                : t(ui.plans.renewalCancelled)}
            </p>
          )}
          <LinkButton href="/mi-plan" variant="accent" size="sm" className="mt-4">
            {t(ui.account.upgradeCta)}
          </LinkButton>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-subtle">
            {t(ui.account.usage)}
          </p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-foreground">
            {usage}
          </p>
          <p className="text-sm text-subtle">{t(ui.account.productsUsed)}</p>
        </div>
      </div>

      <Button variant="outline" onClick={signOut} className="self-start">
        <LogoutIcon className="h-4 w-4" />
        {t(ui.account.logout)}
      </Button>
    </div>
  );
}
