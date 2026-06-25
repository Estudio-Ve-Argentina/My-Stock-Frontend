"use client";

import { appConfig, marketing } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Carousel } from "@/components/ui/Carousel";
import { PlanCard } from "@/components/ui/PlanCard";
import { LinkButton } from "@/components/ui/Button";
import { PlansComparisonTable } from "@/components/ui/PlansComparisonTable";

export default function PlanesPublicPage() {
  const { t } = useLanguage();
  const { pricing } = marketing;

  return (
    <section className="relative overflow-hidden bg-muted">
      <div className="texture-dots texture-fade pointer-events-none absolute inset-0 opacity-100" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/15 blur-[110px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:px-8 md:py-22">
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

        <div className="mt-16 flex flex-col gap-4">
          <h2 className="text-center font-heading text-lg font-bold text-foreground md:text-xl">
            {t(ui.plans.compare)}
          </h2>
          <PlansComparisonTable />
        </div>
      </div>
    </section>
  );
}
