"use client";

import { motion, useReducedMotion } from "framer-motion";
import { marketing } from "@/config/app.config";
import { useLanguage } from "@/hooks/useLanguage";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Carousel } from "@/components/ui/Carousel";

const cardStyles = [
  {
    chip: "bg-brand-soft text-brand-dark",
    line: "from-neon via-brand to-transparent",
    shadow: "shadow-[0_16px_48px_-6px_rgba(52,240,138,0.4)]",
    hoverShadow: "hover:shadow-[0_24px_64px_-6px_rgba(52,240,138,0.55)]",
  },
  {
    chip: "bg-accent-soft text-accent-foreground",
    line: "from-accent via-accent/60 to-transparent",
    shadow: "shadow-[0_16px_48px_-6px_rgba(245,194,17,0.35)]",
    hoverShadow: "hover:shadow-[0_24px_64px_-6px_rgba(245,194,17,0.5)]",
  },
  {
    chip: "bg-brand-soft text-brand-dark",
    line: "from-brand via-brand/40 to-transparent",
    shadow: "shadow-[0_16px_48px_-6px_rgba(22,163,74,0.35)]",
    hoverShadow: "hover:shadow-[0_24px_64px_-6px_rgba(22,163,74,0.5)]",
  },
];

export function MarketingFeatures() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { features } = marketing;

  return (
    <Section id="features">
      <SectionHeading title={features.title} subtitle={features.subtitle} align="center" tone="dark" />
      <div className="mt-12">
        <Carousel cols={3} compact>
          {features.items.map((item, index) => {
            const style = cardStyles[index % cardStyles.length];
            return (
              <motion.div
                key={t(item.title)}
                initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ type: "spring", stiffness: 240, damping: 18, delay: index * 0.1 }}
                whileHover={reduceMotion ? undefined : { y: -8, scale: 1.03 }}
                className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-shadow ${style.shadow} ${style.hoverShadow}`}
              >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${style.line}`} />
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold ${style.chip}`}
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 font-heading text-base font-bold tracking-tight text-foreground">
                  {t(item.title)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{t(item.description)}</p>
              </motion.div>
            );
          })}
        </Carousel>
      </div>
    </Section>
  );
}
