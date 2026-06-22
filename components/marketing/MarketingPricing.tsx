"use client";

import { appConfig, marketing } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlanCard } from "@/components/ui/PlanCard";
import { LinkButton } from "@/components/ui/Button";

export function MarketingPricing() {
  const { t } = useLanguage();
  const { pricing } = marketing;

  return (
    <Section id="pricing" className="bg-muted">
      <SectionHeading title={pricing.title} subtitle={pricing.subtitle} align="center" />
      <div className="mx-auto mt-12 grid max-w-2xl gap-5 md:grid-cols-2">
        {appConfig.plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            action={
              <LinkButton href="/signup" variant="primary" fullWidth>
                {plan.id === "pro"
                  ? t(ui.products.upgrade)
                  : t(marketing.hero.ctaPrimary)}
              </LinkButton>
            }
          />
        ))}
      </div>
    </Section>
  );
}
