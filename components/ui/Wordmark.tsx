import Link from "next/link";
import { appConfig } from "@/config/app.config";

interface WordmarkProps {
  href?: string;
  dark?: boolean;
  large?: boolean;
}

export function Wordmark({ href = "/", dark = false, large = false }: WordmarkProps) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <span
        className={`flex items-center justify-center font-bold ${
          large ? "h-11 w-11 rounded-2xl text-xl" : "h-8 w-8 rounded-xl text-base"
        } ${
          dark
            ? "bg-neon text-dark shadow-[0_6px_18px_-4px_rgba(52,240,138,0.9)]"
            : "bg-brand text-brand-foreground"
        }`}
      >
        M
      </span>
      <span
        className={`font-heading font-bold tracking-tight ${
          large ? "text-2xl" : "text-lg"
        } ${
          dark ? "text-dark-foreground" : "text-foreground"
        }`}
      >
        {appConfig.name}
      </span>
    </Link>
  );
}
