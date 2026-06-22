"use client";

import { motion, useReducedMotion } from "framer-motion";
import { marketing } from "@/config/app.config";
import { useLanguage } from "@/hooks/useLanguage";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Carousel } from "@/components/ui/Carousel";

const chipColors = [
  "bg-brand-soft text-brand-dark",
  "bg-muted text-subtle",
  "bg-brand-soft text-brand-dark",
];

export function MarketingFeatures() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { features } = marketing;

  return (
    <Section id="features">
      <SectionHeading title={features.title} subtitle={features.subtitle} align="center" />
      <div className="mt-12">
        <Carousel cols={3}>
          {features.items.map((item, index) => (
            <motion.div
              key={t(item.title)}
              initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 240, damping: 18, delay: index * 0.1 }}
              whileHover={reduceMotion ? undefined : { y: -8, scale: 1.03 }}
              className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-7 transition-shadow hover:shadow-lg hover:shadow-brand/5"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-neon to-transparent" />
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${chipColors[index % chipColors.length]}`}
              >
                {index + 1}
              </span>
              <h3 className="mt-5 font-heading text-lg font-bold tracking-tight text-foreground">
                {t(item.title)}
              </h3>
              <p className="mt-2 text-sm text-subtle">{t(item.description)}</p>
            </motion.div>
          ))}
        </Carousel>
      </div>
    </Section>
  );
}
