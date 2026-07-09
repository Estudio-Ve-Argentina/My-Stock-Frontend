"use client";

import type { ComponentType, SVGProps } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Tone = "green" | "yellow" | "brown" | "plain";

const toneClasses: Record<Tone, { chip: string; glow: string; bar: string }> = {
  green: {
    chip: "bg-neon text-dark",
    glow: "shadow-[0_20px_60px_-18px_rgba(52,240,138,0.55)]",
    bar: "from-neon",
  },
  yellow: {
    chip: "bg-accent text-accent-foreground",
    glow: "shadow-[0_20px_60px_-20px_rgba(245,194,17,0.55)]",
    bar: "from-accent",
  },
  brown: {
    chip: "bg-brown text-brown-foreground",
    glow: "shadow-[0_20px_60px_-20px_rgba(138,90,43,0.6)]",
    bar: "from-brown",
  },
  plain: {
    chip: "bg-white/10 text-dark-foreground",
    glow: "",
    bar: "from-white/40",
  },
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: Tone;
  index?: number;
}

export function StatCard({ label, value, icon: Icon, tone = "plain", index = 0 }: StatCardProps) {
  const reduceMotion = useReducedMotion();
  const styles = toneClasses[tone];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 280, damping: 17, delay: index * 0.07 }}
      className={`relative flex h-full flex-col gap-3.5 overflow-hidden rounded-xl bg-gradient-to-br from-dark-2 to-dark p-4 text-dark-foreground ring-1 ring-dark-border ${styles.glow}`}
    >
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r to-transparent ${styles.bar}`} />
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles.chip}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="font-heading text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        <p className="mt-0.5 text-xs font-medium text-dark-subtle">{label}</p>
      </div>
    </motion.div>
  );
}
