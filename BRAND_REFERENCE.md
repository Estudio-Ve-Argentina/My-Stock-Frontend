# Referencia de Branding — Root Square Academy

> Análisis del sitio [rootsquare.academy](https://rootsquare.academy/) (encontrado vía [cta.gallery/cta/fora-copy](https://www.cta.gallery/cta/fora-copy)), hecho a pedido del usuario porque el estilo "resonó" con lo que ya tiene My-Stock. Este documento es **material de referencia** para una futura skill que aplique estos criterios de diseño de forma global al armar/ajustar UI. No implica cambios de código todavía.

## 1. Qué es y por qué funciona

Root Square es una academia de tutoría de matemáticas online para chicos de escuela internacional (7–15 años, bilingüe inglés/ruso). El problema que resuelve es emocional antes que académico: el copy principal del hero es **"Mathematics isn't the monster under your bed"**. Todo el sistema visual está construido para bajar la ansiedad ("matemática = monstruo") sin perder autoridad ("tutores con Master's y PhD"). Logra esto combinando:
- Una paleta **verde bosque + menta**, cálida y natural, no clínica ni corporativa.
- Un **mascot ilustrado recurrente** (gato azul) en escenas de libro infantil, en vez de fotos de stock genéricas.
- Un **logotipo que es un juego visual**: un árbol cuyo tronco es el símbolo de raíz cuadrada (√).
- Botones y tarjetas con un motivo de **sombra "offset" tipo sticker**, friendly pero con peso.
- Copy que alterna entre reassurance ("no identical lessons here") y credenciales concretas (grados, años de experiencia, C1 CAE).

La lección de fondo: **un mismo color-base (verde) puede leerse "SaaS corporativo" o "cálido y humano" según qué tan orgánica sea la paleta, qué tanto peso le des a ilustración/mascot vs. iconografía genérica, y si tus sombras son duras (planas, offset) o difusas (blur suave)**.

## 2. Logo y mascot

- **Isotipo**: un árbol estilizado en silueta blanca sobre fondo verde, donde el tronco/raíz se dibuja explícitamente como el símbolo **√** (raíz cuadrada) — el wordplay "Root Square" es literal en el logo, no solo en el nombre.
- **Logotipo**: "Root Square" en un lettering bold, redondeado, con panza (display font tipo "bubble sans"), trazo grueso y consistente, ligeramente juguetón/irregular — no es una tipografía de sistema, es lettering custom.
- **Mascot**: un gato azul antropomorfizado (orejas puntiagudas, ojos amarillos grandes, hoodie blanco) que aparece en múltiples escenas ilustradas (clase online, estudiando bajo un árbol con fórmulas talladas en el tronco, junto a otros gatos-alumnos en un aula con pizarrón). Estilo de ilustración: **acuarela/tinta cálida tipo libro infantil**, no vector plano ni 3D genérico. El mismo personaje se reutiliza en distintos contextos para dar continuidad narrativa, en vez de fotos de stock o distintas ilustraciones sueltas.
- **Por qué importa**: el mascot resuelve lo que en la mayoría de los sitios se resuelve con fotos de stock (aula genérica, sonrisas de banco de imágenes). Un personaje propio + un logo con doble lectura (árbol/raíz) da identidad memorable sin depender de fotografía.

## 3. Paleta de colores (hex reales extraídos del sitio)

**Verdes (marca, dominante):**
| Uso | Hex |
|---|---|
| Verde bosque oscuro (texto sobre claro, fondo de secciones, sombras offset) | `#195736` |
| Verde bosque, variante | `#1a5433` |
| Verde muy oscuro (casi negro-verde, overlays) | `#1e3820` |
| Verde oliva apagado (texto secundario sobre claro) | `#364d37` |
| Verde medio/acento vivo (CTAs, highlights, el verde del logo) | `#3aad72` |

**Verdes claros / mint (fondos de sección, cards, tags):**
| Uso | Hex |
|---|---|
| Mint muy pálido (fondo de sección alterno) | `#edf5e9` |
| Mint pálido (fondo de cards) | `#dbf3de` |
| Verde-menta claro (chips, badges) | `#c9e3cb`, `#c0f0d6` |
| Verde-blanco (highlight sutil) | `#e3fff0` |

**Neutros:**
| Uso | Hex |
|---|---|
| Blanco | `#ffffff` |
| Negro casi puro (texto principal) | `#050505` / `#000000` |
| Gris azulado (bordes, texto muted) | `#9ba1a5`, `#d3dce6` |

**Lectura del sistema**: es una paleta **monocromática de verde** con 3 profundidades (oscuro para texto/CTA sólido, medio-vivo para acentos/hover, pálido-mint para fondos de sección) + neutros puros. No hay un segundo color de marca (no hay amarillo, naranja, etc.) — toda la calidez viene de la ilustración, no de la paleta.

**Relación con My-Stock**: hoy `app/globals.css` define `--brand: #16a34a` (verde emerald vívido) y `--brand-dark: #14532d`. Root Square usa un verde **más apagado, más "bosque/oliva"** (`#195736`) en vez del emerald puro de Tailwind. Esa diferencia de saturación es justamente lo que hace que Root Square se sienta "cálido/artesanal" y no "SaaS de stock". Si se quiere absorber esa sensación, el ajuste no es cambiar de familia de color — es bajar la saturación del verde base y sumar los tonos mint pálidos como fondos de sección (hoy My-Stock salta directo de blanco a `--dark`, sin un paso intermedio "mint claro").

## 4. Tipografía

- **Geist** — familia principal para toda la jerarquía de texto (headlines, body, UI). Sans-serif geométrica, moderna, muy legible, múltiples pesos.
- **DM Mono** — usada puntualmente (probablemente precios, badges, datos tipo "código"), da un contraste técnico/preciso frente a lo redondeado del resto.
- **Covered By Your Grace** y **Great Vibes** — fuentes script/manuscritas, usadas como acento decorativo puntual (probablemente subrayados, notas al margen, o alguna palabra destacada tipo "hecho a mano"), no para texto corrido.
- **Neucha** — otra fuente con onda manuscrita/casual, refuerza el mismo recurso.

**Patrón**: base sans-serif limpia (Geist) para el 95% del contenido + toques manuscritos puntuales para simular "nota escrita a mano" — coherente con la sensación de cuaderno/libreta de estudio, no de dashboard corporativo.

## 5. Motivos de UI (shadows, radios, botones)

- **Border-radius generoso y variado**: 8px, 12px, 16px, 24px, 32px según el componente — nada usa esquinas rectas. Los valores grandes (24–32px) se usan en cards/contenedores grandes, 8–16px en botones e inputs.
- **Sombra difusa estándar**: `box-shadow: 0 4px 8px rgba(0,0,0,0.25)` en cards e imágenes — sombra suave, profundidad convencional.
- **Sombra "offset" firma de marca** (la más distintiva): `box-shadow: -2px 3px 0px 0px rgb(25, 87, 54)` — una sombra **sin blur**, sólida, del mismo verde bosque de marca, desplazada hacia abajo-izquierda. Esto es el típico recurso "neobrutalist / sticker" (como si el elemento estuviera pegado sobre un fondo y proyectara un borde de color plano). Se usa en botones y elementos interactivos clave — le da un aire juguetón, de "tarjeta de juego de mesa", sin perder legibilidad.
- **Gradientes**: overlays sutiles tipo `linear-gradient(#364d37 0%, #1e382066 73%, transparent 98%)` sobre imágenes, para oscurecer la base y que el texto blanco flote encima — típico recurso de hero con imagen de fondo.
- **Micro-detalle**: `box-shadow: inset -2.58px -2.58px #ffffffb8` en algún elemento — un inset-highlight blanco, sugiere un botón/ícono con efecto "embutido" sutil tipo botón físico.

## 6. Copy y tono de voz

- **Headline emocional primero, credencial después**. Ej: "Mathematics isn't the monster under your bed" (hero) vs. "Tutors with Master's and PhD degrees" (feature list). El copy nunca es solo uno de los dos registros.
- **Dirigido directamente al dolor del padre/madre**, no del alumno: "New school, new system, fear of saying something wrong", "International schools overwhelm kids with complex material, a rapid pace, and a uniform teaching style."
- **Anti-genérico explícito**: "There are no identical lessons here", "no templates, ever" — se posicionan activamente contra la industria de tutoría masificada.
- **CTAs de baja fricción, conversacionales**: "Find me my tutor", "Tell us about your kid", "Talk to Us" (vía Telegram) — evitan el genérico "Sign up" / "Get started".
- **Prueba social con nombre propio**, no testimonios anónimos: "Ekaterina Artemeva", "eight years of teaching", "C1 (CAE) level", "Rugby School Thailand" (nombre de colegio real de un alumno/familia).
- **Inclusión explícita**: mencionan soporte para "Autism, Behavior coaching, Learning difficulties, Dyscalculia" sin eufemismos — refuerza la promesa de personalización real.

## 7. Estructura de la home (orden de secciones)

1. **Header** sticky con anclas: Why Us · Our Approach · Team · Reviews · Pricing · CTA primario (Talk to Us).
2. **Hero**: headline emocional + subheadline con la propuesta de valor concreta ("Real mathematicians helping international school students (ages 7–15) think clearly, gain confidence, and enjoy math") + 2 CTAs (uno de conversión "Find me my tutor", uno bajo compromiso "Tell us about your kid") + ilustración del mascot.
3. **Why Us**: lista de diferenciales anti-genéricos ("no identical lessons", bilingüe, "more than a tutor").
4. **Método**: 4 pasos numerados ("How every lesson actually works" / "The Method Behind the Results") — incluye soporte psicológico y tracking de progreso como parte del método, no como extra.
5. **Team**: perfil de tutora con foto + credenciales + idiomas.
6. **Reviews**: "Families Who Made the Switch" — testimonios con institución real del alumno.
7. **Pricing**: 3 tiers con naming metafórico ("Plant Root" $116, "Root Square" $312, "Beyond Square" $439 — precios ya con descuento tachado del original, más código "ROOTS10" para 10% extra), cada tier acumula features del anterior.
8. **Footer**: repite nav + legal (Terms, Privacy).

## 8. Qué es aplicable a My-Stock (para la futura skill)

Puntos concretos que tienen sentido llevar al sistema de diseño actual (`app/globals.css`, `components/ui/`), sin romper la regla ya establecida de "cuadrado-redondeado + híbrido claro/oscuro tipo Netflix":

- **Bajar saturación del verde de marca** o sumar una variante "bosque" para textos/CTAs sólidos, reservando el emerald vivo actual para acentos/hover — hoy todo el verde de My-Stock es un solo tono vívido.
- **Sumar un tono mint pálido** (`#edf5e9`-like) como fondo de sección intermedio entre blanco y `--dark`, en vez de saltar directo de claro a oscuro.
- **Adoptar la sombra offset sólida** (sin blur, color de marca, desplazada) como variante de énfasis para botones primarios o cards destacadas — encaja con el `rounded-xl`/`rounded-2xl` que ya usan, y le da personalidad sin agregar un color nuevo.
- **Considerar un mascot/ilustración propia recurrente** en vez de solo iconografía, para el Hero y estados vacíos (dashboard sin productos, etc.) — es el elemento que más "humaniza" a Root Square frente a un dashboard genérico.
- **Copy**: reforzar el patrón "beneficio emocional + dato concreto" ya presente en la regla de copy de My-Stock ("controlá tu stock en 3 clicks"), y usar CTAs conversacionales en vez de genéricos donde aplique.

Estos son puntos de partida para cuando se arme la skill — no se tocó código en esta sesión.

---
*Fuentes: HTML/CSS crudo de rootsquare.academy (colores, fuentes, shadows, radios extraídos directo del markup), capturas de logo/hero/ilustraciones descargadas de framerusercontent.com, y el listado de la landing en cta.gallery/cta/fora-copy.*
