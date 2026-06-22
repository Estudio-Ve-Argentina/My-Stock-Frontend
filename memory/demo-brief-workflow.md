---
name: demo-brief-workflow
description: Cómo el usuario quiere encarar demos de clientes a partir de la plantilla (brief + imágenes en 1-2 prompts)
metadata:
  type: project
---

El objetivo del usuario con este repo es generar demos de landings para negocios en 1-2 prompts y, si el cliente sigue, construir sobre eso.

Flujo acordado: duplicar `BRIEF.md` (raíz) y rellenarlo + tirar imágenes en `assets-cliente/` con la convención de nombres de su README → un prompt arma la landing vía skill `landing-generator`. Campos obligatorios del brief: nombre, rubro, ciudad, URL, WhatsApp, items (3-6), preset de estilo. El resto (traducción en, copy, paleta, SEO) lo autogenero. Segundo prompt = ajustes.

**Why:** el usuario quiere un proceso repetible y rápido para producir demos en serie.
**How to apply:** cuando pida armar una web de un cliente, esperar/leer `BRIEF.md` lleno y `assets-cliente/`; no re-preguntar datos que ya están ahí.
