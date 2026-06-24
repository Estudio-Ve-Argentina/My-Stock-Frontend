"use client";

import { appConfig, marketing } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Carousel } from "@/components/ui/Carousel";
import { PlanCard } from "@/components/ui/PlanCard";
import { LinkButton } from "@/components/ui/Button";
import { MarketingContact } from "@/components/marketing/MarketingContact";

export function MarketingPricing() {
  const { t } = useLanguage();
  const { pricing } = marketing;

  return (
    <section id="pricing" className="relative scroll-mt-16 bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-dark-2 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-dark-2/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-dark-2/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-dark-2/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-dark-2/5 to-transparent" />
      <div className="texture-dots texture-fade pointer-events-none absolute inset-0 opacity-100" />
      <div className="relative mx-auto w-full max-w-6xl px-6 pt-28 pb-8 md:px-8 md:pt-32 md:pb-12">
        <SectionHeading title={pricing.title} subtitle={pricing.subtitle} align="center" />
        <div className="mx-auto mt-12 max-w-4xl">
          <Carousel cols={3} compact>
            {appConfig.plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={index}
                action={
                  <LinkButton href="/signup" variant="primary" fullWidth>
                    {plan.id === "free"
                      ? t(marketing.hero.ctaPrimary)
                      : t(ui.products.upgrade)}
                  </LinkButton>
                }
              />
            ))}
          </Carousel>
        </div>
        <MarketingContact />
      </div>
    </section>
  );
}
