# assets-cliente/

Carpeta de **input crudo** por cliente. Tirá acá todas las imágenes que tengas; yo
selecciono, optimizo y muevo a `public/` solo las que se usan. De las fotos también
extraigo la paleta si lo pedís en el brief.

## Convención de nombres

El nombre me dice el rol de cada imagen, así no tengo que preguntarte:

```
logo.png            → logo del negocio (Navbar/Footer)
hero.jpg            → sección Hero (la foto fuerte)
nosotros.jpg        → sección "Nosotros / Quiénes somos" (alias: about.jpg)
oferta-1.jpg        → imagen del 1er servicio/producto/promo, sección del medio (mismo orden que el brief)
oferta-2.jpg
oferta-3.jpg
paleta/             → fotos extra de las que querés que saque colores (opcional)
```

**Las leo y las ubico sí o sí**: cada imagen va a la sección que indica su nombre; no se ignoran.

## Notas
- Formatos: `.png`, `.jpg`/`.jpeg`, `.webp`, `.svg`.
- Toda imagen es opcional: si una sección no tiene foto, funciona igual sin ella.
- El orden de `oferta-N` debe coincidir con el orden de los items en `BRIEF.md`.
- Bajo export estático las imágenes finales viven en `public/` con `images.unoptimized: true`.
