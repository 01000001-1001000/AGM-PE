/* =========================================================
   theme.js — modo oscuro / claro con persistencia
   ---------------------------------------------------------
   Idea: el tema vive en el atributo <html data-theme="...">.
   El CSS (extras.css) reacciona a ese atributo. Guardamos la
   elección en localStorage para recordarla entre páginas.
   El tema por defecto es OSCURO (es la identidad de la marca).
   ========================================================= */
const KEY = "ah-theme";

/** Lee el tema guardado (o "dark" si no hay nada / no hay storage). */
function stored() {
  try { return localStorage.getItem(KEY); } catch (e) { return null; }
}

/** Aplica el tema al <html> y actualiza el botón (texto accesible). */
export function applyTheme(theme, btn) {
  document.documentElement.dataset.theme = theme;
  // <meta name="theme-color"> tiñe la barra del navegador en móvil.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f3f3f6" : "#0b0b0d");
  if (btn) {
    btn.setAttribute("aria-pressed", String(theme === "light"));
    btn.setAttribute("aria-label", theme === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
  }
}

export function initTheme() {
  const btn = document.getElementById("themeToggle");
  applyTheme(stored() || "dark", btn);
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next, btn);
    try { localStorage.setItem(KEY, next); } catch (e) { /* modo privado: no pasa nada */ }
  });
}
