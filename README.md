# Estudio Ve — Landing Template

Template base para landings de negocios. Single-page, bilingüe (es/en), export estático listo para Vercel.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript.

## Flujo por cliente

1. **Clonar** este repo (o usarlo como template en GitHub).
2. **Editar `config/site.config.ts`** — único archivo de contenido. Nombre, contacto, WhatsApp, secciones, textos (es + en), SEO. Ver checklist abajo.
3. **Tema** — colores en `app/globals.css` (`:root`); fuentes en `app/layout.tsx` (`next/font/google`).
4. **Verificar** — `pnpm build`.
5. **Push a un repo nuevo** del cliente.
6. **Deploy en Vercel** — conectar el repo; cada push a `main` redeploya.

## Checklist de edición

- [ ] `site.url` (necesario para sitemap/OG) y `business.*` (nombre, phone, whatsapp, email, address, mapUrl, redes, horarios).
- [ ] `offerings.kind`: `"services"` (sin precio) o `"products"` (agregar `price` a cada item).
- [ ] Completar todos los campos `Localized` en `es` y `en` (hero, offerings, about, contact, seo).
- [ ] `sections`: activar / reordenar / quitar secciones.
- [ ] Colores en `app/globals.css` (`:root`). Fuentes en `app/layout.tsx`.
- [ ] `npm run build` sin errores.

> Todo texto visible es `{ es, en }`. Nunca hardcodear contenido, colores ni links en los componentes.

## Estructura

```
config/      site.config.ts (editable) · site.types.ts · i18n.ts
lib/         i18n.ts · whatsapp.ts
hooks/       useLanguage.ts · useLocalStorage.ts
components/  providers/ · ui/ · layout/ · sections/ · seo/
app/         layout.tsx · page.tsx · sitemap.ts · robots.ts · globals.css
```

Las rutas en `app/` solo componen; el contenido vive en `config/` y la UI en `components/`. `app/page.tsx` renderiza las secciones en el orden de `siteConfig.sections`.

## Comandos

```bash
pnpm install
pnpm dev      # desarrollo en http://localhost:3000
pnpm build    # export estático a /out
```

Gestor de paquetes: **pnpm** (fijado en `package.json` → `packageManager`).

## Documentación interna

- `AGENTS.md` — reglas de stack, arquitectura y clean code.
- `.claude/skills/landing-generator/` — workflow + schema del config + specs de componentes.
- `.claude/skills/frontend-design/` — principios de diseño.
