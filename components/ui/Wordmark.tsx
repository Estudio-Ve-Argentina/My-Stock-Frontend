import Link from "next/link";
import { appConfig } from "@/config/app.config";

interface WordmarkProps {
  href?: string;
  dark?: boolean;
}

export function Wordmark({ href = "/", dark = false }: WordmarkProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-xl text-base font-bold ${
          dark
            ? "bg-neon text-dark shadow-[0_6px_18px_-4px_rgba(52,240,138,0.9)]"
            : "bg-brand text-brand-foreground"
        }`}
      >
        M
      </span>
      <span
        className={`font-heading text-lg font-bold tracking-tight ${
          dark ? "text-dark-foreground" : "text-foreground"
        }`}
      >
        {appConfig.name}
      </span>
    </Link>
  );
}
