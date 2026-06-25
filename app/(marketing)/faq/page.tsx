"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-subtle transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function FaqPage() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="texture-dots texture-fade pointer-events-none absolute inset-0 opacity-100" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/15 blur-[110px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-16 md:px-8 md:py-22">
        <header className="mb-12 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t(ui.faq.title)}
          </h1>
          <p className="mt-3 text-base text-subtle md:text-lg">
            {t(ui.faq.subtitle)}
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {ui.faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-heading text-base font-semibold text-foreground">
                    {t(item.question)}
                  </span>
                  <ChevronIcon open={isOpen} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-subtle md:text-base">
                        {t(item.answer)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
