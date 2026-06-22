# Component Specifications

The template components already exist in `components/`. This documents how each works so you can adapt them per client. Content comes from `@/config/site.config`; UI strings from `@/config/i18n`; language via `useLanguage()`.

Conventions:
- Visible text is resolved with `const { t } = useLanguage()` then `t(value)` where `value` is `Localized`.
- Sections that render text are `"use client"`. `Section`, `Button`, `JsonLd` are directive-free.
- Colors come from Tailwind utilities backed by `@theme` (`bg-primary`, `text-foreground`, `border-foreground/10`, `font-heading`). Never hardcode hex in components.

---

## providers/LanguageProvider.tsx — `"use client"`
Holds locale (default from `site.config.site.defaultLocale`), persists it to `localStorage` (key `locale`) via `useLocalStorage`, syncs `document.documentElement.lang`. Exposes `{ locale, setLocale, toggleLocale, t }`. Wraps the app in `app/layout.tsx`.

## hooks/useLanguage.ts
Reads `LanguageContext`; throws if used outside the provider. The only way components touch language.

## ui/Section.tsx — directive-free
Wrapper: `<section id>` + centered container (`max-w-6xl`, responsive padding, `scroll-mt-20`). `id` is typed as `SectionId`. Use it for every content section so anchors and spacing stay consistent.

## ui/Button.tsx — directive-free
Link styled as a pill. Props: `href`, `variant` (`primary` | `outline`), `external`, `ariaLabel`. Variants map to theme utilities.

## ui/WhatsAppButton.tsx — `"use client"`
Builds the `wa.me` link with `buildWhatsAppLink(business.whatsapp, t(contact.whatsappMessage))`. Default label `ui.whatsapp.cta`; override with `label`. This is the primary CTA across the page.

## ui/LanguageToggle.tsx — `"use client"`
Button showing the other locale's code; calls `toggleLocale`. Lives in the Navbar.

## layout/Navbar.tsx — `"use client"`
Sticky, blurred. Logo (`business.logoText ?? business.name`) → `#hero`. Nav links derived from `siteConfig.sections` (minus `hero`); label for `offerings` comes from `offerings.title`, the rest from `ui.nav`. Desktop horizontal links; mobile hamburger toggles a stacked list. Includes `LanguageToggle`.

## layout/Footer.tsx — `"use client"`
Business name, social links (built from `business.instagram` / `business.facebook`), and `© {year} {name}. {ui.footer.rights}`.

## sections/Hero.tsx — `"use client"` — `#hero`
The page's single `<h1>` (`hero.title`) + subtitle + `WhatsAppButton` labeled `hero.ctaText`. Min-height ~80vh.

## sections/Offerings.tsx — `"use client"` — `#offerings`
`<h2>` `offerings.title` + optional subtitle, then a responsive card grid over `offerings.items`. Each `OfferingCard` shows name + description, and `price` **only when present** — so it serves both `kind: "services"` and `kind: "products"`. Cards keyed by `item.name.es`.

## sections/About.tsx — `"use client"` — `#about`
`<h2>` `about.title` + `about.body` paragraph.

## sections/Contact.tsx — `"use client"` — `#contact`
Left: `<h2>` `contact.title` + subtitle + `WhatsAppButton`. Right: a `<dl>` of details (phone→`tel:`, email→`mailto:`, address→`mapUrl`, hours) built only from the fields present in `business`. No form (static, WhatsApp-first).

## seo/JsonLd.tsx — directive-free
`LocalBusiness` JSON-LD from `business` + `seo` in the **default locale**. Rendered in `app/layout.tsx`.

---

## app/page.tsx — assembly
Routes only compose. A registry maps `SectionId → component`; `page.tsx` maps over `siteConfig.sections` in order. To add a section type: create the component, add its `SectionId` to `site.types.ts`, register it here, and add a nav label in `i18n.ts`.

## app/layout.tsx
Loads the font via `next/font/google` (`--font-sans`), builds `metadata`/`openGraph` from `config.seo` in the default locale, renders `<JsonLd />`, and wraps children in `LanguageProvider`. `<html lang>` starts at the default locale; the provider updates it on toggle.

---

## ui/Reveal.tsx — `"use client"`
Framer Motion subtle reveal: fade + 16px rise when scrolled into view (`once`). Honors `prefers-reduced-motion` via `useReducedMotion`. Props: `delay`, `className`. Used by Hero, Offerings, About, Contact and the optional variants. This is the only animation primitive — don't sprinkle raw `motion.*` elsewhere.

## ui/Carousel.tsx — directive-free
Horizontal `overflow-x-auto` + `snap-x snap-mandatory`, hidden scrollbar, bleeds to screen edges (`-mx-6`/`-mx-8`). Generic: pass items as children; each child sets its own width + `snap-start shrink-0`.

## ui/ServiceCard.tsx / ui/ProductCard.tsx — `"use client"`
Componentized cards taking an `Offering`. `ServiceCard`: name + description (no price). `ProductCard`: optional `next/image` (placeholder `bg-accent` when absent) + name + description + `price`. Both used by `Offerings` (grid) and `OfferingsCarousel`. Pick by `offerings.kind`.

## Optional / hidden section variants
These exist but are **not registered** in `app/page.tsx` nor in `siteConfig.sections` — they are hidden until you wire them in for a client (replace the default section in the registry or add a new `SectionId`). They read the same config as their default counterparts:
- `sections/OfferingsCarousel.tsx` — carousel presentation of services/products (vs the default `Offerings` grid).
- `sections/AboutSplit.tsx` — two-column "nosotros" with image (`about.image`) + text.
- `sections/ContactCentered.tsx` — centered, single-column contact with large WhatsApp CTA.

## General Rules
- Zero hardcoded business content in components — everything flows from `config`.
- Section padding via `Section` (`py-20 md:py-28`); inner width `max-w-6xl`.
- Accessible: semantic headings (one `h1`), `aria-label` on icon buttons, visible focus, descriptive `alt`.
- Adapt freely per client (layout, spacing, imagery) but keep the config-driven, single-source-of-truth structure intact.
