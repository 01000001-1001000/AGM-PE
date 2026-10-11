/* =========================================================
   main.js — punto de entrada (ES modules)
   ---------------------------------------------------------
   Carga solo lo que cada página necesita. Cada módulo
   comprueba si "su" HTML existe y, si no, no hace nada.
   Se carga con <script type="module">: es diferido por
   defecto (no bloquea el render → mejor Lighthouse).
   ========================================================= */
import { initTheme } from "./theme.js";
import { initPersonalize } from "./personalize.js";
import { initChatbot } from "./chatbot.js";
import { initProjects } from "./projects.js";
import { initContact } from "./contact.js";
import { initZona } from "./zona.js";
import { renderRepos, renderCommits } from "./github.js";
import { GH } from "./config.js";

/** Aísla errores: si un módulo falla, el resto de la web sigue. */
const safe = (fn) => { try { fn(); } catch (e) { console.error("[AH]", e); } };

safe(initTheme);
safe(initPersonalize);
safe(initChatbot);
safe(initProjects);
safe(initContact);
safe(initZona);

// APIs de GitHub: solo si la página tiene el contenedor.
const repos = document.getElementById("repos");
if (repos) renderRepos(repos);
const commits = document.getElementById("commits");
if (commits) renderCommits(commits);

// Enlaces a tu repositorio (se construyen desde config.js para no repetir la URL).
const links = { promptsLink: "/blob/main/docs/prompts-ia.md", issuesLink: "/issues" };
Object.entries(links).forEach(([id, path]) => { const a = document.getElementById(id); if (a) { a.href = GH.repo + path; a.rel = "noopener"; } });

// Globo 3D: carga PEREZOSA. Three.js pesa mucho, así que solo se
// descarga cuando el globo está a punto de entrar en pantalla.
const globe = document.getElementById("globe");
if (globe && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect();
      import("../globex.js").catch((e) => console.error("[globe]", e));
    }
  }, { rootMargin: "300px" });
  io.observe(globe);
}
