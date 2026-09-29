/* =========================================================
   config.js — ÚNICO sitio donde tocas datos "de tu cuenta"
   ---------------------------------------------------------
   Todos los demás módulos importan este objeto. Así, si
   cambias de usuario de GitHub o de servicio de formulario,
   editas UNA línea y no buscas por todo el código.
   ========================================================= */
export const CONFIG = {
  // Tu usuario de GitHub (se usa para la API de repos y para los enlaces).
  GITHUB_USER: "01000001-1001000",

  // Nombre del repositorio donde subes ESTA web (para commits e issues).
  // TODO: cámbialo por el nombre real de tu repo.
  REPO: "portfolio",

  // Endpoint de Formspree: crea un formulario en https://formspree.io,
  // copia su URL ("https://formspree.io/f/xxxxxxx") y pégala aquí.
  // Si lo dejas vacío, el formulario cae al plan B: abrir tu correo (mailto).
  FORM_ENDPOINT: "",

  // Correo de destino del plan B (mailto). Sale del atributo data-mail del
  // formulario si existe; este valor es solo el respaldo.
  MAIL: "alhcasgar@alu.edu.gva.es",

  // Minutos que dura la sesión de la zona privada (demo).
  SESSION_MINUTES: 30,
};

// Helpers de URL derivados de la configuración (así no se repiten strings).
export const GH = {
  profile: `https://github.com/${CONFIG.GITHUB_USER}`,
  repo: `https://github.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO}`,
  api: "https://api.github.com",
};
