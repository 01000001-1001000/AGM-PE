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
