"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { signup } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
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
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  function update(field: keyof typeof form) {
    return (event: { target: { value: string } }) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setFieldErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    };
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);
    try {
      const response = await signup({
        email: form.email,
        password: form.password,
        name: form.name,
        lastname: form.lastname || undefined,
      });
      signIn(response.jwtToken, response.refreshToken, response.username);
      router.replace("/panel");
    } catch (caught) {
      if (caught instanceof ApiError) {
        if (Object.keys(caught.fieldErrors).length > 0) {
          setFieldErrors(caught.fieldErrors);
        }
        setError(caught.message || t(ui.common.genericError));
      } else {
        setError(t(ui.common.genericError));
      }
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
      <h1 className="mb-4 font-heading text-2xl font-bold tracking-tight text-foreground sm:mb-6">
        {t(ui.auth.signupTitle)}
      </h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:gap-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={t(ui.auth.name)}
            name="name"
            autoComplete="given-name"
            required
            value={form.name}
            onChange={update("name")}
            error={fieldErrors.name}
          />
          <TextField
            label={t(ui.auth.lastname)}
            name="lastname"
            autoComplete="family-name"
            value={form.lastname}
            onChange={update("lastname")}
            error={fieldErrors.lastname}
          />
        </div>
        <TextField
          label={t(ui.auth.email)}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
          error={fieldErrors.email}
        />
        <TextField
          label={t(ui.auth.password)}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={form.password}
          onChange={update("password")}
          error={fieldErrors.password}
        />

        {error && !Object.keys(fieldErrors).length && (
          <p className="text-sm text-danger">{error}</p>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? <Spinner /> : t(ui.auth.signupCta)}
        </Button>
      </form>

      <div className="my-3 flex items-center gap-3 text-xs text-subtle sm:my-5">
        <span className="h-px flex-1 bg-border" />
        {t(ui.auth.or)}
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />

      <p className="mt-4 text-center text-sm font-medium text-subtle sm:mt-6">
        {t(ui.auth.hasAccount)}{" "}
        <Link href="/login" className="font-semibold text-brand-dark hover:underline">
          {t(ui.auth.goLogin)}
        </Link>
      </p>
    </div>
  );
}
