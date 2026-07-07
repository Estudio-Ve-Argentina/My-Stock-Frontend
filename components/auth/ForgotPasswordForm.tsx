"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { forgotPassword } from "@/lib/api/auth";
import { resolveErrorMessage } from "@/lib/error-utils";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";

export function ForgotPasswordForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (caught) {
      setError(resolveErrorMessage(caught, t));
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
        <h1 className="mb-4 font-heading text-2xl font-bold tracking-tight text-foreground">
          {t(ui.auth.forgotPasswordTitle)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.auth.forgotPasswordSuccess)}</p>
        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-semibold text-brand-dark hover:underline"
        >
          {t(ui.auth.goLogin)}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
      <h1 className="mb-2 font-heading text-2xl font-bold tracking-tight text-foreground">
        {t(ui.auth.forgotPasswordTitle)}
      </h1>
      <p className="mb-6 text-sm text-subtle">{t(ui.auth.forgotPasswordSubtitle)}</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          label={t(ui.auth.email)}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? <Spinner /> : t(ui.auth.forgotPasswordCta)}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm font-medium text-subtle">
        <Link href="/login" className="font-semibold text-brand-dark hover:underline">
          {t(ui.auth.goLogin)}
        </Link>
      </p>
    </div>
  );
}
