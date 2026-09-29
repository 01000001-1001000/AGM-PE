/* =========================================================
   projects.js — buscador + filtro por etiquetas (con estado)
   ---------------------------------------------------------
   Cada tarjeta lleva data-tags="python cli ..." y su texto.
   Estado que se recuerda (localStorage): etiqueta activa y
   texto de búsqueda. Se aplica a las tarjetas grandes y a la
   lista compacta "otras cosas que he hecho".
   ========================================================= */
const KEY = "ah-proj-filter";

/** Quita tildes y pasa a minúsculas: "Bajo Nível" → "bajo nivel". */
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function initProjects() {
  const input = document.getElementById("projSearch");
  const chips = [...document.querySelectorAll("[data-filter]")];
  const items = [...document.querySelectorAll("[data-tags]")];
  const count = document.getElementById("projCount");
  const empty = document.getElementById("projEmpty");
  if (!input || !items.length) return;

  // Estado inicial: lo guardado, o "todo" + búsqueda vacía.
  let state = { tag: "todo", q: "" };
  try { state = { ...state, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (e) {}

  function apply() {
    const q = norm(state.q.trim());
    let shown = 0;
    items.forEach((it) => {
      const tags = it.dataset.tags.split(" ");
      const okTag = state.tag === "todo" || tags.includes(state.tag);
      // Busca en el texto visible + etiquetas de la tarjeta.
      const okText = !q || norm(it.textContent + " " + it.dataset.tags).includes(q);
      it.hidden = !(okTag && okText);
      if (!it.hidden) shown++;
    });
    chips.forEach((c) => {
      const on = c.dataset.filter === state.tag;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", String(on));
    });
    if (count) count.textContent = `${shown} resultado${shown === 1 ? "" : "s"}`;
    if (empty) empty.hidden = shown !== 0;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  input.value = state.q;
  input.addEventListener("input", () => { state.q = input.value; apply(); });
  chips.forEach((c) => c.addEventListener("click", () => { state.tag = c.dataset.filter; apply(); }));
  const reset = document.getElementById("projReset");
  if (reset) reset.addEventListener("click", () => { state = { tag: "todo", q: "" }; input.value = ""; apply(); });
  apply();
}
