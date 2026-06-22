---
name: landing-generator
description: Generate production-ready single-page landing websites for small businesses from the Estudio Ve template (Next.js 16 + React 19 + Tailwind 4, bilingual es/en, static export). Use this skill whenever the user asks to create a landing page, website, web page, or site for a business, client, or brand. Also trigger when mentioning Estudio Ve client work, client websites, business landings, or "armar una web para [negocio]". The template already exists — the job is to adapt it to a client, not scaffold from zero.
---

# Landing Page Generator

> ⚠️ **No aplica a este repositorio.** Este proyecto dejó de ser una landing: ahora es **My-Stock**, un SaaS de gestión de stock (ver `AGENTS.md`). No existen `config/site.config.ts` ni la estructura de secciones que describe esta skill. Usala solo en repos de landing de Estudio Ve, no acá.

Adapt the **existing** Estudio Ve template into a finished landing for a specific business. The template is config-driven: ~90% of a client is done by editing `config/site.config.ts` and the theme in `app/globals.css`. Components already exist in `components/` and rarely need new code.

Always read `AGENTS.md` first — it is the source of truth for stack, architecture, and rules.

## Stack (real, verify before coding)
Next.js 16 (App Router) + React 19 + Tailwind 4 (`@theme` in CSS, no `tailwind.config.ts`) + TypeScript. Static export (`output: 'export'`). Bilingual es/en via a client-side toggle persisted in `localStorage`. Read `node_modules/next/dist/docs/01-app/` before using any Next API.

## Workflow

1. Gather the business brief (or receive it from the user).
2. Read `references/site-config-schema.md` → fill `config/site.config.ts`.
3. Set brand colors in `app/globals.css` (`:root`), fonts in `app/layout.tsx`.
4. Read `references/component-specs.md` → adapt components only if the client needs more than content/theme.
5. `pnpm build` and fix any errors before presenting.

The intended end-to-end flow is minimal: **`pnpm install` → 2 prompts → `pnpm build` → push**. The two prompts are (1) the business brief, (2) confirmation of generated translations/colors. The repo uses **pnpm** (pinned via `package.json` `packageManager`); never introduce an `npm`/`yarn` lockfile.

## Step 1: Gather the Brief

Need these inputs. If any required field is missing, ask once for all of them:

| Field | Required | Example |
|---|---|---|
| Business name | ✅ | "Peluquería Sol" |
| Industry/category | ✅ | "peluquería", "restaurante", "taller" |
| Web type | ✅ | "services", "products", or "promocional" |
| Items to showcase (3-6) | ✅ | "Corte, Color, Brushing, Alisado" (+ prices if products) |
| Brand color | ✅ | "#E91E63" or "rosa" |
| Phone / WhatsApp | ✅ | "+54 223 555-1234" |
| Site URL | ✅ | "https://peluqueriasol.com" (for SEO/sitemap) |
| Address / map | optional | "Av. Colón 1234, Mar del Plata" |
| Instagram / Facebook | optional | "@peluqueriasol" |
| Email | optional | "info@peluqueriasol.com" |
| Hours | optional | "Lun a Sáb 9 a 19 hs" |
| Hero tagline / descriptions | optional | AI generates if missing |

All visible text needs `es` **and** `en`. Generate the `en` translation when only `es` is given (and vice versa). Copy is informal Argentine Spanish (voseo), benefit-focused, WhatsApp-first.

## Step 2: Fill site.config.ts

`config/site.config.ts` is the single source of truth and the only file edited for most clients. Read `references/site-config-schema.md` for the full schema, the per-client checklist, and services vs products examples. Never hardcode business content in components.

## Step 3: Theme

Colors live in `app/globals.css` `:root` (not the config), mapped to utilities via `@theme inline`. Fonts load in `app/layout.tsx` via `next/font/google`. Both are documented in `references/site-config-schema.md`. Choose typography, palette, and spacing deliberately per client — read the `frontend-design` skill before making visual choices.

## Step 4: Components (only if needed)

The sections (Navbar, Hero, Offerings, About, Contact, Footer) already exist and adapt to the config. `references/component-specs.md` documents each. To add a new section type: build the component, add its `SectionId` to `config/site.types.ts`, register it in `app/page.tsx`, and add a nav label in `config/i18n.ts`. Sections are toggled/reordered via `siteConfig.sections`.

## Step 5: Verify

```bash
pnpm build
```

Must compile, pass TypeScript, and export static pages including `/sitemap.xml` and `/robots.txt`. Fix all errors before presenting.

**Scope of execution is strict**: the production build is the ONLY allowed verification. Do NOT run `pnpm dev`/a server, open a browser, take screenshots, or do anything beyond what's needed to make it compile — unless the user explicitly asks.

## Design Principles

- **Mobile-first**: layouts start from mobile, expand with `md:`/`lg:`.
- **WhatsApp is the primary CTA**: hero and contact both use `WhatsAppButton`.
- **Fast and light**: CSS transitions only, no JS animation libraries.
- **Accessible**: one `h1`, an `h2` per section, focus states, descriptive `alt`.
- **Distinctive, not templated**: deliberate type/color/spacing per client. Read the `frontend-design` skill.

## Standing defaults — apply to EVERY client

Corrections the studio owner requires on every build. They override the base template's neutral look — which is the failure mode to avoid: a finished client must NOT look like the template. Implement these in the **shared components** so the whole page inherits them (not per-section patches). The target aesthetic is **modern and colorful**, personal and authentic — never minimal/templated.

### Color contract (priority #1 — verifiable, not vibes)
This is a checkable contract, not an aspiration. The failure mode that already shipped: ~90% white/black/gray. Don't repeat it.
- **Derive the roles from the logo.** Inspect the logo and assign 60/30/10 by how much each color appears: most-present = the dominant **60** (floods section backgrounds, hero, large blocks), second = **30** (titles, cards, borders, icons, accents), third = **10**. **If there is no clear third color, the 10 is white by default.** If the logo's colors aren't clear, **ASK the user before choosing** — never invent the palette.
- **Neutral budget — treat white, black and gray as ONE bucket: floor 15–20%, ceiling 30%.** The floor exists for **contrast** (all-color is too saturated and tiring); the ceiling so neutrals never dominate. At least one section must use a neutral background (light and/or dark). Exception to the ceiling: if a neutral is genuinely a brand color (part of the 60/30/10), you may add up to **+20% (max 50%)** — only that neutral, only in that case.
- **Brand color carries the page**, not just backgrounds: text, buttons and surfaces are mostly brand color too. Note: **translucent navy text (`foreground/70`) reads as gray and counts toward the neutral budget** — don't default all body text, labels and nav to it.
- **Titles use a brand color** — whichever combines with the section (e.g. blue or pink), never gray/near-black by default.
- **Surfaces:** keep tinted decorative backgrounds/shapes (the hero treatment) — they add color without text.
- **Adjacency:** the footer must not share its color with the section directly above it; contiguous sections must differ.
- **Final check:** before declaring done, count the areas — how many read as brand color vs white/black/gray? If neutrals exceed the budget above, recolor before shipping.

### Navbar & Footer must have personality
- Not a plain white bar or a plain dark slab. Style both with brand color: colored/tinted background, the logo featured, rounded/pill shapes, hover states. They frame the brand — make them feel designed and authentic.

### Hero must be a designed composition
- The hero is the thesis and must look intentional **mobile-first** (the common failure is an empty, styleless hero on phones). Bold colored background, strong type, the product image as a real focal element, decorative brand shapes. Never a timid near-empty hero.

### Carousels — real, framer-motion driven (offerings only)
- The **offerings on mobile** use a real carousel (not a static grid, not a broken CSS scroll).
- Requirements: a **slide that's felt**. Mobile native overflow scroll already has momentum; desktop doesn't, so add **drag-to-scroll with momentum** via the `useDragScroll` hook (mouse-only pointer events so it never breaks native touch scrolling). Use `snap-proximity` (not `snap-mandatory`) so the inertia doesn't fight the snap.
- **Lateral padding so the first card is NOT glued to the screen edge on mobile** — at least 6–8px of air, ideally a peek of the next card. Use `scroll-padding` (e.g. `scroll-px-6`) so the snap respects the inset instead of eating it. Desktop offerings may remain a grid.
- **About does NOT use a carousel** — a single styled image/composition is enough there.

### About section ("Nosotros") — substantial and eye-catching
- **At least two paragraphs** of copy (origin story + value/promise), never a single flat block of text.
- Make it **visually striking**, not a plain text column: colored/tinted background, a styled image/composition (no carousel needed), decorative brand shapes, deliberate type treatment. It should feel designed, in line with the colorful direction.

### Contact section — dedicated, NOT merged into the footer
- Contact is its **own section**, visually distinct from the footer (don't let two dark blocks read as one). Bold brand-colored block.
- **Two-column layout**: a **contact form on the right** (name, contact, message) to reach the business; on the **left**, the **contact details** (phone, email, address, hours) **plus the WhatsApp CTA** with its glyph.
- Static export note: the form has no Node backend (`output: 'export'`). Wire it to a static-compatible target (e.g. a `mailto:`/`https://` form-handling endpoint) or, at minimum, build the WhatsApp message from the fields — never a dead form.

### Section transitions — sections must flow, not collide
- Full-bleed flat color blocks butted together with a straight hard edge read as bands that *slam* into each other. Make them layer instead.
- **Do NOT apply one transition to every seam** — repeating a single device on all of them looks mechanical/templated again. **Mix at least two, alternating**, and it's fine to leave some seams flat. The two built-in devices:
  - **Stacked panel** — opt-in via `Section`'s `stacked` prop: rounded top (`rounded-t-[2.5rem]`) + small negative top margin (`-mt-8 md:-mt-10`) + soft upward shadow, so the previous color peeks at the corners.
  - **Wave divider** — the `WaveDivider` component via `Section`'s `topDivider` prop, with `fill-*` matching the section's own color: an organic curved top edge (great for soft/playful subjects).
- Keep alternating color↔neutral to soften the chroma clash at each seam. Optional extra: let an element (image/shape) overlap the seam to tie two sections together.

### Scale & motion
- **Compact sizing ~30% smaller** than the base: imagery, type scale, section padding (`py-14 md:py-20`), cards/shapes.
- **Framer Motion subtle but present**: small offset (~6–8px), short duration (~0.3s), low stagger; honor `prefers-reduced-motion`. Subtle ≠ absent — it also powers the carousel.

### Conversion
- WhatsApp is the primary CTA **with its glyph**; add a **floating WhatsApp button**; render social as **colored brand icons** (inline SVG, never text). The contact block follows the "Contact section" spec below (form + details + WhatsApp CTA, separated from the footer).

## Copy Guidelines

- **Hero title**: 6-10 words, speaks to the customer's desire. "Tu mejor versión empieza acá", not "Somos la mejor peluquería".
- **Offering descriptions**: 1-2 lines, benefit-focused.
- **About**: 3-4 sentences, human origin story.
- **CTAs**: action verbs — "Pedí tu turno", "Hacé tu pedido", "Escribinos".
- Argentine voseo for `es`; natural, equivalent `en` (not literal).
