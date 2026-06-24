"use client";

import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const contactInfo = [
  { icon: PhoneIcon, label: "+54 9 223 668 0996", href: "https://wa.me/5492236680996" },
  { icon: MailIcon, label: "info@estudiove.com", href: "mailto:info@estudiove.com" },
];

export function MarketingContact() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-6 pt-12 md:px-8 md:pb-12 md:pt-24">
      <div className="grid gap-8 md:gap-12 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-4 md:gap-6">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-4xl">
              {t(ui.contact.title)}
            </h2>
            <p className="mt-2 max-w-md text-sm text-subtle md:mt-3 md:text-lg">
              {t(ui.contact.subtitle)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex cursor-pointer items-center gap-2 text-foreground transition-colors hover:text-brand"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand-dark transition-colors group-hover:bg-brand group-hover:text-brand-foreground md:h-8 md:w-8">
                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </span>
                  <span className="text-xs font-medium md:text-sm">{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-4 shadow-[0_8px_30px_-8px_rgba(22,163,74,0.15)] md:gap-4 md:rounded-2xl md:p-6"
        >
          <TextField label={t(ui.contact.nameLabel)} name="name" required />
          <TextField label={t(ui.contact.emailLabel)} name="email" type="email" required />
          <TextField label={t(ui.contact.messageLabel)} name="message" multiline required />
          <Button type="submit" variant="primary" fullWidth>
            {t(ui.contact.send)}
          </Button>
        </form>
      </div>
    </div>
  );
}
