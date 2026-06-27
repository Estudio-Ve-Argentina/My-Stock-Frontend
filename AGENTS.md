<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

> En Next 16 la convención `middleware` está **deprecada**: se usa `proxy.ts` (función `proxy`) en la raíz. Ver `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.

# My-Stock — SaaS de gestión de stock

> **Qué es.** App web para que negocios chicos y medianos controlen su inventario, *exageradamente simple* (toda acción en ≤3 clicks). Tiene una **landing pública** y, detrás de login, la **app**. El backend es propio (Spring Boot, JWT + OAuth2 Google) y está documentado en `API_ENDPOINTS.md`. Este repo es **solo el frontend**.
>
> **Origen.** Nació del template de landings de Estudio Ve y reusa sus primitivos de UI, pero **ya no es una landing**. Donde el viejo flujo de landing choque con este archivo, **manda este archivo**.

> **Precedencia ante conflicto:** `CLAUDE.md` → este `AGENTS.md` → skills.
>
> **Skills:** `frontend-design`, `impeccable` y `design-taste-frontend` se usan **solo como checklist de calidad/anti-slop** (contraste, jerarquía, CTAs, layout, copy), nunca como fuente de stack/dependencias. La skill **`landing-generator` NO aplica** a este proyecto (es para landings con grilla de productos/servicios): ignorá su schema de `site.config`, sus "tipos de web" y su estructura de secciones.

## Regla #0 — Clean code, sin excepciones
El clean code se prioriza **siempre**, por encima de la velocidad o la conveniencia:
- Nombres descriptivos en todo (variables, funciones, componentes, archivos).
- Componentes y funciones pequeños, de una sola responsabilidad.
- Sin comentarios en el código; el código se explica solo. Única excepción: justificar una decisión no obvia (p. ej. un Server Component deliberado).
- Si una solución rápida ensucia el código, no se usa: se busca la versión limpia. **Sin código muerto.**

## Stack
Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript + Framer Motion 12.
- Versiones congeladas: nunca downgradear Next/React/Tailwind/TS. Verificar peer deps antes de agregar una librería.
- Gestor de paquetes: **pnpm** (fijado en `packageManager`). No introducir lockfiles de npm/yarn.
- Tailwind 4: el tema se define en `app/globals.css` con `@theme inline` (CSS custom properties). **No hay `tailwind.config.ts`.**
- **Runtime de servidor en Vercel** (NO static export): se necesita para el guard de rutas en `proxy.ts`. `next.config.ts` queda mínimo. Volver a export estático perdería el guard de servidor.
- Alias de imports: `@/*` apunta a la raíz.
- `NEXT_PUBLIC_API_URL` define la base del backend (ver `.env.example`). Default `http://localhost:8080`. Nunca hardcodear la URL del back en componentes.

## Arquitectura — dos zonas, todo componetizado
Las rutas (`app/`) **solo componen**; la lógica vive en `components/`, `hooks/` y `lib/`.

```
app/
  layout.tsx          providers globales (Language + Auth) + metadata
  page.tsx            landing pública (compone components/marketing/*)
  (auth)/             login · signup · oauth2/success · forgot-password · reset-password   (layout centrado)
  (app)/              ZONA PROTEGIDA — layout con <AppGuard> + <AppShell> (sidebar)
    panel/            dashboard: stats del día + actividad reciente (default al loguear)
    cargar/           formulario de alta de producto
    productos/        lista de productos (stock ±, borrar, buscar)
    historial/        movimientos del inventario
    planes/           planes y upgrade
    cuenta/           datos del usuario + uso + cerrar sesión
proxy.ts              guard server-side: sin token válido en rutas (app) → /login
config/
  app.config.ts       ÚNICO editable: nombre, planes, copy de marketing, contacto
  site.types.ts       tipos compartidos (Locale, Localized, Plan, Movement, DTOs)
  i18n.ts             textos de UI por sección (es/en)
lib/
  api/                client.ts (fetch + Bearer) · auth.ts · products.ts · history.ts · mock.ts
  auth/               jwt.ts (decode de claims) · session.ts (cookie)
  i18n.ts             translate()
hooks/                useLanguage · useAuth · useProducts · useMovements · useLocalStorage
components/
  providers/          LanguageProvider · AuthProvider
  ui/                 Section · Button/LinkButton · TextField · Carousel · Spinner · PlanCard · Wordmark · SectionHeading · Reveal · LanguageToggle
  auth/               LoginForm · SignupForm · GoogleButton · OAuthCallback · ForgotPasswordForm · ResetPasswordForm
  app/                AppShell · AppGuard · SidebarNav · EmailVerificationBanner · icons · DashboardView · StatCard · MovementItem · CargarView · ProductsView · ProductCard · StockStepper · ProductForm · HistorialView · PlansView · PlanLimitBanner · AccountView
  marketing/          MarketingHeader · Hero · Features · Pricing · Footer
```

- **Shell de la app:** `AppShell` arma el layout con sidebar oscuro (`SidebarNav`) fijo en desktop y drawer en mobile. El default al entrar es `/panel`.
- **Modo demo:** con `NEXT_PUBLIC_USE_MOCK=true` (`.env.local`), `lib/api/mock.ts` resuelve auth/productos/movimientos sin backend (localStorage). En `false` pega al backend real.

- **Reutilizar siempre los primitivos** de `components/ui/`. Crear uno nuevo solo si no existe el que se necesita.
- **Listas → `grid`** por defecto.

## Autenticación
- **Signup** (email+password): `POST /auth/signup` con `{ email, password, name, lastname? }`. Devuelve JWT + refresh token. Backend crea usuario con `username = email`, envía email de verificación (24h), el usuario puede usar la app sin verificarse.
- **Signup** (OAuth/Google): front redirige a `GET /oauth2/authorization/google` → backend redirige a `{frontend}/oauth2/success?code=<uuid>` → front llama `POST /auth/oauth2/exchange?code=<uuid>` y recibe ambos tokens. El usuario queda con `emailVerified = true` y `hasPassword = false`.
- **Login**: `POST /auth/login` con `{ email, password }`. Usuarios OAuth no pueden loguearse con password.
- **Access token (JWT)** en cookie `mystock_token` (30 min) — `proxy.ts` lo lee server-side para proteger rutas.
- **Refresh token** en cookie `mystock_refresh` (7 días). Cuando el access expira (401), el front llama `POST /auth/refresh?refreshToken=<valor>` y obtiene nuevo access token.
- **`GET /auth/me`** devuelve `{ id, name, lastName, username, planName, maxProducts, roles, emailVerified, hasPassword }`.
- `AuthProvider` mantiene la sesión. Se consume con `useAuth()` → `{ user, ready, signIn, signOut, refreshUser }`.
- **Doble guard:** `proxy.ts` (server, antes de render) + `<AppGuard>` (cliente, evita flash y maneja expiración).
- **Logout:** `POST /auth/logout?refreshToken=<valor>` borra el refresh del backend; el front limpia ambas cookies.
- **Verificación de email:** `POST /auth/resend-verification?email=` reenvía el email. Banner en AppShell si `emailVerified == false`.
- **Forgot password:** `POST /auth/forgot-password?email=` envía email con link a `/reset-password?token=...` (1h expiry). Rechaza usuarios OAuth.
- **Reset password:** `POST /auth/reset-password` con `{ token, newPassword }`.
- **Cambiar password** (autenticado): `PATCH /api/user/{id}/password` con `{ currentPassword, newPassword }`. Solo visible si `hasPassword == true`.
- **Editar perfil:** `PATCH /api/user/{id}/profile` con `{ name, lastName? }`.

### Formato de errores del backend
Todas las respuestas de error siguen `{ status, message, errors? }`. `message` es siempre un string legible, `errors` (opcional) es un mapa `campo:mensaje` para validaciones de formulario. `ApiError` en `lib/api/client.ts` expone `.message`, `.status` y `.fieldErrors`. Password mínimo: 8 caracteres + mayúscula + minúscula + número.

### Semántica confirmada
- **`PATCH /api/products/{id}/stock`** con `{ "quantity": N }` es un **delta** (suma/resta), no set. Si el resultado sería negativo → 400.
- **Productos:** la respuesta siempre incluye `id` (Long). Ownership validada server-side.
- **Movimientos:** `GET /api/stock-movements/user/{userId}` — el `userId` es el `id` de `/auth/me`. Se generan automáticamente al cambiar stock.
- **Planes:** existen en la API (`GET /api/plans`). Backend define `FREE` (10 prod, $0), `PRO_MONTHLY` (120 prod, $6, 30 días) y `PRO_ANNUAL` (120 prod, $48, 365 días).
- **Upgrade:** `PATCH /api/user/{id}/plan` con `{ "planId": N }` cambia el plan directamente (sin pago real por ahora). IDs: FREE=1, PRO_MONTHLY=2, PRO_ANNUAL=3.

## Planes
- Definidos en el backend: `FREE` (10 productos, $0, sin vencimiento), `PRO_MONTHLY` (120 productos, $6, 30 días) y `PRO_ANNUAL` (120 productos, $48, 365 días). Se consultan con `GET /api/plans` (incluye `durationDays`).
- El front obtiene el plan del usuario desde `/auth/me` → `planName` y `maxProducts`.
- Al llegar al límite: se deshabilita "Agregar" y aparece `PlanLimitBanner`.
- El upgrade llama a `PATCH /api/user/{id}/plan` con `{ "planId": N }` (1=FREE, 2=PRO_MONTHLY, 3=PRO_ANNUAL). **No hay cobro real todavía — no inventar flujo de pago.**
- Mapeo backend↔config: `configIdFromBackend()` y `backendIdFromConfig()` en `app.config.ts`.

## Configuración y contenido
- **Todo lo editable del producto vive en `config/app.config.ts`** (nombre, planes, copy de marketing, contacto). Nunca hardcodear texto, números ni links en componentes.
- El contenido de la app (productos) **viene de la API**, no del config.
- Textos de UI en `config/i18n.ts`, por sección. Todo texto visible es `Localized<string>` → `{ es, en }`.

## Idiomas
- Bilingüe **es/en**. Default `es`, persistido en `localStorage` (key `locale`).
- Toggle desde los headers; `LanguageProvider` actualiza `document.documentElement.lang`.
- Componentes consumen `useLanguage()` → `{ locale, t, toggleLocale }`. `t(localized)` resuelve al idioma actual.
- Por el toggle en cliente, los componentes con texto son Client Components (`"use client"`).

## Tema y diseño
- **Híbrido: base clara + secciones/cards oscuras futuristas como acento** (referencia Netflix). Fondo claro general; sidebar, hero-preview, stat cards, features y plan Pro van en **gradiente oscuro** (`--dark`/`--dark-2`) con glows muy sutiles. Sin neón ni luces raras.
- Paleta colorida: **verde fuerte** (`--brand`), **amarillo** (`--accent`) y **marrón** (`--brown`) sobre neutros. Colores en `app/globals.css` (`:root` + `@theme inline`). Cambiar marca = editar variables.
- **Cuadrado-redondeado:** esquinas `rounded-2xl` en cards, `rounded-xl` en botones/inputs. Tipografía bold, subrayados de acento (`.mark-underline`).
- **Mobile-first y responsive sin excepción.** En mobile las listas de cards usan **carrusel overflow-x con snap** (`components/ui/Carousel.tsx`); en desktop pasan a grid.
- Consistencia: `h2` de sección desde `SectionHeading`; un solo `h1` por página.
- Apariencia humana, sin patrones genéricos de template AI. Antes de generar/ajustar UI, leer `frontend-design` (y usar `impeccable`/`design-taste-frontend` como checklist anti-slop).

## Animaciones
- Framer Motion **sutil**: `Reveal` (fade-up al entrar en viewport, `once`) y `Modal`. Honra `prefers-reduced-motion` (`useReducedMotion`). Solo en Client Components. No animar por animar.

## Rendimiento
Lazy loading, code splitting y minimizar el JS de cliente. Tomar siempre la decisión que mejore el rendimiento.

## Copy
- Español argentino (voseo) principal, inglés como traducción.
- Orientado al beneficio del usuario, lenguaje simple. La promesa es "controlá tu stock en 3 clicks".
- **Defaults de contacto/soporte:** WhatsApp `+5492236680996`, sitio `estudiove.ar`.

## Ejecución — alcance estricto
- **No ejecutar ningún comando** (`pnpm build`, `pnpm dev`, servidor, navegador, screenshots) **salvo que el usuario lo pida explícitamente.**

## Deploy
- Vercel con runtime de Next (sin `output: 'export'`). Cada push a `main` dispara deploy. Configurar `NEXT_PUBLIC_API_URL` en Vercel apuntando al backend.
