"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Spinner } from "@/components/ui/Spinner";
import { GoogleButton } from "./GoogleButton";

export function LoginForm() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/panel";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await login({ username, password });
      signIn(response.jwtToken, response.username);
      router.replace(next);
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.status === 401
          ? t(ui.auth.invalid)
          : t(ui.common.genericError),
      );
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-7 shadow-sm">
      <h1 className="mb-6 font-heading text-2xl font-bold tracking-tight text-foreground">
        {t(ui.auth.loginTitle)}
      </h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          label={t(ui.auth.username)}
          name="username"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextField
          label={t(ui.auth.password)}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" variant="primary" fullWidth disabled={pending}>
          {pending ? <Spinner /> : t(ui.auth.loginCta)}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-subtle">
        <span className="h-px flex-1 bg-border" />
        {t(ui.auth.or)}
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />

      <p className="mt-6 text-center text-sm font-medium text-subtle">
        {t(ui.auth.noAccount)}{" "}
        <Link href="/signup" className="font-semibold text-brand-dark hover:underline">
          {t(ui.auth.goSignup)}
        </Link>
      </p>
    </div>
  );
}
