"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { exchangeOAuthCode } from "@/lib/api/auth";
import { Spinner } from "@/components/ui/Spinner";
import { LinkButton } from "@/components/ui/Button";

export function OAuthCallback() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);
  const exchanged = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || exchanged.current) {
      if (!code) setFailed(true);
      return;
    }
    exchanged.current = true;

    exchangeOAuthCode(code)
      .then((response) => {
        signIn(response.jwtToken, response.refreshToken, response.username);
        router.replace("/panel");
      })
      .catch(() => setFailed(true));
  }, [searchParams, signIn, router]);

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-danger">{t(ui.common.genericError)}</p>
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
