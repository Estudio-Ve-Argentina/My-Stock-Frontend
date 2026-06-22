---
name: landing-standing-corrections
description: Correcciones permanentes que el usuario exige en TODAS las landings del template Estudio Ve
metadata:
  type: feedback
---

El usuario exige que estas correcciones sean defaults permanentes de la plantilla, no parches por cliente. Quedaron fijadas en las skills `landing-generator` (lista operativa) y `frontend-design` (estética). El objetivo es un estilo **moderno, colorido, personal** — nunca minimal/templated. Insistió varias veces: "más color, mucho más color".

**Color — contrato verificable (prioridad #1):** no son "vibes", son reglas chequeables. El fallo que hay que evitar (lo que se entregó mal): ~90% blanco/negro/gris.
- **Roles desde el logo:** mirar el logo y asignar 60/30/10 según qué color predomina (1° = dominante/60, 2° = 30, 3° = 10). Si no hay un 3° claro, el 10 es **blanco** por defecto. Si los colores del logo no están claros, **preguntar al usuario** antes de elegir — nunca inventar la paleta.
- **Neutros = un solo grupo (blanco + negro + gris): piso 15-20% y techo 30%.** El piso es para que haya **contraste** (todo color satura demasiado); el techo para que no domine el blanco/gris. Al menos una sección debe tener fondo neutro (claro y/o oscuro). Excepción al techo: si un neutro es color de marca (parte del 60/30/10), se permite **+20% (tope 50%)**, sólo ese neutro y sólo en ese caso. Ejemplo típico: una sección de fondo gris claro y un footer oscuro aportan ese contraste.
- **El color de marca lleva el peso:** fondos, textos y botones son mayormente de marca, no sólo los fondos. Ojo: el **texto navy translúcido (`foreground/70`) se lee gris y cuenta como neutro** — no dejar todo el cuerpo, labels y nav en ese tono.
- **Títulos:** siempre un color de marca, el que combine con la sección (ej. azul o rosa). Nunca gris/navy por defecto.
- **Superficies:** mantener fondos/formas decorativas tintadas (el tratamiento del hero gustó) — suman color sin texto.
- **Adyacencia:** el footer no comparte color con la sección de arriba; secciones contiguas se diferencian.
- **Chequeo final:** contar las áreas — ¿cuántas son color de marca vs blanco/negro/gris? Los neutros no pasan el tope de arriba.

**Estilo / autenticidad:**
- Navbar, hero y footer deben tener estilo propio (fondos con color, logo destacado, formas redondeadas, hovers). El hero debe verse bien mobile-first (no vacío/feo).
- Sección "Sobre nosotros": **mínimo dos párrafos** y diseño **llamativo** (no un bloque chato de texto). **Sin carrousel** (imagen/composición estática, no hace falta carrousel acá).

**Carrousel (offerings, mobile):**
- Overflow-x real con **deslizamiento que se siente**: en mobile el scroll nativo ya da inercia; en desktop falta, así que se agrega **drag con momentum** (hook `useDragScroll`, solo mouse — no rompe el touch nativo). Snap **proximity** (no mandatory) para que la inercia no pelee con el snap.
- **Padding lateral obligatorio: la primera card NO arranca pegada al borde** (mín 6-8px, idealmente peek). Clave: `scroll-padding` (ej. `scroll-px-6`), porque el snap se come el padding si no. (About NO usa carrousel.)

**Transiciones entre secciones (que fluyan, no choquen):** bloques de color planos full-bleed pegados con borde recto se sienten como bandas que chocan. **Clave: NO aplicar el mismo recurso en todas las costuras** — repetirlo en cada una vuelve a verse mecánico/template. **Mezclar al menos dos recursos, alternando.** Los dos del template:
- **Panel apilado** (opt-in con la prop `stacked` de `Section`): tope redondeado (`rounded-t-[2.5rem]`) + margen negativo (`-mt-8 md:-mt-10`) + sombra suave hacia arriba; la sección sube sobre la anterior y el color de abajo asoma en las esquinas.
- **Divisor de onda** (`WaveDivider` vía la prop `topDivider`, `fill-*` igual al color de la sección): borde superior curvo, orgánico (ideal para rubros blandos/amigables).
Ejemplo de mezcla: onda en algunas costuras, panel apilado en otras, y alguna plana. Complementos: alternar color↔neutro y, opcional, un elemento (imagen/forma) que cruce la costura.

**Escala y motion:** todo ~30% más chico que la base; motion sutil pero presente (offset ~6-8px, ~0.3s, poco stagger; honrar prefers-reduced-motion).

**Conversión:** WhatsApp como CTA con glifo, botón flotante, redes con íconos de marca con color.

**Sección de contacto (dedicada, separada del footer):** es una sección propia, visualmente distinta del footer (no fusionada como un solo bloque oscuro). Layout de dos columnas: **a la derecha un formulario** para comunicarse; **a la izquierda los datos de contacto** (teléfono, email, dirección, horarios) + **call to action de WhatsApp**. Bloque con color fuerte.

**Why:** quiere que cada página se vea a medida, moderna y colorida, y converja al mejor resultado iterando.
**How to apply:** implementar en componentes compartidos. El usuario verifica en su navegador (NO abrir Chrome/screenshots por mi cuenta). Ver [[demo-brief-workflow]].
