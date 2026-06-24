"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { signup } from "@/lib/api/auth";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { GoogleButton } from "./GoogleButton";

export function SignupForm() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(field: keyof typeof form) {
    return (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await signup(form);
      signIn(response.jwtToken, response.refreshToken, response.username);
      router.replace("/panel");
    } catch {
      setError(t(ui.common.genericError));
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
      <h1 className="mb-6 font-heading text-2xl font-bold tracking-tight text-foreground">
        {t(ui.auth.signupTitle)}
      </h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={t(ui.auth.name)}
            name="name"
            autoComplete="given-name"
            required
            value={form.name}
            onChange={update("name")}
          />
          <TextField
            label={t(ui.auth.lastname)}
            name="lastname"
            autoComplete="family-name"
            required
            value={form.lastname}
            onChange={update("lastname")}
          />
        </div>
        <TextField
          label={t(ui.auth.username)}
          name="username"
          autoComplete="username"
          required
          value={form.username}
          onChange={update("username")}
        />
        <TextField
          label={t(ui.auth.password)}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={form.password}
          onChange={update("password")}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? <Spinner /> : t(ui.auth.signupCta)}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-subtle">
        <span className="h-px flex-1 bg-border" />
        {t(ui.auth.or)}
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />

      <p className="mt-6 text-center text-sm font-medium text-subtle">
        {t(ui.auth.hasAccount)}{" "}
        <Link href="/login" className="font-semibold text-brand-dark hover:underline">
          {t(ui.auth.goLogin)}
        </Link>
      </p>
    </div>
  );
}
