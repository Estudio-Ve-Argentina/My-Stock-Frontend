import type { ReactNode } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-10">
        <Wordmark />
        <LanguageToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
