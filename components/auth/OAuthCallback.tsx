"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { exchangeOAuthCode, fetchMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { Spinner } from "@/components/ui/Spinner";
import { LinkButton } from "@/components/ui/Button";

const ONBOARDED_KEY = "mystock_onboarded";

function looksLikeFallbackName(name: string, email: string): boolean {
  const emailPrefix = email.split("@")[0];
  return name === emailPrefix || !name;
}

export function OAuthCallback() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const exchanged = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || exchanged.current) {
      if (!code) setFailed(true);
      return;
    }
    exchanged.current = true;

    exchangeOAuthCode(code)
      .then(async (response) => {
        signIn(response.jwtToken, response.refreshToken, response.username);
        const alreadyOnboarded = localStorage.getItem(ONBOARDED_KEY);
        if (alreadyOnboarded) {
          router.replace("/panel");
          return;
        }
        try {
          const me = await fetchMe();
          const isNew = looksLikeFallbackName(me.name, me.username);
          router.replace(isNew ? "/onboarding" : "/panel");
          if (!isNew) localStorage.setItem(ONBOARDED_KEY, "1");
        } catch {
          router.replace("/panel");
        }
      })
      .catch((e) => {
        if (e instanceof ApiError) setErrorMessage(e.message);
        setFailed(true);
      });
  }, [searchParams, signIn, router]);

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-danger">{errorMessage || t(ui.common.genericError)}</p>
        <LinkButton href="/login" variant="outline">
          {t(ui.auth.loginCta)}
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-subtle">
      <Spinner className="text-brand" />
      <p className="text-sm">{t(ui.auth.signingIn)}</p>
    </div>
  );
}
