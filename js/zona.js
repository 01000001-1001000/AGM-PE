/* =========================================================
   zona.js — login DEMO + zona interna con datos persistentes
   ---------------------------------------------------------
   ¡OJO, HONESTIDAD TÉCNICA! Una web estática no puede tener
   seguridad real: todo el código lo ve el visitante. Esto es
   una DEMO de flujo de autenticación (formulario → comprobación
   → sesión → zona protegida → cerrar sesión). En producción, la
   comprobación se haría en un servidor. Lo que SÍ mostramos bien:
   - No guardamos la contraseña en claro: comparamos un hash
     SHA-256 (con "sal") calculado con la Web Crypto API.
   - La sesión caduca (SESSION_MINUTES) y vive en sessionStorage.
   - Bloqueo temporal tras 5 intentos fallidos.
   - Estado real: la bitácora de estudio se guarda en localStorage
     por usuario y se puede exportar a JSON.
   Credenciales demo: invitado / DAM-2025
   ========================================================= */
import { CONFIG } from "./config.js";

const USER = "invitado";
// SHA-256 de "ah-demo-salt:DAM-2025" (calculado offline; ver docs/ADR-0005).
const HASH = "def1e51885a61875caebbbcd01b2bd54ce6c93ca9779fa1c8df2b94838cc367d";
const SESSION = "ah-session", LOCK = "ah-lock", NOTES = "ah-notes-" + USER;

/** SHA-256 → cadena hexadecimal, con la Web Crypto API del navegador. */
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- Sesión ---------- */
const getSession = () => {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION) || "null");
    return s && Date.now() < s.exp ? s : null;   // caducada → null
  } catch (e) { return null; }
};
const setSession = () => sessionStorage.setItem(SESSION, JSON.stringify({
  user: USER, at: Date.now(), exp: Date.now() + CONFIG.SESSION_MINUTES * 60000,
}));

/* ---------- Notas (estado persistente) ---------- */
const loadNotes = () => { try { return JSON.parse(localStorage.getItem(NOTES) || "[]"); } catch (e) { return []; } };
const saveNotes = (n) => { try { localStorage.setItem(NOTES, JSON.stringify(n)); } catch (e) {} };

export function initZona() {
  const $ = (id) => document.getElementById(id);
  const loginBox = $("loginBox"), zone = $("zone"), form = $("loginForm"), msg = $("loginMsg");
  if (!form) return;

  /** Alterna entre "pantalla de login" y "zona interna" según haya sesión. */
  function render() {
    const s = getSession();
    loginBox.hidden = !!s; zone.hidden = !s;
    if (s) { $("zoneUser").textContent = s.user; $("zoneSince").textContent = new Date(s.at).toLocaleTimeString("es-ES"); drawNotes(); }
  }

  /* ----- Login ----- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const lock = Number(sessionStorage.getItem(LOCK) || 0);
    if (Date.now() < lock) { msg.textContent = `Demasiados intentos. Espera ${Math.ceil((lock - Date.now()) / 1000)} s.`; return; }
    const u = $("lUser").value.trim(), p = $("lPass").value;
    const ok = u === USER && (await sha256("ah-demo-salt:" + p)) === HASH;
    if (ok) { sessionStorage.removeItem("ah-fails"); setSession(); msg.textContent = ""; form.reset(); render(); $("zoneTitle").focus(); return; }
    // Fallo: contamos intentos; al 5º bloqueamos 30 s.
    const fails = Number(sessionStorage.getItem("ah-fails") || 0) + 1;
    sessionStorage.setItem("ah-fails", fails);
    if (fails >= 5) { sessionStorage.setItem(LOCK, Date.now() + 30000); sessionStorage.setItem("ah-fails", 0); msg.textContent = "Bloqueado 30 s por demasiados intentos."; }
    else msg.textContent = `Usuario o contraseña incorrectos (${fails}/5).`;
  });
  $("logout").addEventListener("click", () => { sessionStorage.removeItem(SESSION); render(); $("lUser").focus(); });

  /* ----- Bitácora: alta, marcar hecha, borrar, filtrar, exportar ----- */
  let filter = "todas";
  function drawNotes() {
    const list = $("noteList"), notes = loadNotes();
    list.replaceChildren();
    notes.filter((n) => filter === "todas" || (filter === "hechas") === n.done).forEach((n) => {
      const li = document.createElement("li"); li.className = n.done ? "is-done" : "";
      const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = n.done; cb.setAttribute("aria-label", "Marcar como hecha");
      cb.addEventListener("change", () => { n.done = cb.checked; saveNotes(notes); drawNotes(); });
      const txt = document.createElement("span"); txt.textContent = n.text;   // textContent: seguro ante XSS
      const del = document.createElement("button"); del.type = "button"; del.textContent = "✕"; del.setAttribute("aria-label", "Borrar nota");
      del.addEventListener("click", () => { saveNotes(notes.filter((x) => x.id !== n.id)); drawNotes(); });
      li.append(cb, txt, del); list.append(li);
    });
    $("noteCount").textContent = `${notes.filter((n) => n.done).length}/${notes.length} completadas`;
  }
  $("noteForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const t = $("noteText").value.trim(); if (!t) return;
    const notes = loadNotes(); notes.unshift({ id: Date.now(), text: t.slice(0, 140), done: false });
    saveNotes(notes); $("noteText").value = ""; drawNotes();
  });
  document.querySelectorAll("[data-nfilter]").forEach((b) => b.addEventListener("click", () => { filter = b.dataset.nfilter; drawNotes(); }));
  $("noteExport").addEventListener("click", () => {
    // Blob + enlace temporal: descarga un JSON sin servidor.
    const url = URL.createObjectURL(new Blob([JSON.stringify(loadNotes(), null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "bitacora.json" });
    a.click(); URL.revokeObjectURL(url);
  });
  render();
}
