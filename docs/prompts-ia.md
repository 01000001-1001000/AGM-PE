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
- Qué hice yo: apliqué los archivos el 11/10/2026 en commits separados (`7a04ccd` y `c352a33` para los ADR, `69db701` para este archivo y `b88b93b` para `proceso.html`), añadí la captura de Lighthouse (`e36a0b2`) y uní `labroom` con `main` (`b65c260`). Esos commits se hicieron directamente, sin pull request.

## P6 — Revisión de la versión corregida y arreglos finales
- Fecha: 11/10/2026
- Prompts (literales): "Vale, aquí está la versión corregida." y, tras la propuesta de la IA, "Sí, desde luego. Y también explícame más en detalle qué quieres decir con comandos para la rama docs/readme-lighthouse y su PR a main." Después, "Pero no lo entiendo. El merge está hecho. No puedo volver a hacerlo desde github. Se suponía que un merge se hace con git merge, no esto. ¿Verdad?" y "Vale, aquí he hecho los cambios. El resto de cosas siguen igual."
- Adjuntos: `subo.zip` (web sin `.git`), `histo.txt` y `ramas.txt` con el historial y las ramas.
- Resultado de la IA: nueva estimación (92/100 y, tras aplicar los cambios, 93/100), la aclaración de que `git merge` en local y una pull request son dos formas de hacer la misma fusión, la detección de que P5 y el ADR-0009 describían una práctica que el historial todavía no mostraba, y los arreglos de esta rama: erratas del README, enlace a la captura de Lighthouse, referencia rota a `.anot` en el ADR-0009, corrección de P5 y esta entrada.
- Qué hice yo: apliqué los cambios en la rama `docMod` (tres commits, uno por archivo) y los publiqué con `git merge --no-ff` a `main` (commit `c46ba7f`). Elegí `git merge` en local en lugar de una pull request, así que no hay PR en GitHub.