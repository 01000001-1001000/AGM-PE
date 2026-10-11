# Registro de prompts (la IA como asistente)

Regla de trabajo: la IA propone; yo decido, pruebo y reviso. Cada entrada indica qué prompt se usó, qué devolvió y qué hice yo con ello. Los prompts están copiados literalmente, en el idioma en que se escribieron. La IA usada en todos los casos es Claude (Anthropic).

## P0 — Versiones anteriores (v1 y v2)
- Fecha: hasta el 28/09/2026.
- Estado: **no archivados.** No guardé los prompts de las primeras versiones y prefiero no reconstruirlos de memoria para no inventarlos. La evidencia de aquella etapa es el historial de git anterior al 29/09/2026.

## P1 — Mejora completa de la web según la rúbrica
- Fecha: 28/09/2026
- Prompt (literal): "Based on this rubrik, I need you to generate a website that reaches Excelente 100%. Take as reference this previous website and complete it to make it 100%. Comment the code so I can understand it. The rubrik is the image."
- Adjuntos: imagen de la rúbrica y `index`, `trabajo`, `gustos`, `bajo-capo` y `contacto` (.html), `style.css`, `script.js` y `globex.js`.
- Resultado de la IA: módulos `js/`, `extras.css`, `proceso.html`, `zona.html`, `404.html`, ilustraciones SVG y primera versión de `docs/`.
- Qué revisé y cambié yo: puse el repositorio real en `js/config.js` (`REPO: "AGM-PE"`), conecté el formulario con mi endpoint de Formspree en `contacto.html` y, el 07/10/2026, sustituí las métricas de ejemplo de `trabajo.html` por datos míos (commit `794af06`).

## P2 — Error: el botón de tema claro/oscuro no funcionaba
- Fecha: 29/09/2026 (aproximada, deducida del historial de git).
- Prompt (literal): "The only thing is that the bright botton desn't work. Just tell me what sould I do to make taht botton turn all light the website. You don't neet to redo all the documents, just tell me what to modify ande where in the js."
- Causa encontrada: los módulos ES se bloquean al abrir los archivos con `file://`, es decir, sin servidor local.
- Resultado de la IA: función de tema añadida a `script.js` y CSS extra para la consola, el globo y el chatbot.
- Qué comprobé: el botón alterna `data-theme` en `<html>` y la elección se mantiene al cambiar de página (verificado el 09/10/2026 con una prueba automática en navegador).

## P3 — Evaluación de la web con la rúbrica (primera versión revisada)
- Fecha: 29/09/2026
- Prompt (literal): "Hola. Necesito que me digas en qué nivel cumple esta web (la del archivo zip) los criterios de la rúbrica (la imágen). La idea es que llegue al excelente."
- Adjuntos: `secure.zip` (la web) y la imagen de la rúbrica; después, el historial de git.
- Resultado de la IA: informe por criterio con el nivel actual y los fallos detectados: imágenes y vídeo ausentes, métricas con marcadores sin rellenar, correo de ejemplo y un error de sintaxis en la carga de las fuentes.
- Qué hice yo: usé el informe como lista de tareas; los commits del 06/10/2026 (`assets`, `docs/`, corrección de erratas) salen de ahí.

## P4 — Segunda evaluación y archivos corregidos
- Fecha: 06/10/2026
- Prompts (literales): "¿Podrías evaluar el sitio que te paso ahora en el archivo zip en base a la misma rúbrica de la imágen?" y, tras la propuesta de la IA, "Sí, por favor."
- Adjuntos: `AGM-PE.zip` (web con su carpeta `.git`).
- Resultado de la IA: informe con nota por criterio y un paquete de archivos corregidos: arreglo del `onload` de las fuentes, correo real, erratas, dos SVG vectoriales animados (`consola-anim.svg` y `git-flujo.svg`), recompresión de las imágenes, vídeo de 29 MB a 2,6 MB, versión WebM y `README.md`.
- Qué revisé y cambié yo: apliqué los cambios en commits separados el 07/10/2026 (`2001d10`, `e04974f`, `41741c1`, `f4b06aa`, `273729b`), y medí yo mismo la puntuación de Lighthouse (commit `90bdd68`).

## P5 — Evaluación final con nota por criterio y plan de ramas
- Fecha: 09/10/2026
- Prompts (literales): "Hazme la evaluación completa con la rúbirca, con la nota estimada de cada criterio, sí." y, tras recibirla, "Sí, por favor."
- Adjuntos: `subo1.zip` (web sin `.git`), más `historualcorec.txt` y `ramasCorec.txt` con el historial y las ramas.
- Resultado de la IA: informe con una nota estimada de 89/100, la detección de que `main` y `labroom` no comparten historia, este archivo, el ADR-0008 (rendimiento), el ADR-0009 (flujo de git) y la guía de comandos para ramas y pull requests.
- Qué hice yo: comprobé el contenido de cada archivo antes de subirlo y lo publiqué mediante ramas y pull requests (ver ADR-0009 y la pestaña *Pull requests* del repositorio).
