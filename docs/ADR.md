# Registro de decisiones de arquitectura (ADR)

Formato: **Contexto → Decisión → Consecuencias**.

## ADR-0001 · Sin framework (HTML + CSS + JS puro)
- **Contexto:** portfolio de contenido; no hay estado complejo ni datos que cambien continuamente.
- **Decisión:** HTML semántico, CSS con variables (tokens en `:root`) y JavaScript vanilla.
- **Consecuencias:** + cero dependencias que actualizar, + carga rápida, + todo explicable en la defensa. − Cabecera y pie se repiten en cada página (sin plantillas).

## ADR-0002 · JavaScript en módulos ES
- **Contexto:** `script.js` original mezclaba 14 responsabilidades en una IIFE.
- **Decisión:** funciones nuevas en `js/*.js` con `import/export` y entrada única `js/main.js`.
- **Consecuencias:** + módulos pequeños, + un fallo no tumba el resto (`safe()`). − Requiere servidor local (no vale `file://`).

## ADR-0003 · Formulario con tres canales
- **Contexto:** no hay servidor propio, pero el contacto debe llegar de verdad.
- **Decisión:** Formspree por `fetch` (principal) · issue de GitHub etiquetado `contacto` · `mailto` como plan B. Honeypot, validación, timeout de 10 s y referencia `AH-XXXX` como acuse.
- **Consecuencias:** + siempre hay una vía. − Dependencia de un tercero; el issue es público (no lleva el correo).

## ADR-0004 · Chatbot por reglas
- **Contexto:** una clave de API en el navegador es pública.
- **Decisión:** motor de palabras clave con puntuación + habilidades (conversor numérico, hora).
- **Consecuencias:** + gratis, determinista, explicable. − Solo entiende su base de conocimiento. Mejora futura: backend intermedio con la clave.

## ADR-0005 · Zona privada como demo
- **Contexto:** se pide login con zona interna en una web estática.
- **Decisión:** flujo completo con SHA-256 + sal (Web Crypto), sesión que caduca en `sessionStorage`, bloqueo tras 5 fallos y datos en `localStorage`.
- **Consecuencias:** demuestra el diseño del flujo; no es seguridad real (el código es visible).

## ADR-0006 · Globo 3D perezoso
- **Contexto:** Three.js penaliza el rendimiento inicial.
- **Decisión:** `import("../globex.js")` solo cuando el globo entra en el viewport (IntersectionObserver).
- **Consecuencias:** + mejor carga inicial. − El globo aparece un instante después.

## ADR-0007 · Tema oscuro por defecto, claro opcional
- **Contexto:** la identidad visual nació oscura; el CSS usa colores fijos en muchos sitios.
- **Decisión:** `data-theme` en `<html>`, script en `<head>` que lo aplica antes de pintar, y `extras.css` con las sobrescrituras del tema claro. Consola y globo siguen oscuros (son «pantallas»).
- **Consecuencias:** + sin parpadeo y sin tocar `style.css`. − Hay que mantener dos bloques de reglas.

## ADR-0008 · Rendimiento: medios ligeros y carga diferida
- **Contexto:** el rendimiento de carga es un factor clave en una web personal que se abre desde el móvil. Los medios eran lo que más pesaba: ocho imágenes de entre 19 y 421 KB (1,4 MB en total) y un vídeo de 29 MB.
- **Decisión:** recomprimir los JPEG incrustados en las imágenes (de 1,4 MB a 437 KB), comprimir el vídeo con H.264 y ofrecer también WebM (de 29 MB a 2,6 MB y 2,7 MB), cargar las imágenes con `loading="lazy"`, usar `preload="none"` con `poster` en el vídeo y cargar Three.js solo cuando el globo entra en pantalla (ADR-0006). Las dos ilustraciones nuevas (`consola-anim.svg` y `git-flujo.svg`) son vectoriales y pesan entre 2 y 3 KB cada una.
- **Consecuencias:** + puntuación Lighthouse de 95 en móvil y 99,7 en escritorio, según la medición del autor (commit `90bdd68`, 7/10/2026). − Las imágenes recomprimidas pierden algo de calidad y siguen siendo ráster dentro de un contenedor SVG; convertirlas en SVG vectoriales reales queda como mejora futura.

## ADR-0009 · Flujo de trabajo en git: rama por mejora, pull request y fusión
- **Contexto:** hasta el 7/10/2026 todo el trabajo se hizo directamente en `labroom`, y `main` quedó parada en el commit `bac8ac5` (29/09). Las dos ramas no comparten historia, por lo que no podían fusionarse con una pull request. Además, el historial mezcla seis identidades de autor, con correos inventados en los commits antiguos (leer readme en .anot para tener en cuenta los criterios de calificación).
- **Decisión:** (1) se une `labroom` con `main` una sola vez con `git merge --allow-unrelated-histories`, conservando los dos historiales; (2) a partir de ahí, cada mejora va en su propia rama (`docs/…`, `fix/…`, `feat/…`), se sube, se abre una pull request y se fusiona con un *merge commit* (no *squash*) para que la rama se vea en el grafo; (3) `main` es la rama estable y la que se publica; (4) un único autor, con el nombre y correo reales del alumno (`git config`); (5) cada mensaje lleva el prefijo del proyecto (`ADD:`, `MOD:`, `CORREC:`) seguido de qué cambia y por qué.
- **Consecuencias:** + el historial se lee como un diario y las decisiones quedan trazadas en las PR. + Los commits antiguos se conservan como evidencia de la evolución v1→v3 (no se reescribe el historial: cambiaría todos los hashes y se perderían las fechas reales). − Los commits previos al 6/10/2026 mantienen mensajes cortos y autores inconsistentes; se explica aquí en lugar de ocultarse.
