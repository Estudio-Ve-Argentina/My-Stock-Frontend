---
name: mistock-brand
description: Identidad visual de My-Stock — paleta, tipografía, motivos de sombra/radio y tono de copy, derivados del análisis de branding de Root Square Academy (ver BRAND_REFERENCE.md). Checklist a aplicar cada vez que se crea o ajusta UI en este proyecto, encima de frontend-design/impeccable/design-taste-frontend.
---

# mistock-brand

> Fuente completa: [`BRAND_REFERENCE.md`](../../../BRAND_REFERENCE.md) en la raíz del repo (análisis de rootsquare.academy). Esta skill traduce ese análisis en reglas accionables para el trabajo diario en My-Stock. No reemplaza `frontend-design` / `impeccable` / `design-taste-frontend` (esas siguen siendo el checklist anti-slop) — se aplica **encima**, como la capa de identidad propia del producto.

## Cuándo se usa
Cada vez que se crea o modifica un componente visible (marketing, app, auth), landing, empty state, o cualquier superficie con color/tipografía/sombra. Es la última pasada antes de dar por terminada una UI: ¿esto se siente "My-Stock" o se siente "dashboard genérico"?

## Regla 0 — No es un rebrand, es un ajuste de sensación
My-Stock ya usa verde como marca (`--brand: #16a34a` en `app/globals.css`). El objetivo **no es cambiar de color**, es correr el mismo verde hacia el registro "cálido/artesanal" de Root Square en vez del registro "SaaS emerald genérico". No tocar los valores hex existentes sin que el usuario lo pida explícitamente — esta skill guía cómo *usar* los tokens que ya existen, no los reemplaza.

## 1. Paleta — cómo usar lo que ya existe con la lógica de Root Square
Tokens disponibles en `app/globals.css` (`@theme inline`):

| Token | Uso Root Square-alineado |
|---|---|
| `--brand` / `--brand-dark` | Texto y CTAs sólidos — reservar `--brand-dark` (`#14532d`) para texto sobre fondo claro y bordes, no solo para hover. |
| `--brand-tint` (`#cef0dc`) / `--brand-soft` (`#a8e4be`) | Usar como **fondo de sección intermedio** entre `--background` y `--dark` — Root Square nunca salta directo de blanco a oscuro, siempre hay un paso "mint pálido". Si una sección se siente "vacía en blanco", este es el primer lugar a mirar antes de ir a `--dark`. |
| `--accent` (amarillo) / `--brown` | Se mantienen como en AGENTS.md — Root Square no tiene un segundo color de marca, pero My-Stock sí lo definió a propósito (regla ya establecida, no se toca). |
| `--dark` / `--dark-2` | Igual que hoy — el "acento futurista" del híbrido Netflix-style. |

**No introducir** una paleta beige/crema ni ningún tono "premium consumer" — eso es exactamente lo que Root Square evita y lo que ya prohíbe `design-taste-frontend`.

## 2. Sombra firma — el motivo más ownable de Root Square
`app/globals.css` ya tiene las utilities `.shadow-offset-brand` y `.shadow-offset-dark` (sombra sólida, sin blur, desplazada `-3px 4px`, color `--brand-dark` o `--dark`). Usarlas en:
- Botones primarios que necesiten destacarse más que el default (`Button.tsx` variant "featured"/CTA hero).
- Cards de plan destacado (`PlanCard.tsx`) — el tier recomendado, no todos los tiers.
- Nunca como reemplazo del shadow difuso por defecto en cards regulares — es un acento puntual, no el estándar de toda la UI. Sobre-usarlo lo vuelve ruido en vez de firma.

## 3. Radios — ya alineado, mantener
El sistema `rounded-2xl` (cards) / `rounded-xl` (botones/inputs) ya declarado en AGENTS.md es compatible con Root Square (8–32px variado, nunca esquinas rectas). No introducir esquinas a 0.

## 4. Ilustración / mascot en vez de iconografía sola
Root Square resuelve hero y estados emocionales con un personaje ilustrado propio en vez de fotos de stock o solo íconos. Para My-Stock, esto aplica en dos lugares concretos:
- **Hero de marketing** (`MarketingHero.tsx`): si se reemplaza o itera el visual, preferir una ilustración/composición propia del producto (ej. una escena de "control de stock simple") antes que un mockup genérico de dashboard.
- **Estados vacíos** (`FavoritesView`, `ProductsView` sin productos, `HistorialView` sin movimientos): estos son la oportunidad más barata de sumar personalidad — hoy son candidatos a solo-ícono-y-texto. Cuando se toquen, evaluar una ilustración simple con la paleta de marca en vez de un ícono gris genérico.
No inventar un mascot-personaje nuevo sin que el usuario lo pida — esto es una dirección a proponer, no a ejecutar de oficio.

## 5. Tono de copy — el patrón de dos registros
Root Square nunca es solo emocional ni solo técnico: alterna dolor/beneficio del usuario con un dato concreto. My-Stock ya tiene esto parcialmente en su regla de copy ("controlá tu stock en 3 clicks"). Al escribir copy nuevo en `config/app.config.ts` / `config/i18n.ts`:
- Preferir CTAs conversacionales y específicos sobre genéricos ("Empezar a controlar mi stock" > "Comenzar").
- Un beneficio emocional (tiempo/tranquilidad/simplicidad) seguido de un dato concreto (3 clicks, límite de productos, etc.) — no dejar el copy solo en una de las dos capas.
- Nunca dos CTAs con la misma intención en una misma vista (regla ya cubierta por `design-taste-frontend` — se refuerza acá porque Root Square es un buen ejemplo positivo: un CTA de conversión + uno de bajo compromiso, nunca dos iguales).

## 6. Checklist rápido antes de dar por terminada una UI
- [ ] ¿Hay un fondo de sección mint (`--brand-tint`/`--brand-soft`) entre los bloques claros y oscuros, o saltó directo de blanco a `--dark`?
- [ ] ¿El CTA más importante de la vista usa `.shadow-offset-brand` o al menos se distingue del resto sin depender solo de color?
- [ ] ¿El copy tiene las dos capas (emocional + concreto) o es genérico de plantilla?
- [ ] ¿Un estado vacío nuevo es solo ícono+texto gris, o se evaluó sumarle personalidad?
- [ ] ¿Se mantuvo el sistema de radios (`rounded-xl`/`rounded-2xl`) sin mezclar con esquinas rectas?
