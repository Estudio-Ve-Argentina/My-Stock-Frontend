# Site Config Schema

`config/site.config.ts` is the single source of truth. It is the only file you edit per client. Types live in `config/site.types.ts` — do not change them when setting up a client.

Every visible string is `Localized` → `{ es: string; en: string }`.

## Type Definition (config/site.types.ts)

```ts
export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export type Localized<T = string> = Record<Locale, T>;

export type OfferingKind = "services" | "products";
export type SectionId = "hero" | "offerings" | "about" | "contact";

export interface Offering {
  name: Localized;
  description: Localized;
  price?: string;        // only for products; locale-agnostic string e.g. "$3.500"
  image?: string;
}

export interface SiteConfig {
  site: { url: string; defaultLocale: Locale };
  business: {
    name: string;
    legalName?: string;
    logoText?: string;   // text logo; falls back to name
    logo?: string;
    phone: string;       // display format
    whatsapp: string;    // digits for wa.me (non-digits are stripped)
    email?: string;
    address?: string;
    mapUrl?: string;
    instagram?: string;  // handle, with or without @
    facebook?: string;
    hours?: Localized;
  };
  brand: { headingFont: string; bodyFont: string };  // informational; actual fonts wired in app/layout.tsx
  sections: SectionId[];                              // order + presence of sections
  hero: { title: Localized; subtitle: Localized; ctaText: Localized; backgroundImage?: string };
  offerings: { kind: OfferingKind; title: Localized; subtitle?: Localized; items: Offering[] };
  about: { title: Localized; body: Localized; image?: string };
  contact: { title: Localized; subtitle: Localized; whatsappMessage: Localized };
  seo: { title: Localized; description: Localized; keywords?: string[]; ogImage?: string };
}
```

### Optional / forward-looking fields

These are typed and safe to fill, but **the base components don't all render them yet** — they exist for components added later: `business.logo`, `hero.backgroundImage`, `about.image`, `offerings.items[].image`, and `brand` (fonts are actually wired in `app/layout.tsx`). `seo.ogImage` **is** used (Open Graph in `app/layout.tsx`). Don't assume an image shows up just because it's in the config; check the component first.

## Per-client checklist

1. `site.url`, `business.*` (name, phone, whatsapp, email, address, mapUrl, socials, hours).
2. Web type: `"services"` (cards without price), `"products"` (add `price`), or **`"promocional"`** — no grid/cards; build an aesthetic composition from the client's images + text (alternating image/text blocks, full-bleed, overlays, big type), no listing or prices. The middle section shows the promo images instead of the `Offerings` grid. Still responsive and reuses existing components.
3. Fill all `Localized` fields in `es` and `en` (hero, offerings, about, contact, seo).
4. `sections`: reorder or remove sections (e.g. drop `"about"`).
5. Brand colors/fonts → `app/globals.css` `:root` variables (NOT the config). Fonts → `app/layout.tsx`.

## Web size — single-page vs multi-page

Default is **single-page**: every section lives in `app/page.tsx`, the Navbar scrolls via anchors. Only switch to **multi-page** when the user explicitly asks to make the site bigger.

Multi-page = keep a home (Hero) and split each remaining section into its **own route**, reusing the section component **as-is** plus an **extra page title** on top:

- `app/servicios/` · `app/productos/` · `app/<business>/` → `Offerings` (route name follows the web type).
- `app/nosotros/` → `About`. · `app/contacto/` → `Contact`.

Each extra page renders `Navbar` + extra title + the copied section + `Footer` + `FloatingWhatsApp`. The Navbar/Footer then link to the routes (`next/link`) instead of anchors. SEO: the extra page's `h1` is the page title (no Hero there), the section keeps its `h2`. Static export note: a dynamic `app/[page]/` route needs `generateStaticParams()` + `dynamic = "force-static"` + `dynamicParams = false`; explicit folders need none of that. The goal is only to enlarge the site — never to redesign or change section content.

## Example — Services

```ts
offerings: {
  kind: "services",
  title: { es: "Servicios", en: "Services" },
  subtitle: { es: "Lo que hacemos por vos.", en: "What we do for you." },
  items: [
    {
      name: { es: "Corte", en: "Haircut" },
      description: {
        es: "Corte personalizado a tu estilo.",
        en: "A cut tailored to your style.",
      },
    },
  ],
},
```

## Example — Products

```ts
offerings: {
  kind: "products",
  title: { es: "Productos", en: "Products" },
  items: [
    {
      name: { es: "Dulce de leche artesanal", en: "Artisanal dulce de leche" },
      description: { es: "Sin conservantes.", en: "No preservatives." },
      price: "$3.500",
    },
  ],
},
```

The `Offerings` component renders a card grid and shows `price` only when present, so the same component serves both kinds.

## Theme (app/globals.css)

Colors are NOT in the config. Edit the variables in `:root`, mapped to Tailwind utilities via `@theme inline`:

```css
:root {
  --background: #ffffff;
  --foreground: #1a1a1a;
  --primary: #1a1a1a;
  --primary-foreground: #ffffff;
  --secondary: #4a4a4a;
  --accent: #f4f4f5;
}
```

Utilities generated: `bg-primary`, `text-primary-foreground`, `bg-accent`, `text-foreground`, `font-heading`, `font-body`, etc.

## Fonts (app/layout.tsx)

Fonts load via `next/font/google` and feed `--font-sans`, which `@theme` maps to `--font-heading` and `--font-body`. To change fonts, swap the import:

```ts
import { Playfair_Display, Inter } from "next/font/google";
```

Then expose two variables (`--font-heading`, `--font-body`) and update the `@theme` mapping in `globals.css` accordingly.
