import type { ReactNode } from "react";
import { AuthPreviewPanel } from "@/components/auth/AuthPreviewPanel";
import { BackToHomeLink } from "@/components/auth/BackToHomeLink";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <nav className="relative z-10 flex shrink-0 justify-end px-6 py-3 lg:hidden">
        <BackToHomeLink />
      </nav>

      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block lg:w-[55%]">
          <AuthPreviewPanel />
        </div>

        <main className="relative flex w-full flex-1 items-center justify-center px-6 pb-6 lg:w-[45%] lg:py-8">
          <div className="absolute right-6 top-6 z-10 hidden lg:block">
            <BackToHomeLink />
          </div>
          <div className="texture-dots texture-fade pointer-events-none absolute inset-0 opacity-100" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/15 blur-[110px]" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
          <div className="relative w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
