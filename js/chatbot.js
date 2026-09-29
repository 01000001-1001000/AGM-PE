/* =========================================================
   chatbot.js — asistente operativo (sin servidor ni API key)
   ---------------------------------------------------------
   ¿Por qué NO usa una API de IA? Una clave de API en JavaScript
   del navegador es pública: cualquiera podría robarla. Para un
   chatbot con IA real hace falta un backend intermedio. Aquí
   usamos un motor de reglas: es determinista, gratis, rápido
   y fácil de explicar (decisión documentada en docs/ADR-0004).

   Cómo funciona:
   1. Normalizamos el texto (minúsculas, sin tildes).
   2. Cada entrada de KB tiene palabras clave; puntuamos cuántas
      aparecen en la pregunta.
   3. Respondemos con la entrada de mayor puntuación.
   4. Hay "habilidades" especiales: convertir números y dar la hora.
   ========================================================= */
import { GH } from "./config.js";

/* ---------- Base de conocimiento ---------- */
// keys: palabras (ya sin tildes). a: respuesta (puede llevar HTML de enlaces).
const KB = [
  { keys: ["quien", "eres", "sobre ti", "presentate", "ah"],
    a: "Soy AH, estudiante de 1º DAM en el IES Doctor Lluís Simarro. Llevo 3 años de informática y me obsesiona lo que pasa por debajo de la interfaz." },
  { keys: ["estudi", "ciclo", "dam", "simarro", "formacion"],
    a: "Estudio 1º de Desarrollo de Aplicaciones Multiplataforma (DAM) en el IES Simarro. Antes hice SMX en el mismo centro." },
  { keys: ["python", "lenguaje", "programa", "programas", "codigo"],
    a: "Mi lenguaje base es Python. También HTML/CSS/JS para web y, por mi cuenta, C y ensamblador para entender el bajo nivel." },
  { keys: ["proyecto", "proyectos", "trabajo", "portafolio", "hecho"],
    a: 'Tengo una web corporativa, aplicaciones de consola en Python y un laboratorio de bajo nivel. Todo con casos reales en <a href="trabajo.html">Lo que he hecho</a>.' },
  { keys: ["practicas", "fct", "empresa", "contratar", "disponible"],
    a: 'Estoy disponible para prácticas (FCT) y proyectos de ciclo. Lo más rápido: <a href="contacto.html?enfoque=fct">el formulario de contacto</a>.' },
  { keys: ["contacto", "contactar", "escribir", "correo", "email", "mail"],
    a: 'Puedes escribirme desde <a href="contacto.html">el formulario</a>. Respondo en 1–2 días laborables.' },
  { keys: ["github", "repositorio", "repos"],
    a: `Mi GitHub: <a href="${GH.profile}" rel="noopener">${GH.profile.replace("https://", "")}</a>. En "Lo que he hecho" se cargan mis repos en directo con la API de GitHub.` },
  { keys: ["web", "hecha", "tecnologia", "stack", "framework", "three"],
    a: "Esta web es HTML semántico + CSS con variables + JavaScript modular, sin frameworks. El globo 3D usa Three.js. Las razones están en la página Proceso (ADR)." },
  { keys: ["accesibilidad", "accesible", "contraste", "teclado"],
    a: "Cuido la accesibilidad: HTML semántico, foco visible, enlace 'saltar al contenido', alt en imágenes, aria-live en el formulario y respeto por 'reducir movimiento'." },
  { keys: ["tema", "oscuro", "claro", "modo"],
    a: "Usa el botón ◐ de la cabecera para alternar tema claro/oscuro; se recuerda entre visitas." },
  { keys: ["aficion", "gusta", "cine", "moto", "motor", "hobby"],
    a: 'Programar, ver películas y el motor. Lo cuento en <a href="gustos.html">Me gusta</a>.' },
  { keys: ["privacidad", "datos", "rgpd", "cookies"],
    a: "El formulario solo usa tus datos para responderte. No hay cookies de seguimiento; solo guardo en tu navegador el tema y filtros (localStorage)." },
  { keys: ["zona", "login", "privada", "sesion"],
    a: 'Hay una <a href="zona.html">zona privada de demostración</a> (usuario invitado / contraseña DAM-2025) con una bitácora que guarda datos.' },
  { keys: ["proceso", "git", "commit", "commits", "adr", "prompt", "prompts"],
    a: 'El proceso completo (decisiones, commits e instrucciones a la IA) está en <a href="proceso.html">Proceso</a>.' },
  { keys: ["hola", "buenas", "hey", "saludos"],
    a: "¡Hola! Pregúntame por mis estudios, proyectos, cómo contactar o cómo está hecha la web." },
  { keys: ["gracias", "genial", "vale"],
    a: "¡De nada! Si quieres, cuéntame más en el formulario de contacto." },
];

const SUGGESTIONS = ["¿Quién eres?", "¿Qué proyectos tienes?", "Convierte 255", "¿Cómo te contacto?"];

/* ---------- Utilidades ---------- */
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Habilidad 1: "convierte 255" → hex, binario, octal (reusa la idea del laboratorio). */
function convert(text) {
  const m = norm(text).match(/(?:convierte|pasa|hex|binario|octal)\D*(\d{1,10})/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n > 4294967295) return "Ese número no cabe en 32 bits sin signo (máx. 4294967295).";
  return `${n} = 0x${n.toString(16).toUpperCase()} (hex) = 0b${n.toString(2)} (binario) = 0o${n.toString(8)} (octal).`;
}

/** Habilidad 2: la hora local del visitante. */
function time(text) {
  return /\bhora\b/.test(norm(text)) ? "Ahora mismo son las " + new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) + " en tu zona." : null;
}

/** Motor: devuelve la respuesta (HTML permitido SOLO de nuestra KB, nunca del usuario). */
export function answer(text) {
  const special = convert(text) || time(text);
  if (special) return special;
  const q = norm(text);
  let best = null, bestScore = 0;
  KB.forEach((e) => {
    const score = e.keys.reduce((s, k) => s + (q.includes(k) ? 1 : 0), 0);
    if (score > bestScore) { best = e; bestScore = score; }
  });
  return best ? best.a : 'No estoy seguro de eso. Prueba con "proyectos", "estudios" o "contacto", o escríbeme por <a href="contacto.html">el formulario</a>.';
}

/* ---------- Interfaz ---------- */
export function initChatbot() {
  // Construimos el widget con DOM (no hace falta tocar el HTML de cada página).
  const root = document.createElement("div");
  root.className = "chat";
  root.innerHTML = `
    <button class="chat-fab" id="chatFab" type="button" aria-expanded="false" aria-controls="chatPanel" aria-label="Abrir asistente">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 4h16v12H8l-4 4z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
    </button>
    <section class="chat-panel" id="chatPanel" role="dialog" aria-label="Asistente de AH" hidden>
      <header><b>Asistente AH</b><button type="button" id="chatClose" aria-label="Cerrar asistente">✕</button></header>
      <div class="chat-log" id="chatLog" role="log" aria-live="polite"></div>
      <div class="chat-sug" id="chatSug"></div>
      <form class="chat-form" id="chatForm" autocomplete="off">
        <input id="chatInput" type="text" placeholder="Escribe tu pregunta…" aria-label="Tu pregunta" maxlength="120">
        <button type="submit" class="btn btn--solid">Enviar</button>
      </form>
    </section>`;
  document.body.append(root);

  const fab = root.querySelector("#chatFab"), panel = root.querySelector("#chatPanel");
  const log = root.querySelector("#chatLog"), input = root.querySelector("#chatInput");

  /** Añade un mensaje. El del usuario va con textContent (seguro); el del bot con innerHTML (viene de KB). */
  function say(who, content) {
    const p = document.createElement("p");
    p.className = "msg msg--" + who;
    who === "user" ? (p.textContent = content) : (p.innerHTML = content);
    log.append(p); log.scrollTop = log.scrollHeight;
  }
  function toggle(open) {
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    if (open) { if (!log.children.length) say("bot", "Hola 👋 Soy el asistente de esta web. Pregúntame lo que quieras (o pulsa una sugerencia)."); input.focus(); }
    else fab.focus();
  }
  fab.addEventListener("click", () => toggle(panel.hidden));
  root.querySelector("#chatClose").addEventListener("click", () => toggle(false));
  // Escape cierra el panel (accesibilidad de teclado).
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });

  function ask(text) {
    text = text.trim(); if (!text) return;
    say("user", text);
    // Pequeño retardo para que se sienta como conversación.
    setTimeout(() => say("bot", answer(text)), 250);
  }
  root.querySelector("#chatForm").addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); input.value = ""; });

  const sug = root.querySelector("#chatSug");
  SUGGESTIONS.forEach((s) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = s;
    b.addEventListener("click", () => ask(s));
    sug.append(b);
  });
}
