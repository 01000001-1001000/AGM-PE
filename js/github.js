/* =========================================================
   github.js — consumo de una API REAL externa (GitHub REST)
   ---------------------------------------------------------
   Endpoints públicos, sin token:
     GET /users/{user}/repos     → tus repositorios
     GET /repos/{user}/{repo}/commits → historial de commits
   Buenas prácticas incluidas (para explicarlas en la defensa):
   - Caché en sessionStorage (10 min): la API pública limita a
     60 peticiones/hora por IP; así no las malgastamos.
   - Estados: cargando / éxito / error (con enlace de respaldo).
   - Todo se pinta con textContent (nunca innerHTML con datos
     externos) para evitar XSS.
   ========================================================= */
import { CONFIG, GH } from "./config.js";

const TTL = 10 * 60 * 1000; // 10 minutos

/** fetch con caché temporal + tiempo máximo de espera (8 s). */
async function getJSON(url) {
  const key = "ah-cache:" + url;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) || "null");
    if (hit && Date.now() - hit.t < TTL) return hit.d;
  } catch (e) { /* caché corrupta: la ignoramos */ }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" }, signal: ctrl.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch (e) {}
    return data;
  } finally { clearTimeout(timer); }
}

/** Crea un elemento con clase y texto (atajo para no repetir código). */
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

/** Mensaje de error/vacío con enlace de respaldo. */
function fail(box, msg) {
  box.setAttribute("aria-busy", "false");
  box.replaceChildren();
  const p = el("p", "api-msg", msg + " ");
  const a = el("a", "", "Ver directamente en GitHub →");
  a.href = GH.profile; a.rel = "noopener";
  p.append(a); box.append(p);
}

/* ---------- Repositorios (trabajo.html) ---------- */
export async function renderRepos(box) {
  box.setAttribute("aria-busy", "true");
  try {
    const repos = (await getJSON(`${GH.api}/users/${CONFIG.GITHUB_USER}/repos?sort=updated&per_page=8`))
      .filter((r) => !r.fork).slice(0, 6);
    if (!repos.length) return fail(box, "Aún no hay repositorios públicos.");
    box.replaceChildren();
    repos.forEach((r) => {
      const card = el("a", "repo");
      card.href = r.html_url; card.rel = "noopener";
      card.append(el("strong", "", r.name));
      card.append(el("span", "repo-desc", r.description || "Sin descripción todavía."));
      const meta = el("span", "repo-meta");
      meta.append(el("i", "", r.language || "—"), el("i", "", "★ " + r.stargazers_count),
        el("i", "", "act. " + new Date(r.pushed_at).toLocaleDateString("es-ES")));
      card.append(meta);
      box.append(card);
    });
    box.setAttribute("aria-busy", "false");
  } catch (e) {
    fail(box, "No se pudo cargar la lista (límite de la API o sin conexión).");
  }
}

/* ---------- Commits (proceso.html): historial "leíble como un diario" ---------- */
export async function renderCommits(box) {
  box.setAttribute("aria-busy", "true");
  try {
    const commits = await getJSON(`${GH.api}/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO}/commits?per_page=12`);
    if (!commits.length) return fail(box, "Todavía no hay commits.");
    box.replaceChildren();
    commits.forEach((c) => {
      const li = el("li", "commit");
      const a = el("a", "sha", c.sha.slice(0, 7));
      a.href = c.html_url; a.rel = "noopener";
      // Solo la primera línea del mensaje (el "asunto" del commit).
      li.append(a, el("span", "msg", c.commit.message.split("\n")[0]),
        el("time", "when", new Date(c.commit.author.date).toLocaleDateString("es-ES")));
      box.append(li);
    });
    box.setAttribute("aria-busy", "false");
  } catch (e) {
    fail(box, "No se pudo leer el historial (¿el repositorio es público y el nombre en config.js es correcto?).");
  }
}
