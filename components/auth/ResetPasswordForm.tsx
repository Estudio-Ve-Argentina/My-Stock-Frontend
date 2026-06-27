"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";

export function ResetPasswordForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setError(null);
    setPending(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (caught) {
      const backendMsg = caught instanceof ApiError ? caught.message : "";
      setError(backendMsg || t(ui.common.genericError));
    } finally {
      setPending(false);
    }
  }

  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm text-center">
        <p className="text-sm text-danger">{t(ui.common.genericError)}</p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-semibold text-brand-dark hover:underline"
        >
          {t(ui.auth.goLogin)}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
        <h1 className="mb-4 font-heading text-2xl font-bold tracking-tight text-foreground">
          {t(ui.auth.resetPasswordTitle)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.auth.resetPasswordSuccess)}</p>
        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-semibold text-brand-dark hover:underline"
        >
          {t(ui.auth.loginCta)}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
      <h1 className="mb-6 font-heading text-2xl font-bold tracking-tight text-foreground">
        {t(ui.auth.resetPasswordTitle)}
      </h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          label={t(ui.auth.newPassword)}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? <Spinner /> : t(ui.auth.resetPasswordCta)}
        </Button>
      </form>
    </div>
  );
}
