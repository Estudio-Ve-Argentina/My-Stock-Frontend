"use client";

import { appConfig, planById } from "@/config/app.config";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { PlanCard } from "@/components/ui/PlanCard";
import { LinkButton } from "@/components/ui/Button";
import { Carousel } from "@/components/ui/Carousel";

const upgradeWhatsAppUrl = `https://wa.me/${appConfig.support.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola! Quiero pasar al plan pago de My-Stock.")}`;

export function PlansView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const currentPlan = planById(user?.plan ?? "free");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.plans.title)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.plans.subtitle)}</p>
      </header>

      <Carousel cols={2}>
        {appConfig.plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            current={plan.id === currentPlan.id}
            action={
              plan.id === "pro" && currentPlan.id !== "pro" ? (
                <LinkButton href={upgradeWhatsAppUrl} external variant="primary" fullWidth>
                  {t(ui.account.upgradeCta)}
                </LinkButton>
              ) : undefined
            }
          />
        ))}
      </Carousel>
    </div>
  );
}
