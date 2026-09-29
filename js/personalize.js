/* =========================================================
   personalize.js — personalización según parámetros de la URL
   ---------------------------------------------------------
   Ejemplos que puedes probar:
     index.html?nombre=Marta&enfoque=fct
     contacto.html?enfoque=charla
     index.html?tema=claro
   - nombre  → saluda a la persona (por ejemplo, un reclutador)
   - enfoque → adapta botones y el motivo del formulario
   - tema    → fuerza claro/oscuro
   Además "arrastra" nombre y enfoque a los enlaces internos,
   para que la personalización no se pierda al navegar.
   ========================================================= */
import { applyTheme } from "./theme.js";

// Cada enfoque decide: texto del botón principal y motivo del formulario.
const FOCUS = {
  fct:      { cta: "Ver proyectos para FCT", motivo: "FCT / Prácticas", frase: "Busco prácticas de empresa (FCT)." },
  proyecto: { cta: "Ver proyectos de ciclo", motivo: "Proyecto de ciclo", frase: "Me interesan los proyectos de ciclo." },
  charla:   { cta: "Ver bajo el capó",       motivo: "Charla de código",  frase: "Hablemos de código." },
};

/** Limpia el nombre: solo letras, números, espacios y . ' - (evita inyectar HTML). */
function cleanName(raw) {
  return (raw || "").replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 30);
}

export function initPersonalize() {
  const params = new URLSearchParams(location.search);
  const name = cleanName(params.get("nombre"));
  const focusKey = (params.get("enfoque") || "").toLowerCase();
  const focus = FOCUS[focusKey];
  const theme = params.get("tema");

  // 1) Tema forzado por URL (claro/oscuro)
  if (theme === "claro" || theme === "oscuro") {
    applyTheme(theme === "claro" ? "light" : "dark", document.getElementById("themeToggle"));
  }

  // 2) Saludo personalizado (solo existe en index.html)
  const greet = document.getElementById("greeting");
  if (greet && (name || focus)) {
    // textContent (NO innerHTML): así, aunque alguien manipule la URL, no se ejecuta HTML.
    greet.textContent = (name ? `Hola, ${name}. ` : "Hola. ") + (focus ? focus.frase : "Gracias por pasarte por aquí.");
    greet.hidden = false;
  }

  // 3) Botón principal adaptado al enfoque
  const cta = document.getElementById("heroCta");
  if (cta && focus) cta.textContent = focus.cta;

  // 4) Preselecciona el motivo del formulario de contacto
  const subject = document.getElementById("fSubject");
  if (subject && focus) subject.value = focus.motivo;
  const nameField = document.getElementById("fName");
  if (nameField && name && !nameField.value) nameField.value = name;

  // 5) Propaga los parámetros a los enlaces internos (.html)
  const keep = new URLSearchParams();
  if (name) keep.set("nombre", name);
  if (focus) keep.set("enfoque", focusKey);
  if ([...keep].length) {
    document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((a) => {
      const href = a.getAttribute("href");
      if (/^https?:/.test(href)) return;           // no tocar enlaces externos
      const [path, hash] = href.split("#");
      a.setAttribute("href", `${path}?${keep}${hash ? "#" + hash : ""}`);
    });
  }
}
