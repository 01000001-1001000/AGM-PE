# Prompt log (AI as assistant)

Rule: the AI proposes; I decide, test and review. Every entry lists what I checked or changed.

## P1 — Full upgrade against the rubric
- Date: 28/09/2026 · Tool: Claude
- Prompt (literal): "Based on this rubrik, I need you to generate a website that
  reaches Excelente 100%. Take as reference this previous website and complete it
  to make it 100%. Comment the code so I can understand it. The rubrik is the image."
- Attached: rubric image + index/trabajo/gustos/bajo-capo/contacto.html, style.css, script.js, globex.js
- Result: js/ modules, extras.css, proceso.html, zona.html, 404.html, SVG assets, docs/
- What I reviewed/changed: [fill in: e.g. config.js repo name, Formspree endpoint, real metrics]

## P2 — Bug: the light/dark button did not work
- Date: [fill in] · Tool: Claude
- Prompt (literal): "The only thing is that the bright botton desn't work. Just tell me what
  sould I do to make taht botton turn all light the website. You don't neet to redo all
  the documents, just tell me what to modify ande where in the js."
- Cause found: ES modules are blocked when opening files with file:// (no local server)
- Result: theme function added to script.js + extra CSS for console, globe and chatbot
- What I checked: [fill in: tested with python3 -m http.server, tested on mobile]

## P0 — Earlier versions (v1 and v2)
- [Paste your real prompts from your chat history here. If you didn't keep them, write
  "not archived" — that is honest and acceptable. Don't invent them.]