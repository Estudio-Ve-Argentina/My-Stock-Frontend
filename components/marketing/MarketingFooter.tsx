import { appConfig } from "@/config/app.config";
import { Wordmark } from "@/components/ui/Wordmark";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-subtle md:flex-row md:items-center md:px-8">
        <Wordmark />
        <p>
          © {new Date().getFullYear()} {appConfig.name} · {appConfig.support.site}
        </p>
      </div>
    </footer>
  );
}
