import type { Locale, Localized, PlanId } from "./site.types";

interface AppConfig {
  name: string;
  defaultLocale: Locale;
  apiBaseUrl: string;
  support: {
    whatsapp: string;
    site: string;
  };
}

export const appConfig: AppConfig = {
  name: "Stockeo",
  defaultLocale: "es",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  support: {
    whatsapp: "+5492236680996",
    site: "estudiove.ar",
  },
};

interface PlanPresentation {
  name: Localized;
  features: Localized<string[]>;
}

/**
 * Copy que el backend no devuelve (nombre visible, bullets de marketing).
 * Precio, límite de productos y duración siempre vienen de `GET /api/plans` vía `usePlans()`.
 */
export const PLAN_PRESENTATION: Record<PlanId, PlanPresentation> = {
  free: {
    name: { es: "Gratis", en: "Free" },
    features: {
      es: [
        "Control de stock en tiempo real",
        "Historial de movimientos",
      ],
      en: [
        "Real-time stock control",
        "Movement history",
      ],
    },
  },
  "pro-monthly": {
    name: { es: "Pro Mensual", en: "Pro Monthly" },
    features: {
      es: [
        "Control de stock en tiempo real",
        "Historial de movimientos",
        "Soporte prioritario",
      ],
      en: [
        "Real-time stock control",
        "Movement history",
        "Priority support",
      ],
    },
  },
  "pro-annual": {
    name: { es: "Pro Anual", en: "Pro Annual" },
    features: {
      es: [
        "Control de stock en tiempo real",
        "Historial de movimientos",
        "Soporte prioritario",
      ],
      en: [
        "Real-time stock control",
        "Movement history",
        "Priority support",
      ],
    },
  },
  "pro-test": {
    name: { es: "Pro Test", en: "Pro Test" },
    features: { es: [], en: [] },
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro-monthly", "pro-annual", "pro-test"];

const BACKEND_PLAN_MAP: Record<string, PlanId> = {
  FREE: "free",
  PRO_MONTHLY: "pro-monthly",
  PRO_ANNUAL: "pro-annual",
  PRO_TEST: "pro-test",
};

const CONFIG_TO_BACKEND_NAME: Record<PlanId, string> = {
  free: "FREE",
  "pro-monthly": "PRO_MONTHLY",
  "pro-annual": "PRO_ANNUAL",
  "pro-test": "PRO_TEST",
};

export function configIdFromBackend(backendName: string): PlanId {
  return BACKEND_PLAN_MAP[backendName] ?? "free";
}

export function backendPlanName(configId: PlanId): string {
  return CONFIG_TO_BACKEND_NAME[configId];
}

export function formatPrice(amount: number): string {
  if (amount === 0) return "$0";
  return "$" + amount.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

export const marketing = {
  hero: {
    eyebrow: { es: "Stock sin vueltas", en: "Inventory made simple" },
    title: {
      es: "Controlá tu stock en 3 clicks",
      en: "Control your stock in 3 clicks",
    } satisfies Localized,
    subtitle: {
      es: "Stockeo es la forma más simple de saber qué tenés, qué te falta y qué se está por agotar. Sin planillas, sin complicaciones.",
      en: "Stockeo is the simplest way to know what you have, what you're missing and what's running out. No spreadsheets, no hassle.",
    } satisfies Localized,
    ctaPrimary: { es: "Empezar gratis", en: "Start for free" },
    ctaSecondary: { es: "Ya tengo cuenta", en: "I have an account" },
  },
  features: {
    title: { es: "Pensado para ser simple", en: "Built to be simple" },
    subtitle: {
      es: "Lo único que necesitás para llevar el inventario de tu negocio.",
      en: "Everything you need to keep track of your business inventory.",
    },
    items: [
      {
        title: { es: "Cargá un producto", en: "Add a product" },
        description: {
          es: "Nombre, descripción y stock inicial. Listo, ya está adentro.",
          en: "Name, description and starting stock. Done, it's in.",
        },
      },
      {
        title: { es: "Sumá o restá stock", en: "Add or remove stock" },
        description: {
          es: "Un toque en + o − y el inventario queda actualizado al instante.",
          en: "One tap on + or − and your inventory updates instantly.",
        },
      },
      {
        title: { es: "Mirá todo de un vistazo", en: "See it all at a glance" },
        description: {
          es: "Una lista clara con lo que tenés y lo que se está por agotar.",
          en: "A clear list with what you have and what's running low.",
        },
      },
    ] as { title: Localized; description: Localized }[],
  },
  preview: {
    eyebrow: { es: "Tu panel", en: "Your dashboard" },
    title: {
      es: "Todo tu stock en un solo panel",
      en: "All your stock in one dashboard",
    },
    subtitle: {
      es: "De un vistazo: qué tenés, qué se movió hoy y qué se está por agotar.",
      en: "At a glance: what you have, what moved today and what's running low.",
    },
  },
  sampleStock: [
    { name: "Café molido 500g", stock: 24 },
    { name: "Yerba 1kg", stock: 8 },
    { name: "Azúcar 1kg", stock: 0 },
  ] as { name: string; stock: number }[],
  pricing: {
    title: { es: "Precios claros", en: "Clear pricing" },
    subtitle: {
      es: "Empezá gratis. Cuando tu negocio crece, elegí mensual o anual.",
      en: "Start free. When your business grows, go monthly or annual.",
    },
  },
};
