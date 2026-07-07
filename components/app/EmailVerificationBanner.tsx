"use client";

import { useState } from "react";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { resendVerification } from "@/lib/api/auth";
import { CloseIcon } from "./icons";

export function EmailVerificationBanner() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { show } = useToast();
  const [hidden, setHidden] = useState(false);
  const [sending, setSending] = useState(false);

  if (hidden) return null;

  async function handleResend() {
    if (!user?.username || sending) return;
    setSending(true);
    try {
      await resendVerification(user.username);
      setHidden(true);
      show(t(ui.account.verificationSent));
    } catch {
      show(t(ui.common.genericError));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
      <p className="flex-1">
        {t(ui.account.verifyEmail)}
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          className="ml-2 cursor-pointer font-semibold text-brand-dark hover:underline disabled:opacity-50"
        >
          {t(ui.account.resendVerification)}
        </button>
      </p>
      <button
        type="button"
        onClick={() => setHidden(true)}
        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-amber-600 hover:text-amber-900"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
