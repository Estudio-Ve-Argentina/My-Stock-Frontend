"use client";

import { useState, type FormEvent } from "react";
import { PLAN_PRESENTATION, configIdFromBackend } from "@/config/app.config";
import type { SubscriptionStatus } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { updateProfile, changePassword } from "@/lib/api/user";
import { resendVerification } from "@/lib/api/auth";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button, LinkButton } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { LogoutIcon, CheckIcon } from "./icons";

function subscriptionLabel(status: SubscriptionStatus, t: (v: { es: string; en: string }) => string): string {
  if (status === "AUTHORIZED") return t(ui.plans.subscriptionActive);
  if (status === "PENDING") return t(ui.plans.subscriptionPending);
  return t(ui.plans.subscriptionPaused);
}

function ProfileSection() {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user?.userId) return;
    setError(null);
    setPending(true);
    setSaved(false);
    try {
      await updateProfile(user.userId, { name, lastName: lastName || undefined });
      refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (caught) {
      setError(resolveErrorMessage(caught, t));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
        {t(ui.account.profile)}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={t(ui.auth.name)}
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label={t(ui.auth.lastname)}
            name="lastname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? <Spinner /> : t(ui.common.save)}
          </Button>
          {saved && (
            <span className="text-sm font-medium text-brand-dark">
              {t(ui.account.profileSaved)}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function ChangePasswordSection() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user?.userId) return;
    setError(null);
    setPending(true);
    setSaved(false);
    try {
      await changePassword(user.userId, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (caught) {
      setError(resolveErrorMessage(caught, t));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="mb-4 font-heading text-lg font-bold text-foreground">
        {t(ui.account.changePassword)}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          label={t(ui.account.currentPassword)}
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <TextField
          label={t(ui.account.newPassword)}
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? <Spinner /> : t(ui.account.changePassword)}
          </Button>
          {saved && (
            <span className="text-sm font-medium text-brand-dark">
              {t(ui.account.passwordChanged)}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function EmailVerificationSection() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { show } = useToast();
  const [sending, setSending] = useState(false);

  async function handleResend() {
    if (!user?.username || sending) return;
    setSending(true);
    try {
      await resendVerification(user.username);
      show(t(ui.account.verificationSent));
    } catch {
      show(t(ui.common.genericError));
    } finally {
      setSending(false);
    }
  }

  if (user?.emailVerified) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-6">
        <CheckIcon className="h-5 w-5 shrink-0 text-brand-dark" />
        <p className="text-sm font-medium text-brand-dark">
          {t(ui.account.emailVerified)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:flex-row sm:items-center">
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900">
          {t(ui.account.verifyEmail)}
        </p>
        <p className="mt-0.5 text-xs text-amber-700">{user?.username}</p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={handleResend}
        disabled={sending}
      >
        {sending ? <Spinner /> : t(ui.account.resendVerification)}
      </Button>
    </div>
  );
}

export function AccountView() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { products } = useProducts(user?.username);

  const planConfigId = configIdFromBackend(user?.planName ?? "FREE");
  const planLabel = t(PLAN_PRESENTATION[planConfigId].name);
  const activeCount = products.filter((p) => p.active).length;
  const usage =
    user?.maxProducts === null || user?.maxProducts === undefined
      ? t(ui.account.unlimited)
      : `${activeCount} / ${user.maxProducts}`;

  const fullName = [user?.name, user?.lastName].filter(Boolean).join(" ");
  const displayName = fullName || user?.username;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {displayName}
        </h1>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm text-subtle">{t(ui.account.data)}</p>
          <button
            type="button"
            onClick={signOut}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-danger px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-danger/85"
          >
            <LogoutIcon className="h-4 w-4" />
            {t(ui.account.logout)}
          </button>
        </div>
      </header>

      <EmailVerificationSection />

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brown text-2xl font-bold text-brown-foreground">
          {(user?.name || user?.username)?.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="font-heading text-lg font-bold text-foreground">
            {fullName || user?.username}
          </p>
          <p className="text-sm text-subtle">
            {user?.username}
            {user?.emailVerified && (
              <span className="ml-2 inline-flex items-center gap-1 text-brand-dark">
                <CheckIcon className="h-3.5 w-3.5" />
                {t(ui.account.emailVerified)}
              </span>
            )}
          </p>
          <p className="text-xs text-subtle">
            {planLabel} · {usage} {t(ui.account.productsUsed)}
          </p>
        </div>
      </div>

      <ProfileSection />

      {user?.hasPassword && <ChangePasswordSection />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 text-brand-foreground">
          <p className="text-xs font-medium uppercase tracking-wide opacity-80">
            {t(ui.account.plan)}
          </p>
          <p className="mt-1 font-heading text-2xl font-bold tracking-tight">
            {planLabel}
          </p>
          {user?.subscriptionStatus && (
            <p className="mt-1 text-xs opacity-80">
              {subscriptionLabel(user.subscriptionStatus, t)}
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

    </div>
  );
}
