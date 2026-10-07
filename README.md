# AGM-PE · Portfolio de AH

Portfolio personal de Al Hayy, alumno de 1º DAM (IES Simarro). Web estática sin framework:
HTML semántico, CSS con variables y JavaScript en módulos ES.

## Páginas

| Página | Qué contiene |
|---|---|
| `index.html` | Presentación, proyectos destacados y chatbot |
| `trabajo.html` | Proyectos con casos de estudio (problema → solución → resultado), filtro y vídeo |
| `gustos.html` | Intereses personales |
| `bajo-capo.html` | Globo 3D con repos de GitHub y laboratorio decimal/hex/binario |
| `proceso.html` | Decisiones de diseño, ADR, historial de commits en directo e iteraciones |
| `contacto.html` | Formulario con tres canales de envío |
| `zona.html` | Zona privada (demo de login) |
| `404.html` | Página de error |

## Estructura

```
assets/            favicon.svg e ilustraciones (assets/img)
docs/              ADR.md (decisiones) y prompts-ia.md (órdenes a la IA)
js/                módulos ES; entrada única: js/main.js
media/             docu.mp4 y docu.webm (demo en vídeo)
.github/ISSUE_TEMPLATE/contacto.md   plantilla del canal alternativo de contacto
style.css · extras.css · script.js · globex.js
```

## Cómo ejecutarla en local

Los módulos ES **no funcionan con `file://`**, hace falta un servidor local:

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Configuración

Todos los datos de cuenta están en `js/config.js` (usuario de GitHub, repo y correo de respaldo).
El formulario envía a Formspree usando el `action` de `contacto.html`.

## Dos decisiones de arquitectura

El registro completo está en [`docs/ADR.md`](docs/ADR.md). Estas son las dos que más condicionan el proyecto:

### 1. HTML + CSS + JS puro, sin framework (ADR-0001 y ADR-0002)

- **Contexto:** es un portfolio de contenido, sin estado complejo ni datos que cambien continuamente.
- **Decisión:** HTML semántico, tokens de diseño en `:root` y JavaScript vanilla dividido en módulos
  (`js/*.js`) con una única entrada, `js/main.js`. Cada módulo se arranca dentro de `safe()`, así que
  un fallo no tumba al resto.
- **Consecuencias:** cero dependencias que mantener y carga rápida; todo es explicable. A cambio,
  la cabecera y el pie se repiten en cada página y hace falta servidor local.

### 2. Formulario de contacto con tres canales (ADR-0003)

- **Contexto:** no hay servidor propio, pero el mensaje tiene que llegar de verdad.
- **Decisión:** Formspree por `fetch` como vía principal, issue de GitHub etiquetado `contacto` como
  alternativa y `mailto` como plan B. Incluye honeypot anti-spam, validación, *timeout* de 10 s y una
  referencia `AH-XXXX` como acuse de recibo.
- **Consecuencias:** siempre hay una vía de contacto. Depende de un tercero y el issue es público
  (por eso no incluye el correo).

## Accesibilidad

Enlace «saltar al contenido», foco visible, `aria-live` en formulario y chat, texto alternativo en
todas las imágenes, estructura de encabezados coherente y animaciones que se desactivan con
`prefers-reduced-motion`.

## Rúbrica y proceso

- Decisiones de arquitectura: [`docs/ADR.md`](docs/ADR.md)
- Órdenes a la IA archivadas: [`docs/prompts-ia.md`](docs/prompts-ia.md)
- Historial e iteraciones: página `proceso.html` y pestaña *Commits* del repositorio.
